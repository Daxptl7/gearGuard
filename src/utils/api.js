const API_BASE_URL = '/api';

// Generic fetch helper
const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Maintenance Teams
export const fetchTeams = () => apiFetch('/teams/');

export const createTeam = (teamData) =>
  apiFetch('/teams/', {
    method: 'POST',
    body: JSON.stringify(teamData),
  });

// Users / User Profiles
export const fetchUsers = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/users/${queryString ? `?${queryString}` : ''}`);
};

export const fetchTechnicians = (teamId = null) => {
  const endpoint = teamId ? `/users/technicians/?team_id=${teamId}` : '/users/technicians/';
  return apiFetch(endpoint);
};

export const fetchUsersByTeam = (teamId) => apiFetch(`/users/by_team/?team_id=${teamId}`);

export const createUser = (userData) =>
  apiFetch('/users/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

// Equipment
export const fetchEquipment = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/equipment/${queryString ? `?${queryString}` : ''}`);
};

export const fetchEquipmentByTeam = (teamId) => apiFetch(`/equipment/by_team/?team_id=${teamId}`);

export const createEquipment = (equipmentData) =>
  apiFetch('/equipment/', {
    method: 'POST',
    body: JSON.stringify(equipmentData),
  });

export const updateEquipment = (id, equipmentData) =>
  apiFetch(`/equipment/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(equipmentData),
  });

export const deleteEquipment = (id) =>
  apiFetch(`/equipment/${id}/`, {
    method: 'DELETE',
  });

// Maintenance Requests
export const fetchMaintenanceRequests = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/maintenance-requests/${queryString ? `?${queryString}` : ''}`);
};

export const fetchRequestsByStatus = () => apiFetch('/maintenance-requests/by_status/');

export const createMaintenanceRequest = (requestData) =>
  apiFetch('/maintenance-requests/', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });

export const updateMaintenanceRequest = (id, requestData) =>
  apiFetch(`/maintenance-requests/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(requestData),
  });

export const deleteMaintenanceRequest = (id) =>
  apiFetch(`/maintenance-requests/${id}/`, {
    method: 'DELETE',
  });
// Notifications
export const fetchNotifications = () => apiFetch('/notifications/');

export const markNotificationRead = (id) =>
  apiFetch(`/notifications/${id}/mark_read/`, {
    method: 'POST',
  });

// Auth
export const loginUser = (username, password) =>
  apiFetch('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logoutUser = () =>
  apiFetch('/logout/', {
    method: 'POST',
  });
