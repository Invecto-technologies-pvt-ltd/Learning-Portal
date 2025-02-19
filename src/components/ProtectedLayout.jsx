import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; // Import useAuth hook

export default function ProtectedLayout() {
  const { isAuthenticated, logout } = useAuth(); // Get isAuthenticated and logout function from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout from context
    navigate('/login', { replace: true }); // Navigate to login page
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="nav-header">Learning Portal</div>
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/dashboard/users" className="nav-link">Users</Link>
        <Link to="/dashboard/settings" className="nav-link">Settings</Link>
        <button 
          onClick={handleLogout}
          className="nav-link logout">
          Logout
        </button>
      </nav>
      <main className="main-content">
        <Outlet /> {/* This is key for rendering child routes */}
      </main>
    </div>
  );
}
