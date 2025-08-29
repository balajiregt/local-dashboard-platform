import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ReportSummary } from '../types';
import { getGitHubService } from '../services/github';
import { getLocalDataService } from '../services/local';
import SimpleReportCard from '../components/SimpleReportCard';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use local data service in development, GitHub service in production
      const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_GITHUB_REPO;
      
      if (isLocalDev) {
        const localService = getLocalDataService();
        const reportsData = await localService.getReportsIndex();
        setReports(reportsData);
      } else {
        const githubService = getGitHubService();
        const reportsData = await githubService.getReportsIndex();
        setReports(reportsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (summary: ReportSummary['summary']) => {
    if (summary.failed > 0) return 'error';
    if (summary.skipped > 0) return 'warning';
    return 'success';
  };

  const getStatusText = (summary: ReportSummary['summary']) => {
    if (summary.failed > 0) return 'FAILED';
    if (summary.skipped > 0) return 'PARTIAL';
    return 'PASSED';
  };

  const calculatePassRate = (summary: ReportSummary['summary']) => {
    if (summary.total === 0) return 0;
    return Math.round((summary.passed / summary.total) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  const totalTests = reports.reduce((sum, report) => sum + report.summary.total, 0);
  const totalPassed = reports.reduce((sum, report) => sum + report.summary.passed, 0);
  const totalFailed = reports.reduce((sum, report) => sum + report.summary.failed, 0);
  const overallPassRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Playwright Test Reports Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">
                {reports.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tests
              </Typography>
              <Typography variant="h4">
                {totalTests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pass Rate
              </Typography>
              <Typography variant="h4" color={overallPassRate >= 80 ? 'success.main' : 'error.main'}>
                {overallPassRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed Tests
              </Typography>
              <Typography variant="h4" color="error.main">
                {totalFailed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Test Reports
          </Typography>
          
          {reports.length === 0 ? (
            <Alert severity="info">
              No test reports found. Upload your first report using the CLI tool.
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Developer</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Tests</TableCell>
                    <TableCell>Pass Rate</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      hover 
                      onClick={() => navigate(`/report/${report.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Chip
                          label={getStatusText(report.summary)}
                          color={getStatusColor(report.summary)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {report.developer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {report.branch ? (
                          <Chip label={report.branch} size="small" variant="outlined" />
                        ) : (
                          <Typography color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.summary.passed}/{report.summary.total}
                          {report.summary.failed > 0 && (
                            <Typography component="span" color="error.main">
                              {' '}({report.summary.failed} failed)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={calculatePassRate(report.summary) >= 80 ? 'success.main' : 'error.main'}>
                          {calculatePassRate(report.summary)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Report Cards with Details */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          📊 Detailed Reports with Trace Files
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Click any report to view execution insights, trace files, and detailed test results
        </Typography>
        
        {reports.map((report) => (
          <DetailedReportCard key={report.id} reportId={report.id} />
        ))}
      </Box>
    </Box>
  );
};

// Component to fetch and display detailed report data
const DetailedReportCard: React.FC<{ reportId: string }> = ({ reportId }) => {
  const navigate = useNavigate();
  const [detailedReport, setDetailedReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDetailedReport = async () => {
      try {
        const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_GITHUB_REPO;
        
        let reportData;
        if (isLocalDev) {
          const localService = getLocalDataService();
          reportData = await localService.getReport(reportId);
        } else {
          const githubService = getGitHubService();
          reportData = await githubService.getReport(reportId);
        }
        
        setDetailedReport(reportData);
      } catch (error) {
        console.warn(`Failed to load detailed report ${reportId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedReport();
  }, [reportId]);

  if (loading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Loading report details...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!detailedReport) {
    return null;
  }

  return (
    <SimpleReportCard
      report={detailedReport}
      onViewDetails={() => navigate(`/report/${reportId}`)}
    />
  );
};

export default Dashboard; 