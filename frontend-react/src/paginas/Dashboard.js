import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Dashboard() {
  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1f2937' }}>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" sx={{ color: '#6b7280', mb: 4 }}>
        Bienvenido de vuelta. Aquí está lo que está pasando con tu sistema predictivo hoy.
      </Typography>

      {/* Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Bs. 45,231
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ganancia Total
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              2,350
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuarios Activos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#ec4899', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              1,234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Consultas
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              87.5%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Precisión del Modelo
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Más contenido */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          📊 Sistema de Inversión - Feria 16 de Julio
        </Typography>
        <Typography variant="body1">
          Tu sistema predictivo está funcionando correctamente. 
          Usa el simulador para analizar inversiones y toma mejores decisiones.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;