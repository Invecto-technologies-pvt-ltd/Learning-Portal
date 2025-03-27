import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSamlAuthentication = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/whoami", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log("SAML auth response:", data);

      if (response.ok && data.user) {
        const loginSuccess = await login({ user: data.user });
        if (loginSuccess) {
          navigate("/dashboard", { replace: true });
        } else {
          setError("Failed to set authentication state");
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("SAMLResponse")) {
      handleSamlAuthentication();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, navigating to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const initiateLogin = () => {
    setLoading(true);
    window.location.href = "http://localhost:8000/login";
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>Portal</h1>
          <div className="loading-message">Authenticating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Portal</h1>
        <div className="saml-login-container">
          {error && <div className="error-message">{error}</div>}
          <button
            onClick={initiateLogin}
            className="saml-login-button"
            disabled={loading}
          >
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
