import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; // Import useAuth hook
import { useState } from 'react';
import logo from '../assets/logo.jpg'; // Add this import

export default function ProtectedLayout() {
  const { isAuthenticated, logout } = useAuth(); // Get isAuthenticated and logout function from context
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout(); // Wait for logout to complete
      navigate('/login', { replace: true }); // Navigate to login page
    } catch (error) {
      console.error('Error during logout:', error);
      alert('There was an error during logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="nav-header">
          <img src={logo} className="nav-logo" alt="Logo" />
        </div>
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/dashboard/users" className="nav-link">Users</Link>
        <Link to="/dashboard/settings" className="nav-link">Settings</Link>
        <button 
          onClick={handleLogout}
          className="nav-link logout"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </nav>
      <main className="main-content">
        <Outlet /> {/* This is key for rendering child routes */}
      </main>
    </div>
  );
}
