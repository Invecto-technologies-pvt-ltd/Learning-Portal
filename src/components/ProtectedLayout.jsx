import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; // Import useAuth hook
import { useState } from 'react';
import logo from '../assets/logo.jpg'; // Add this import
import axios from 'axios'

export default function ProtectedLayout() {
  const { isAuthenticated, logout } = useAuth(); // Get isAuthenticated and logout function from context
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
        const response = await axios.get("http://localhost:8000/logout", {
            withCredentials: true
        });

        console.log("Logout Response:", response);

        if (response.data.logoutForm) {
            // Inject and submit SAML logout form dynamically
            const logoutFormContainer = document.createElement("div");
            logoutFormContainer.innerHTML = response.data.logoutForm;
            document.body.appendChild(logoutFormContainer);

            const samlForm = document.getElementById("samlLogoutForm");
            if (samlForm) {
                samlForm.submit(); // Trigger SAML Logout
                return; // Exit function to prevent clearing session prematurely
            }
        }

        // If no SAML logout, clear session
        await logout(); // Ensure session is cleared

        // 🔄 **Force an immediate full page reload**
        window.location.href = "/login";  
        setTimeout(() => {
            window.location.reload(true); // Force reload before alert appears
        }, 50);

    } catch (error) {
        console.error("Logout error:", error);
        
        // 🔄 **If an error occurs, still force reload before showing alert**
        setTimeout(() => {
            window.location.reload(true);
        }, 50);

        // alert("An error occurred during logout. Please try again."); 
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
        <Outlet /> {/* This is key for rendering child routes */}
      </main>
    </div>
  );
}


// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from './Context/AuthContext';
// import { useEffect } from 'react';

// export default function ProtectedLayout() {
//   const { isAuthenticated, loading, checkAuth } = useAuth();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       checkAuth();
//     }
//   }, [isAuthenticated, checkAuth]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// }