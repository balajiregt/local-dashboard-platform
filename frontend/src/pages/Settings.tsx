import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Save,
  Refresh,
  GitHub,
  Link,
  Delete,
  Info,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [config, setConfig] = useState({
    repository: process.env.REACT_APP_GITHUB_REPO || '',
    refreshInterval: 30,
    autoRefresh: true,
    showPassedTests: true,
    showSkippedTests: true,
    maxReportsDisplay: 50,
  });
  
  const [saved, setSaved] = useState(false);

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // In a real implementation, this would save to localStorage or API
    console.log('Saving configuration:', config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    // Test GitHub API connection
    console.log('Testing GitHub connection...');
  };

  const repoOwner = config.repository.split('/')[0];
  const repoName = config.repository.split('/')[1];
  const dashboardUrl = `https://${repoOwner}.github.io/${repoName}`;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Configure your Playwright Reports dashboard settings and GitHub integration.
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaved(false)}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* GitHub Configuration */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                GitHub Configuration
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="GitHub Repository"
                  value={config.repository}
                  onChange={(e) => handleConfigChange('repository', e.target.value)}
                  placeholder="owner/repository-name"
                  helperText="Format: owner/repository-name (e.g., myteam/playwright-reports)"
                  sx={{ mb: 2 }}
                />
                
                {config.repository && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Dashboard URL:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={<Link />}
                        label={dashboardUrl}
                        component="a"
                        href={dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<GitHub />}
                  onClick={handleTestConnection}
                  disabled={!config.repository}
                >
                  Test Connection
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Display Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Refresh Interval (seconds)"
                  value={config.refreshInterval}
                  onChange={(e) => handleConfigChange('refreshInterval', parseInt(e.target.value))}
                  inputProps={{ min: 10, max: 300 }}
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoRefresh}
                      onChange={(e) => handleConfigChange('autoRefresh', e.target.checked)}
                    />
                  }
                  label="Auto-refresh dashboard"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.showPassedTests}
                      onChange={(e) => handleConfigChange('showPassedTests', e.target.checked)}
                    />
                  }
                  label="Show passed tests in reports"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.showSkippedTests}
                      onChange={(e) => handleConfigChange('showSkippedTests', e.target.checked)}
                    />
                  }
                  label="Show skipped tests in reports"
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="Max reports to display"
                  value={config.maxReportsDisplay}
                  onChange={(e) => handleConfigChange('maxReportsDisplay', parseInt(e.target.value))}
                  inputProps={{ min: 10, max: 200 }}
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CLI Setup Instructions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CLI Setup Instructions
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  To upload test reports to this dashboard, install and configure the CLI tool on your local machine.
                </Typography>
              </Alert>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  1. Install the CLI tool
                </Typography>
                <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" fontFamily="monospace">
                    npm install -g playwright-reports-cli
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  2. Initialize configuration
                </Typography>
                <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" fontFamily="monospace">
                    playwright-reports init --repo {config.repository || 'owner/repo'}
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  3. Upload test results
                </Typography>
                <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" fontFamily="monospace">
                    npx playwright test --trace=on
                    <br />
                    playwright-reports upload
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="textSecondary">
                Make sure to set your GITHUB_TOKEN environment variable or configure it during initialization.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Environment Variables */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Environment Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="GitHub Repository" 
                    secondary={process.env.REACT_APP_GITHUB_REPO || 'Not configured'}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={process.env.REACT_APP_GITHUB_REPO ? 'Set' : 'Missing'} 
                      color={process.env.REACT_APP_GITHUB_REPO ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="GitHub Token" 
                    secondary={process.env.REACT_APP_GITHUB_TOKEN ? 'Configured' : 'Not configured'}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={process.env.REACT_APP_GITHUB_TOKEN ? 'Set' : 'Missing'} 
                      color={process.env.REACT_APP_GITHUB_TOKEN ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Build Mode" 
                    secondary={process.env.NODE_ENV || 'development'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 