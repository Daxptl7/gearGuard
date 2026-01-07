import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import KanbanBoard from './pages/KanbanBoard';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import EquipmentList from './pages/EquipmentList';
import LoginPage from './pages/LoginPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/kanban" replace />
            </ProtectedRoute>
          } />

          <Route path="/kanban" element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/equipment" element={
            <ProtectedRoute>
              <EquipmentList />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
