import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AnalyticsIcon from '@mui/icons-material/Analytics';

function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <AnalyticsIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Apoyo a la Decisión
        </Typography>
        <Button color="inherit" component={Link} to="/">Inicio</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/historial">Historial</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;