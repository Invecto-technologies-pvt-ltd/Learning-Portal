import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedLayout from './components/ProtectedLayout';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Settings from './components/Settings';
import { AuthProvider, useAuth } from './components/Context/AuthContext'; // Import AuthContext

export default function App() {
  return (
    <AuthProvider> {/* Wrap your app in AuthProvider */}
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute />}
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// LoginPage Component to manage the Login state
function LoginPage() {
  const { isAuthenticated } = useAuth(); // Use AuthContext
  return !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />;
}

// ProtectedRoute Component to manage protected layout routing
function ProtectedRoute() {
  const { isAuthenticated } = useAuth(); // Use AuthContext
  return isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />;
}
