import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

const menuItems = [
  { text: 'Inicio', icon: <HomeIcon />, path: '/' },
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Analíticas', icon: <AnalyticsIcon />, path: '/dashboard' },
  { text: 'Historial', icon: <HistoryIcon />, path: '/historial' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        bgcolor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#667eea',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2em',
          }}
        >
          T
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
          InvestPanel
        </Typography>
      </Box>

      <Divider />

      <List sx={{ mt: 2, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                bgcolor: isActive ? '#f3f4f6' : 'transparent',
                color: isActive ? '#667eea' : '#6b7280',
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.95em',
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Admin User
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              admin@tesis.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Sidebar;