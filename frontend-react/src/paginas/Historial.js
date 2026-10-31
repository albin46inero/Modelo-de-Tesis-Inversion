import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress, Chip } from '@mui/material';
import { obtenerHistorial } from '../servicios/api';

function Historial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerHistorial();
        setHistorial(data.consultas || []);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRecomendacionColor = (rec) => {
    if (rec === 'Muy_Conveniente') return 'success';
    if (rec === 'Con_Prevision') return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        📜 Historial de Consultas
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#667eea' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Producto</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Capital</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Experiencia</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Temporada</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ubicación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ganancia Est.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tiempo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Recomendación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Probabilidad</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historial.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{new Date(row.fecha).toLocaleDateString('es-BO')}</TableCell>
                <TableCell>{row.tipo_producto}</TableCell>
                <TableCell>Bs. {row.capital}</TableCell>
                <TableCell>{row.experiencia}</TableCell>
                <TableCell>{row.temporada}</TableCell>
                <TableCell>{row.ubicacion}</TableCell>
                <TableCell>Bs. {row.ganancia_estimada?.toFixed(0)}</TableCell>
                <TableCell>{row.tiempo_recuperacion_dias} días</TableCell>
                <TableCell>
                  <Chip 
                    label={row.recomendacion.replace('_', ' ')} 
                    color={getRecomendacionColor(row.recomendacion)} 
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.probabilidad}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {historial.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 5, p: 5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No hay consultas registradas aún. Realiza tu primera consulta en la página de Inicio.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Historial;