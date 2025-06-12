import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, ssoLogin, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      setError("");
      ssoLogin(); // Redirects to Duo SSO login page
    } catch (err) {
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>HUB</h1>
        <div className="saml-login-container">
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleLogin} className="saml-login-button">
          Login with SSO
        </button>
        <Link to="/register" className="auth-link">
            Don't have an account? Register
          </Link>
          <br />
          <Link to="/loginlocal" className="auth-link">
            Login Locally
          </Link>
        </div>
      </div>
    </div>
  );
}
