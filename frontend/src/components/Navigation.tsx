import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Settings as SettingsIcon,
  GitHub,
  Dashboard as DashboardIcon,
  MoreVert,
  Insights as InsightsIcon,
  Assignment as ReportsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" sx={{ mb: 0 }}>
      <Toolbar>
        <PlayArrow sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Playwright Trace Intelligence
          <Chip 
            label="Beta" 
            size="small" 
            color="secondary" 
            sx={{ ml: 1, fontSize: '0.7rem' }}
          />
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={() => handleNavigation('/')}
            variant={isActive('/') || isActive('/dashboard') ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
          
          <Button
            color="inherit"
            startIcon={<ReportsIcon />}
            onClick={() => handleNavigation('/reports')}
            variant={isActive('/reports') ? 'outlined' : 'text'}
          >
            Reports
          </Button>
          
          <Button
            color="inherit"
            startIcon={<InsightsIcon />}
            onClick={() => handleNavigation('/insights')}
            variant={isActive('/insights') ? 'outlined' : 'text'}
          >
            Insights
          </Button>
          
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => handleNavigation('/settings')}
            variant={isActive('/settings') ? 'outlined' : 'text'}
          >
            Settings
          </Button>
          
          <Button
            color="inherit"
            startIcon={<GitHub />}
            href="https://github.com/playwright-ai-debugger/platform"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Button>
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="menu"
            aria-controls="mobile-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="mobile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'mobile-menu-button',
            }}
          >
            <MenuItem 
              onClick={() => handleNavigation('/')}
              selected={isActive('/') || isActive('/dashboard')}
            >
              <DashboardIcon sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem 
              onClick={() => handleNavigation('/reports')}
              selected={isActive('/reports')}
            >
              <ReportsIcon sx={{ mr: 1 }} />
              Reports
            </MenuItem>
            <MenuItem 
              onClick={() => handleNavigation('/insights')}
              selected={isActive('/insights')}
            >
              <InsightsIcon sx={{ mr: 1 }} />
              Insights
            </MenuItem>
            <MenuItem 
              onClick={() => handleNavigation('/settings')}
              selected={isActive('/settings')}
            >
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem 
              component="a" 
              href="https://github.com/playwright-ai-debugger/platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub sx={{ mr: 1 }} />
              GitHub
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 