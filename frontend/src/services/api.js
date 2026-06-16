const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const getGroupTasks = async (token) => {
  const response = await fetch(`${API_BASE_URL}/tasks/my-group`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Error al obtener tareas.');
  }
  return data;
};

export const getReportStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/reports/stats-equipos`, {
    method: 'GET',
    headers: getHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Error al obtener estadísticas.');
  }
  return data;
};
