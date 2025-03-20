import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./Context/AuthContext"; // Import useAuth hook

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://192.168.1.215:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Full Login Response:", data); // Log the entire response
      console.log("Response Status:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // Check if token exists in different possible locations
        const token = data.data?.accessToken;
        console.log("Found token:", token);

        if (!token) {
          throw new Error("Token is missing in the response");
        }

        // Store token and user data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("currentUser", JSON.stringify(data.data?.user)); // Store user details

        // Verify if token is stored correctly
        console.log("Stored Token:", localStorage.getItem("token"));

        // Call login function from context
        login({
          accessToken: token,
          user: data.data?.user,
        });

        navigate("/dashboard", { replace: true });
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login Error:", err.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Portal Login</h1>
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          <Link to="/register" className="auth-link">
            Don't have an account? Register
          </Link>
        </form>
      </div>
    </div>
  );
}
