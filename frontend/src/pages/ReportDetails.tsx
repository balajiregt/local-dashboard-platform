import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  Link,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  CheckCircle,
  Error,
  Schedule,
  Person,
  CalendarToday,
  BugReport,
  Lightbulb,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { ProcessedTestReport } from '../types';
import { getGitHubService } from '../services/github';
import { getLocalDataService } from '../services/local';
import { formatDistanceToNow, format } from 'date-fns';

const ReportDetails: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ProcessedTestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
    }
  }, [reportId]);

  const loadReport = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use local data service in development, GitHub service in production
      const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_GITHUB_REPO;
      
      if (isLocalDev) {
        const localService = getLocalDataService();
        const reportData = await localService.getReport(id);
        setReport(reportData);
      } else {
        const githubService = getGitHubService();
        const reportData = await githubService.getReport(id);
        setReport(reportData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'skipped': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'skipped': return <Schedule />;
      default: return <Schedule />;
    }
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
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="info">Report not found</Alert>
      </Box>
    );
  }

  const failedTests = report.results.filter(r => r.status === 'failed');
  const passRate = report.summary.total > 0 ? 
    ((report.summary.passed / report.summary.total) * 100).toFixed(1) : '0';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Test Report #{report.execution.reportNumber}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            icon={<Person />}
            label={report.execution.developer} 
            variant="outlined" 
          />
          {report.execution.branch && (
            <Chip 
              label={report.execution.branch} 
              variant="outlined" 
            />
          )}
          <Chip 
            icon={<CalendarToday />}
            label={formatDistanceToNow(report.execution.timestamp, { addSuffix: true })} 
            variant="outlined" 
          />
          <Chip 
            label={report.execution.environment} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tests
              </Typography>
              <Typography variant="h4">
                {report.summary.total}
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
              <Typography 
                variant="h4" 
                color={parseFloat(passRate) >= 80 ? 'success.main' : 'error.main'}
              >
                {passRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Duration
              </Typography>
              <Typography variant="h4">
                {Math.round(report.execution.duration / 1000)}s
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
                {report.summary.failed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Intent */}
      {report.execution.intent && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Execution Intent
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Purpose</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {report.execution.intent.purpose}
                </Typography>
                
                {report.execution.intent.description && (
                  <>
                    <Typography variant="body2" color="textSecondary">Description</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {report.execution.intent.description}
                    </Typography>
                  </>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">Expected Failures</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {report.execution.intent.expectFailures ? 'Yes' : 'No'}
                </Typography>
                
                {report.execution.intent.goals.length > 0 && (
                  <>
                    <Typography variant="body2" color="textSecondary">Goals</Typography>
                    <Typography variant="body1">
                      {report.execution.intent.goals.join(', ')}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Execution Insights */}
      {report.execution.insights && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Execution Insights
              <Chip 
                label={`Confidence: ${report.execution.insights.confidence}/10`} 
                size="small" 
                sx={{ ml: 2 }}
                color={report.execution.insights.confidence >= 7 ? 'success' : 'warning'}
              />
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Expected Behavior
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {report.execution.insights.expectedBehavior}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Actual Behavior
                </Typography>
                <Typography variant="body2">
                  {report.execution.insights.actualBehavior}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {report.execution.insights.surprises.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Surprises
                    </Typography>
                    <List dense>
                      {report.execution.insights.surprises.map((surprise, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={surprise} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {report.execution.insights.learnings.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Learnings
                    </Typography>
                    <List dense>
                      {report.execution.insights.learnings.map((learning, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={learning} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {report.execution.insights.nextSteps.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Next Steps
                    </Typography>
                    <List dense>
                      {report.execution.insights.nextSteps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results ({report.results.length} tests)
          </Typography>
          
          {/* Failed Tests First */}
          {failedTests.length > 0 && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1" color="error">
                  Failed Tests ({failedTests.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Error</TableCell>
                        <TableCell>Assets</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {failedTests.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getStatusIcon(test.status)}
                              <Typography sx={{ ml: 1 }}>{test.testName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{test.duration}ms</TableCell>
                          <TableCell>
                            {test.error && (
                              <Typography 
                                variant="body2" 
                                color="error" 
                                sx={{ 
                                  maxWidth: 300, 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis' 
                                }}
                              >
                                {test.error}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {test.screenshots.length > 0 && (
                              <Chip 
                                label={`${test.screenshots.length} screenshot(s)`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                            {test.traceFile && (
                              <Chip 
                                label="Trace" 
                                size="small" 
                                variant="outlined" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* All Tests */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                All Test Results ({report.results.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Expected vs Actual</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.results.map((test, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(test.status)}
                            label={test.status.toUpperCase()}
                            color={getStatusColor(test.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{test.testName}</TableCell>
                        <TableCell>{test.duration}ms</TableCell>
                        <TableCell>
                          {test.expectedOutcome && test.actualOutcome && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={`Expected: ${test.expectedOutcome}`} 
                                size="small" 
                                variant="outlined" 
                              />
                              <Chip 
                                label={`Actual: ${test.actualOutcome}`} 
                                size="small" 
                                color={test.outcomeMatch ? 'success' : 'error'}
                                variant="outlined" 
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {test.traceFile && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => window.open(`/mock-data/reports/${reportId}/assets/${test.traceFile}`, '_blank')}
                              >
                                View Trace
                              </Button>
                            )}
                            {test.screenshots?.length > 0 && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => window.open(`/mock-data/reports/${reportId}/assets/${test.screenshots[0]}`, '_blank')}
                              >
                                View Screenshot
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportDetails; 