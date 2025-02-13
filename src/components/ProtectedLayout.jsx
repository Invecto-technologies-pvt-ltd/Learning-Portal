import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import Dashboard from './Dashboard';
import Users from './Users';
import Settings from './Settings';

export default function ProtectedLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="nav-header">Learning Portal</div>
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/dashboard/users" className="nav-link">Users</Link>
        <Link to="/dashboard/settings" className="nav-link">Settings</Link>
        <button 
          onClick={handleLogout}
          className="nav-link logout"
        >
          Logout
        </button>
      </nav>
      <main className="main-content">
        <Outlet /> {/* This is key for rendering child routes */}
      </main>
    </div>
  );
}
