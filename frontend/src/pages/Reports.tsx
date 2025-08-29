import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Delete,
  Download,
  Share,
  BugReport,
  CheckCircle,
  Warning,
  Error,
  Code,
  CalendarToday,
  Person,
  Assignment,
  ExpandMore,
  Refresh,
  Sort,
} from '@mui/icons-material';
import { ReportSummary, ProcessedTestReport } from '../types';
import { getLocalDataService } from '../services/local';
import { getGitHubService } from '../services/github';
import { formatDistanceToNow } from 'date-fns';

interface FilterState {
  search: string;
  developer: string;
  branch: string;
  environment: string;
  intent: string;
  status: string;
  dateRange: string;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    developer: '',
    branch: '',
    environment: '',
    intent: '',
    status: '',
    dateRange: '30d',
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_GITHUB_REPO;
      const service = isLocalDev ? getLocalDataService() : getGitHubService();
      
      const reportsData = await service.getReportsIndex();
      setReports(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(report => 
        report.id.toLowerCase().includes(searchLower) ||
        report.developer?.toLowerCase().includes(searchLower) ||
        report.branch?.toLowerCase().includes(searchLower)
      );
    }

    // Developer filter
    if (filters.developer) {
      filtered = filtered.filter(report => report.developer === filters.developer);
    }

    // Branch filter
    if (filters.branch) {
      filtered = filtered.filter(report => report.branch === filters.branch);
    }

    // Environment filter
    if (filters.environment) {
      filtered = filtered.filter(report => report.environment === filters.environment);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(report => {
        if (filters.status === 'passed') return report.failed === 0;
        if (filters.status === 'failed') return report.failed > 0;
        if (filters.status === 'mixed') return report.failed > 0 && report.passed > 0;
        return true;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange.replace('d', ''));
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(report => new Date(report.timestamp) >= cutoff);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredReports(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (report: ReportSummary) => {
    if (report.failed > 0) return 'error';
    if (report.skipped > 0) return 'warning';
    return 'success';
  };

  const getStatusIcon = (report: ReportSummary) => {
    if (report.failed > 0) return <Error color="error" />;
    if (report.skipped > 0) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  const getUniqueValues = (key: keyof ReportSummary) => {
    return [...new Set(reports.map(report => report[key]).filter(Boolean))];
  };

  const handleDeleteReport = async (reportId: string) => {
    // Implement delete functionality
    setDeleteDialogOpen(false);
    setSelectedReport(null);
    // Refresh reports after deletion
    await loadReports();
  };

  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filteredReports.length / pageSize);

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

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment />
          Test Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse, filter, and manage your test execution reports
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Filters & Search" 
          action={
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh Reports">
                <IconButton onClick={loadReports}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button 
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
                size="small"
              >
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Reports"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Developer</InputLabel>
                <Select
                  value={filters.developer}
                  label="Developer"
                  onChange={(e) => handleFilterChange('developer', e.target.value)}
                >
                  <MenuItem value="">All Developers</MenuItem>
                  {getUniqueValues('developer').map(dev => (
                    <MenuItem key={dev} value={dev}>{dev}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  value={filters.branch}
                  label="Branch"
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {getUniqueValues('branch').map(branch => (
                    <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Environment</InputLabel>
                <Select
                  value={filters.environment}
                  label="Environment"
                  onChange={(e) => handleFilterChange('environment', e.target.value)}
                >
                  <MenuItem value="">All Environments</MenuItem>
                  {getUniqueValues('environment').map(env => (
                    <MenuItem key={env} value={env}>{env}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="passed">All Passed</MenuItem>
                  <MenuItem value="failed">Has Failures</MenuItem>
                  <MenuItem value="mixed">Mixed Results</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={filters.dateRange}
                  label="Period"
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <MenuItem value="1d">1 Day</MenuItem>
                  <MenuItem value="7d">7 Days</MenuItem>
                  <MenuItem value="30d">30 Days</MenuItem>
                  <MenuItem value="90d">90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box mt={2} display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredReports.length} of {reports.length} reports
            </Typography>
            {Object.values(filters).some(v => v && v !== 'all' && v !== '30d') && (
              <Button 
                size="small" 
                onClick={() => setFilters({
                  search: '',
                  developer: '',
                  branch: '',
                  environment: '',
                  intent: '',
                  status: '',
                  dateRange: '30d',
                })}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {paginatedReports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': { boxShadow: 4 }
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(report)}
                      <Typography variant="h6" noWrap>
                        Report #{report.id.slice(-8)}
                      </Typography>
                    </Box>
                  }
                  subheader={formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                  action={
                    <Chip 
                      label={report.environment || 'local'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  }
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <Person fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{report.developer || 'Unknown'}</Typography>
                    </Box>
                    
                    {report.branch && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Code fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {report.branch}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" gap={1}>
                      <Chip 
                        label={`${report.passed} passed`} 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                      {report.failed > 0 && (
                        <Chip 
                          label={`${report.failed} failed`} 
                          size="small" 
                          color="error"
                          variant="outlined"
                        />
                      )}
                      {report.skipped > 0 && (
                        <Chip 
                          label={`${report.skipped} skipped`} 
                          size="small" 
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Duration: {Math.round(report.duration / 1000)}s | Total: {report.totalTests} tests
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/report/${report.id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton size="small" color="primary">
                    <Download />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <Share />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSelectedReport(report.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Developer</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Environment</TableCell>
                  <TableCell align="right">Tests</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Chip 
                        icon={getStatusIcon(report)}
                        label={report.failed > 0 ? 'Failed' : 'Passed'}
                        color={getStatusColor(report)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {report.id.slice(-12)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {(report.developer || 'U').charAt(0)}
                        </Avatar>
                        {report.developer || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={report.branch || 'main'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={report.environment || 'local'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {report.passed}
                        {report.failed > 0 && <span style={{ color: 'red' }}> / {report.failed}</span>}
                        {report.skipped > 0 && <span style={{ color: 'orange' }}> / {report.skipped}</span>}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(report.duration / 1000)}s
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => navigate(`/report/${report.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Download />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setSelectedReport(report.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this test report? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedReport && handleDeleteReport(selectedReport)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {filteredReports.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No reports found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Try adjusting your filters or upload some test results
              </Typography>
              <Button variant="contained" onClick={loadReports}>
                Refresh Reports
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Reports; 