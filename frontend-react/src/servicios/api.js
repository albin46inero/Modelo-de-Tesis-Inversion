import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const consultarInversion = async (datos) => {
  const response = await api.post('/consultar', datos);
  return response.data;
};

export const obtenerHistorial = async () => {
  const response = await api.get('/historial');
  return response.data;
};

export default api;