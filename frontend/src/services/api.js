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

export const markAttendance = async (token, attendanceData) => {
  const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(attendanceData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Error al registrar asistencia.');
  }
  return data;
};

export const getGroupAttendance = async (token, fecha) => {
  const url = fecha ? `${API_BASE_URL}/attendance/group?fecha=${fecha}` : `${API_BASE_URL}/attendance/group`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Error al obtener asistencia del grupo.');
  }
  return data;
};

export const getAttendanceStats = async (token, fecha) => {
  const url = fecha ? `${API_BASE_URL}/attendance/stats?fecha=${fecha}` : `${API_BASE_URL}/attendance/stats`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Error al obtener estadísticas de asistencia.');
  }
  return data;
};
