//ProtectedLayout.jsx

import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; //uses your latest context
import { useState } from 'react';
import logo from '../assets/logo.jpg'; //Logo import

export default function ProtectedLayout() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout(); //context will automatically handle SSO + local logout

            // Full page reload is still good after SSO
            window.location.href = "/";
            // setTimeout(() => {
            //     window.location.reload(true);
            // }, 50);
        } catch (error) {
            console.error("Logout error:", error);
            // setTimeout(() => {
            //     window.location.reload(true);
            // }, 50);
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="app-container">
            <nav className="sidebar">
                <div className="nav-header">
                    <img src={logo} className="nav-logo" alt="Logo" />
                </div>
                <Link to="/dashboard" className="nav-link">Home</Link>
                <Link to="/dashboard/application" className="nav-link">Applications</Link>
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
                <Outlet />
            </main>
        </div>
    );
}
