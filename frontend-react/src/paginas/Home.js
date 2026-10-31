import React, { useState } from 'react';
import {
  Container, Grid, Paper, TextField, Button, Typography, Box,
  MenuItem, Alert, Card, CardContent, CircularProgress
} from '@mui/material';
import { consultarInversion } from '../servicios/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function Home() {
  const [formData, setFormData] = useState({
    tipo_producto: 'Chompas',
    capital: 2000,
    experiencia: 'Ninguna',
    temporada: 'Invierno',
    ubicacion: 'FeriaPrincipal',
    origen: 'Importado',
    calidad: 'Primera',
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [validacion, setValidacion] = useState({
    experiencia_real_rentabilidad: '',
    experiencia_real_rotacion: '',
    comentario_experto: '',
    utilidad_recomendacion: ''
  });

  const [validacionEnviada, setValidacionEnviada] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeValidacion = (e) => {
    setValidacion({ ...validacion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);
    setValidacionEnviada(false);
    
    try {
      const data = await consultarInversion(formData);
      setResultado(data);
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarValidacion = () => {
    alert("✅ ¡Gracias! Tu feedback ha sido registrado. Esto ayudará a mejorar la precisión del modelo bayesiano.");
    console.log("📊 Datos de validación:", {
      consulta: resultado,
      validacion: validacion,
      tipo_usuario: formData.experiencia
    });
    setValidacionEnviada(true);
  };

  const getRecomendacionColor = (rec) => {
    if (rec === 'Muy_Conveniente') return '#28a745';
    if (rec === 'Con_Prevision') return '#ffc107';
    return '#dc3545';
  };

  const chartData = resultado && resultado.rentabilidad ? [
    { name: 'Rentabilidad Alta', value: resultado.rentabilidad[0]?.probabilidad || 0, color: '#28a745' },
    { name: 'Riesgo Bajo', value: resultado.riesgo?.[0]?.probabilidad || 0, color: '#28a745' },
    { name: 'Demanda Alta', value: resultado.demanda?.[0]?.probabilidad || 0, color: '#667eea' },
  ] : [];

  const esExperto = formData.experiencia !== 'Ninguna';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
        💰 Simulador de Inversión para Jóvenes Emprendedores
      </Typography>

      <Grid container spacing={4}>
        {/* Formulario */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 'bold', mb: 2 }}>
              📋 Datos de la Inversión
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField select fullWidth label="Tipo de Producto" name="tipo_producto" value={formData.tipo_producto} onChange={handleChange} margin="normal">
                <MenuItem value="Chompas">🧥 Chompas</MenuItem>
                <MenuItem value="Poleras">👕 Poleras</MenuItem>
                <MenuItem value="Calzado">👟 Calzado</MenuItem>
                <MenuItem value="Accesorios">🎒 Accesorios</MenuItem>
              </TextField>

              <TextField fullWidth label="Capital a Invertir (Bs.)" name="capital" type="number" value={formData.capital} onChange={handleChange} margin="normal" />

              <TextField select fullWidth label="Experiencia" name="experiencia" value={formData.experiencia} onChange={handleChange} margin="normal">
                <MenuItem value="Ninguna">Ninguna</MenuItem>
                <MenuItem value="1-2_anios">1-2 años</MenuItem>
                <MenuItem value="Mas_3_anios">Más de 3 años</MenuItem>
              </TextField>

              <TextField select fullWidth label="Temporada" name="temporada" value={formData.temporada} onChange={handleChange} margin="normal">
                <MenuItem value="Invierno">Invierno</MenuItem>
                <MenuItem value="Verano">Verano</MenuItem>
                <MenuItem value="TodoAño">Todo el año</MenuItem>
              </TextField>

              <TextField select fullWidth label="Ubicación" name="ubicacion" value={formData.ubicacion} onChange={handleChange} margin="normal">
                <MenuItem value="FeriaPrincipal">Feria Principal</MenuItem>
                <MenuItem value="ZonaPeriferica">Zona Periférica</MenuItem>
                <MenuItem value="Online">Online</MenuItem>
              </TextField>

              <TextField select fullWidth label="Origen" name="origen" value={formData.origen} onChange={handleChange} margin="normal">
                <MenuItem value="Importado">Importado</MenuItem>
                <MenuItem value="Nacional">Nacional</MenuItem>
              </TextField>

              <TextField select fullWidth label="Calidad" name="calidad" value={formData.calidad} onChange={handleChange} margin="normal">
                <MenuItem value="Primera">Primera</MenuItem>
                <MenuItem value="Segunda">Segunda</MenuItem>
              </TextField>

              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                sx={{ mt: 3, py: 1.5, fontWeight: 'bold', fontSize: '1.1em' }} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '🔍 ANALIZAR INVERSIÓN'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12} md={8}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {resultado && resultado.exito ? (
            <>
              {/* Tarjeta de Recomendación */}
              <Card sx={{ mb: 3, bgcolor: getRecomendacionColor(resultado.recomendacion), color: 'white', boxShadow: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {resultado.recomendacion.replace('_', ' ')}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Probabilidad de éxito: {resultado.probabilidad_recomendacion}%
                  </Typography>
                </CardContent>
              </Card>

              <Alert severity="success" sx={{ mb: 3, fontSize: '1.1em', py: 2 }}>
                💬 {resultado.consejo}
              </Alert>

              {/* Proyección Financiera */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  📊 Proyección Financiera Estimada
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Ganancia</Typography>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Bs. {resultado.proyeccion?.ganancia_estimada?.toFixed(0) || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Tiempo</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {resultado.proyeccion?.tiempo_recuperacion_dias || 0} días
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Unidades</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {resultado.proyeccion?.unidades_estimadas || 0} un.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">ROI</Typography>
                      <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {resultado.proyeccion?.retorno_inversion?.toFixed(1) || 0}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Gráfico */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  📈 Análisis de Probabilidades
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: '% Probabilidad', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Probabilidad">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              {/* 🔥 SECCIÓN DE VALIDACIÓN - AHORA APARECE SIEMPRE */}
              <Paper sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: esExperto ? '#e3f2fd' : '#fff3e0', border: `2px solid ${esExperto ? '#667eea' : '#ff9800'}` }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: esExperto ? '#1565c0' : '#e65100', display: 'flex', alignItems: 'center' }}>
                  {esExperto ? '🎓 Validación con tu Experiencia Real' : '💬 ¿Te fue útil esta recomendación?'}
                </Typography>
                
                {esExperto ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
                      Como emprendedor con experiencia, ¿estos resultados coinciden con la realidad del mercado en la Feria 16 de Julio?
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          select 
                          fullWidth 
                          label="En tu experiencia, la rentabilidad real suele ser:" 
                          name="experiencia_real_rentabilidad"
                          value={validacion.experiencia_real_rentabilidad}
                          onChange={handleChangeValidacion}
                          margin="normal"
                        >
                          <MenuItem value="Alta">Alta</MenuItem>
                          <MenuItem value="Media">Media</MenuItem>
                          <MenuItem value="Baja">Baja</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          select 
                          fullWidth 
                          label="En tu experiencia, la rotación de venta es:" 
                          name="experiencia_real_rotacion"
                          value={validacion.experiencia_real_rotacion}
                          onChange={handleChangeValidacion}
                          margin="normal"
                        >
                          <MenuItem value="Rapida">Rápida (1-7 días)</MenuItem>
                          <MenuItem value="Media">Media (8-21 días)</MenuItem>
                          <MenuItem value="Lenta">Lenta (+21 días)</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField 
                          fullWidth 
                          multiline 
                          rows={2}
                          label="Comentario o corrección para el modelo (Opcional)" 
                          name="comentario_experto"
                          value={validacion.comentario_experto}
                          onChange={handleChangeValidacion}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
                      Tu opinión nos ayuda a mejorar el modelo predictivo para futuros emprendedores.
                    </Typography>
                    <TextField 
                      select 
                      fullWidth 
                      label="¿Qué tan útil te pareció esta recomendación?" 
                      name="utilidad_recomendacion"
                      value={validacion.utilidad_recomendacion}
                      onChange={handleChangeValidacion}
                      margin="normal"
                    >
                      <MenuItem value="Muy_util">Muy útil - Me ayudó a decidir</MenuItem>
                      <MenuItem value="Util">Útil - Me dio información valiosa</MenuItem>
                      <MenuItem value="Poco_util">Poco útil - No me convenció</MenuItem>
                      <MenuItem value="No_util">No útil - No me sirvió</MenuItem>
                    </TextField>
                    <TextField 
                      fullWidth 
                      multiline 
                      rows={2}
                      label="¿Qué mejorarías del sistema? (Opcional)" 
                      name="comentario_experto"
                      value={validacion.comentario_experto}
                      onChange={handleChangeValidacion}
                      margin="normal"
                    />
                  </>
                )}

                <Button 
                  variant="contained" 
                  color={esExperto ? "secondary" : "warning"}
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                  onClick={handleGuardarValidacion}
                  disabled={validacionEnviada}
                >
                  {validacionEnviada ? '✅ ¡Feedback registrado!' : (esExperto ? '✅ Validar con mi Experiencia' : '📤 Enviar mi opinión')}
                </Button>
              </Paper>

            </>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 10, p: 5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                👈 Completa el formulario de la izquierda
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Haz clic en "ANALIZAR INVERSIÓN" para ver los resultados del modelo bayesiano
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;