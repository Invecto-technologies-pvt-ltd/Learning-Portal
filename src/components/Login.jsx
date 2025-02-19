import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './Context/AuthContext'; // Import useAuth hook

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signin', { // Ensure correct backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Call login from context and store user data
        login({
          accessToken: data.accessToken,
          user: {
            id: data.id,
            username: data.username,
            email: data.email,
            roles: data.roles
          }
        });

        navigate('/dashboard', { replace: true });
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <Link to="/register" className="auth-link">Don't have an account? Register</Link>
        </form>
      </div>
    </div>
  );
}
