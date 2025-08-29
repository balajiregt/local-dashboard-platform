import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Schedule,
  PlayArrow,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface ProcessedTestReport {
  execution: {
    id: string;
    developer: string;
    timestamp: Date;
    branch?: string;
    environment: string;
    duration: number;
    [key: string]: any; // Allow additional properties
  };
  results: Array<{
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    screenshots: string[];
    traceFile?: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    [key: string]: any; // Allow additional properties
  };
}

interface ReportCardProps {
  report: ProcessedTestReport;
  onViewDetails: () => void;
}

const SimpleReportCard: React.FC<ReportCardProps> = ({ report, onViewDetails }) => {
  const { execution, summary } = report;

  const getStatusColor = () => {
    if (summary.failed > 0) return 'error';
    if (summary.skipped > 0) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (summary.failed > 0) return <Error />;
    if (summary.skipped > 0) return <Schedule />;
    return <CheckCircle />;
  };

  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  return (
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={onViewDetails}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              Test Run #{execution.id.split('-').pop()}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {execution.developer} • {execution.branch || 'main'} • {execution.environment}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDistanceToNow(execution.timestamp)} ago
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon()}
            label={`${summary.passed}/${summary.total} passed`}
            color={getStatusColor()}
            size="small"
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Total</Typography>
            <Typography variant="h6">{summary.total}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Passed</Typography>
            <Typography variant="h6" color="success.main">{summary.passed}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Failed</Typography>
            <Typography variant="h6" color="error.main">{summary.failed}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Pass Rate</Typography>
            <Typography variant="h6">{passRate}%</Typography>
          </Grid>
        </Grid>

        {/* Show enhanced insights if available */}
        {execution.intent && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Purpose:</strong> {execution.intent.purpose}
            </Typography>
            {execution.intent.description && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                "{execution.intent.description}"
              </Typography>
            )}
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Duration: {Math.round(execution.duration / 1000)}s
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlayArrow />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            View Details
          </Button>
        </Box>

        {/* Show trace files count if available */}
        {report.results.some(r => r.traceFile) && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`${report.results.filter(r => r.traceFile).length} trace files available`}
              size="small"
              variant="outlined"
              color="info"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleReportCard; 