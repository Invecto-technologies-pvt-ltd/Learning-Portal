import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/Context/AuthContext"; // Import AuthContext
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import LoginLocal from "./components/Loginlocal";
import ProtectedLayout from "./components/ProtectedLayout";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Application from "./components/Applications";
import Settings from "./components/Settings";
import { AuthProvider } from "./components/Context/AuthContext"; // Import AuthProvider

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth(); // Get auth state

  if (loading) {
    return <LoadingScreen />; // Show loading while checking auth
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/loginlocal" element={<LoginLocal />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="application" element={<Application />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

// Show loading screen while checking authentication
function LoadingScreen() {
  return <div className="loading-screen">Checking authentication...</div>;
}

// LoginPage Component
function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  return !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />;
}

// Protected Route Handler
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  return isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />;
}
