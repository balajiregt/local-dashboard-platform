import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tab,
  Tabs,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BugReport,
  Lightbulb,
  People,
  Code,
  Timeline,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Science,
  Psychology,
  Insights as InsightsIcon,
  CalendarToday,
  Speed,
  Build,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { ReportSummary, ProcessedTestReport } from '../types';
import { getLocalDataService } from '../services/local';
import { getGitHubService } from '../services/github';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Insights: React.FC = () => {
  const [reports, setReports] = useState<ProcessedTestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_GITHUB_REPO;
      const service = isLocalDev ? getLocalDataService() : getGitHubService();
      
      // Get all reports and then filter by time range
      const reportsIndex = await service.getReportsIndex();
      const fullReports: ProcessedTestReport[] = [];
      
      for (const reportSummary of reportsIndex.slice(0, 20)) { // Load last 20 reports
        const report = await service.getReport(reportSummary.id);
        if (report) {
          fullReports.push(report);
        }
      }
      
      setReports(fullReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Analytics calculations
  const analytics = React.useMemo(() => {
    if (!reports.length) return null;

    // Test Intent Distribution
    const intentDistribution = reports.reduce((acc, report) => {
      const intent = report.execution.intent.purpose || 'unknown';
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Developer Activity
    const developerActivity = reports.reduce((acc, report) => {
      const dev = report.execution.developer || 'Unknown';
      if (!acc[dev]) {
        acc[dev] = { tests: 0, passed: 0, failed: 0, confidence: [] };
      }
      acc[dev].tests += report.summary.total;
      acc[dev].passed += report.summary.passed;
      acc[dev].failed += report.summary.failed;
      if (report.execution.insights.confidence) {
        acc[dev].confidence.push(report.execution.insights.confidence);
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate average confidence per developer
    Object.keys(developerActivity).forEach(dev => {
      const confidences = developerActivity[dev].confidence;
      developerActivity[dev].avgConfidence = confidences.length > 0 
        ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length 
        : 0;
    });

    // Expectation vs Reality Analysis
    const expectationAnalysis = reports.reduce((acc, report) => {
      acc.total += report.summary.total;
      acc.expectedFails += report.summary.expectedFails;
      acc.unexpectedFails += report.summary.unexpectedFails;
      acc.expectedPasses += report.summary.expectedPasses;
      acc.unexpectedPasses += report.summary.unexpectedPasses;
      return acc;
    }, { total: 0, expectedFails: 0, unexpectedFails: 0, expectedPasses: 0, unexpectedPasses: 0 });

    // Learning Insights Collection
    const allLearnings = reports.flatMap(report => 
      report.execution.insights.learnings || []
    ).filter(learning => learning && learning.length > 0);

    const allSurprises = reports.flatMap(report => 
      report.execution.insights.surprises || []
    ).filter(surprise => surprise && surprise.length > 0);

    const allNextSteps = reports.flatMap(report => 
      report.execution.insights.nextSteps || []
    ).filter(step => step && step.length > 0);

    // Branch Activity
    const branchActivity = reports.reduce((acc, report) => {
      const branch = report.execution.branch || 'unknown';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Test Duration Trends
    const durationTrends = reports.map(report => ({
      date: new Date(report.execution.timestamp).toLocaleDateString(),
      duration: report.execution.duration / 1000, // Convert to seconds
      tests: report.summary.total,
      avgDurationPerTest: (report.execution.duration / report.summary.total) / 1000
    }));

    return {
      intentDistribution,
      developerActivity,
      expectationAnalysis,
      allLearnings: allLearnings.slice(0, 10), // Top 10
      allSurprises: allSurprises.slice(0, 10),
      allNextSteps: allNextSteps.slice(0, 10),
      branchActivity,
      durationTrends: durationTrends.slice(-10), // Last 10 runs
    };
  }, [reports]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No reports available for insights analysis.
      </Alert>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const intentChartData = Object.entries(analytics.intentDistribution).map(([intent, count]) => ({
    name: intent,
    value: count,
  }));

  const expectationMatchRate = analytics.expectationAnalysis.total > 0 
    ? ((analytics.expectationAnalysis.expectedFails + analytics.expectationAnalysis.expectedPasses) / analytics.expectationAnalysis.total * 100).toFixed(1)
    : '0';

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsightsIcon />
          Test Intelligence Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover patterns, learnings, and intelligence from your test execution data
        </Typography>
        
        <Box mt={2} display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last Day</MenuItem>
              <MenuItem value="7d">Last Week</MenuItem>
              <MenuItem value="30d">Last Month</MenuItem>
              <MenuItem value="90d">Last 3 Months</MenuItem>
            </Select>
          </FormControl>
          
          <Chip label={`${reports.length} Reports Analyzed`} color="primary" />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Team Intelligence" icon={<Psychology />} />
          <Tab label="Test Patterns" icon={<Timeline />} />
          <Tab label="Learnings & Insights" icon={<Lightbulb />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{expectationMatchRate}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expectation Match Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{analytics.expectationAnalysis.unexpectedFails}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unexpected Failures
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{Object.keys(analytics.developerActivity).length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Developers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Science />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{analytics.allLearnings.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Learning Insights
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Intent Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Test Intent Distribution" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={intentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {intentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Duration Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Test Duration Trends" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.durationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgDurationPerTest" stroke="#8884d8" name="Avg Duration/Test (s)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Expectation vs Reality */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Expectation vs Reality Analysis" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Expected Outcomes</Typography>
                    <Box mb={2}>
                      <Typography variant="body2">Expected Passes</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(analytics.expectationAnalysis.expectedPasses / analytics.expectationAnalysis.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                      <Typography variant="body2" mt={1}>
                        {analytics.expectationAnalysis.expectedPasses} tests
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Expected Failures</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(analytics.expectationAnalysis.expectedFails / analytics.expectationAnalysis.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="warning"
                      />
                      <Typography variant="body2" mt={1}>
                        {analytics.expectationAnalysis.expectedFails} tests
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Unexpected Outcomes</Typography>
                    <Box mb={2}>
                      <Typography variant="body2">Unexpected Failures</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(analytics.expectationAnalysis.unexpectedFails / analytics.expectationAnalysis.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="error"
                      />
                      <Typography variant="body2" mt={1}>
                        {analytics.expectationAnalysis.unexpectedFails} tests (surprises!)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Unexpected Passes</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(analytics.expectationAnalysis.unexpectedPasses / analytics.expectationAnalysis.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="info"
                      />
                      <Typography variant="body2" mt={1}>
                        {analytics.expectationAnalysis.unexpectedPasses} tests (pleasant surprises!)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Team Intelligence Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Developer Performance & Confidence" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Developer</TableCell>
                        <TableCell align="right">Total Tests</TableCell>
                        <TableCell align="right">Pass Rate</TableCell>
                        <TableCell align="right">Avg Confidence</TableCell>
                        <TableCell align="right">Test Sessions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(analytics.developerActivity).map(([dev, stats]) => (
                        <TableRow key={dev}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {dev.charAt(0).toUpperCase()}
                              </Avatar>
                              {dev}
                            </Box>
                          </TableCell>
                          <TableCell align="right">{stats.tests}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${((stats.passed / stats.tests) * 100).toFixed(1)}%`}
                              color={stats.passed / stats.tests > 0.8 ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress 
                                variant="determinate" 
                                value={stats.avgConfidence * 10}
                                sx={{ width: 50, height: 6 }}
                              />
                              {stats.avgConfidence.toFixed(1)}/10
                            </Box>
                          </TableCell>
                          <TableCell align="right">{stats.confidence.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Branch Activity" />
              <CardContent>
                <List>
                  {Object.entries(analytics.branchActivity)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([branch, count]) => (
                    <ListItem key={branch}>
                      <ListItemIcon>
                        <Code />
                      </ListItemIcon>
                      <ListItemText 
                        primary={branch}
                        secondary={`${count} test session${count !== 1 ? 's' : ''}`}
                      />
                      <Chip label={count} size="small" />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Surprises" />
              <CardContent>
                <List>
                  {analytics.allSurprises.slice(0, 5).map((surprise, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={surprise} />
                      </ListItem>
                      {index < analytics.allSurprises.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Test Patterns Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Test Execution Patterns" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.durationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tests" fill="#8884d8" name="Number of Tests" />
                    <Bar dataKey="duration" fill="#82ca9d" name="Total Duration (s)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Learnings & Insights Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Key Learnings" 
                avatar={<Lightbulb color="primary" />}
              />
              <CardContent>
                <List>
                  {analytics.allLearnings.map((learning, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={learning} />
                      </ListItem>
                      {index < analytics.allLearnings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Next Steps" 
                avatar={<TrendingUp color="success" />}
              />
              <CardContent>
                <List>
                  {analytics.allNextSteps.map((step, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={step} />
                      </ListItem>
                      {index < analytics.allNextSteps.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Surprises" 
                avatar={<Warning color="warning" />}
              />
              <CardContent>
                <List>
                  {analytics.allSurprises.map((surprise, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={surprise} />
                      </ListItem>
                      {index < analytics.allSurprises.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Insights; 