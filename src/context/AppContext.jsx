import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    fetchMaintenanceRequests,
    fetchRequestsByStatus,
    fetchEquipment,
    fetchTechnicians,
    fetchTeams,
    updateMaintenanceRequest,
    createMaintenanceRequest,
    deleteMaintenanceRequest,
    fetchNotifications,
    markNotificationRead,
    loginUser,
    logoutUser,
} from '../utils/api';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [requests, setRequests] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [teams, setTeams] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    // Theme effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [requestsData, equipmentData, techniciansData, teamsData, notificationsData] = await Promise.all([
                    fetchMaintenanceRequests(),
                    fetchEquipment({ is_active: true }),
                    fetchTechnicians(),
                    fetchTeams(),
                    fetchNotifications(),
                ]);

                // Handle paginated responses (extract results array if present)
                setRequests(requestsData.results || requestsData);
                setEquipment(equipmentData.results || equipmentData);
                setTechnicians(techniciansData.results || techniciansData);
                setTeams(teamsData.results || teamsData);
                setNotifications(notificationsData.results || notificationsData);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        loadData();
    }, [user]);

    // Auth functions
    const login = async (username, password) => {
        try {
            const userData = await loginUser(username, password);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
            localStorage.removeItem('user');
            // Clear data
            setRequests([]);
            setNotifications([]);
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    // Map backend status to frontend status format
    const mapStatus = (backendStatus) => {
        const statusMap = {
            'New': 'new',
            'In Progress': 'in-progress',
            'Repaired': 'repaired',
            'Scrap': 'scrap',
        };
        return statusMap[backendStatus] || backendStatus.toLowerCase();
    };

    const reverseMapStatus = (frontendStatus) => {
        const statusMap = {
            'new': 'New',
            'in-progress': 'In Progress',
            'repaired': 'Repaired',
            'scrap': 'Scrap',
        };
        return statusMap[frontendStatus] || frontendStatus;
    };

    // Update request status (for drag and drop in Kanban)
    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            const backendStatus = reverseMapStatus(newStatus);
            await updateMaintenanceRequest(requestId, { status: backendStatus });

            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req.id === requestId ? { ...req, status: backendStatus } : req
                )
            );
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    // Assign technician to request
    const assignTechnician = async (requestId, technicianId) => {
        try {
            await updateMaintenanceRequest(requestId, { technician: technicianId });

            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req.id === requestId ? { ...req, technician: technicianId } : req
                )
            );
        } catch (error) {
            console.error('Error assigning technician:', error);
        }
    };

    // Create new maintenance request
    const createRequest = async (requestData) => {
        try {
            const newRequest = await createMaintenanceRequest(requestData);
            setRequests(prevRequests => [...prevRequests, newRequest]);
            return newRequest;
        } catch (error) {
            console.error('Error creating request:', error);
            throw error;
        }
    };

    // Update existing request
    const updateRequest = async (requestId, updates) => {
        try {
            await updateMaintenanceRequest(requestId, updates);

            setRequests(prevRequests =>
                prevRequests.map(req =>
                    req.id === requestId ? { ...req, ...updates } : req
                )
            );
        } catch (error) {
            console.error('Error updating request:', error);
        }
    };

    // Delete request
    const deleteRequest = async (requestId) => {
        try {
            await deleteMaintenanceRequest(requestId);
            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    };

    // Get requests by status for Kanban
    const getRequestsByStatus = (status) => {
        const backendStatus = reverseMapStatus(status);
        return requests.filter(req => req.status === backendStatus);
    };

    // Get requests by date for Calendar
    const getRequestsByDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return requests.filter(req => req.scheduled_date === dateStr);
    };

    // Get open requests for equipment
    const getOpenRequestsForEquipment = (equipmentId) => {
        return requests.filter(
            req =>
                req.equipment === equipmentId &&
                (req.status === 'New' || req.status === 'In Progress')
        );
    };

    // Check if request is overdue
    const isRequestOverdue = (request) => {
        if (request.status === 'Repaired' || request.status === 'Scrap') {
            return false;
        }
        if (!request.due_date) return false;

        const dueDate = new Date(request.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Get status counts for dashboard
    const getStatusCounts = () => {
        return {
            new: requests.filter(req => req.status === 'New').length,
            inProgress: requests.filter(req => req.status === 'In Progress').length,
            repaired: requests.filter(req => req.status === 'Repaired').length,
            scrap: requests.filter(req => req.status === 'Scrap').length,
            total: requests.length,
            overdue: requests.filter(req => isRequestOverdue(req)).length,
        };
    };

    // Mark notification as read
    const markNotificationAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const value = {
        // State
        requests,
        equipment,
        technicians,
        teams,
        selectedDate,
        setSelectedDate,
        loading,

        // Actions
        updateRequestStatus,
        assignTechnician,
        createRequest,
        updateRequest,
        deleteRequest,

        // Queries
        getRequestsByStatus,
        getRequestsByDate,
        getOpenRequestsForEquipment,
        isRequestOverdue,
        getStatusCounts,

        // Notifications
        notifications,
        markNotificationAsRead,

        // Theme
        theme,
        toggleTheme,

        // Auth
        user,
        login,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
