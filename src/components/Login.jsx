import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const validUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'password';

    if (username === validUsername && password === validPassword) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', username);

      // Trigger a manual storage update event
      window.dispatchEvent(new Event("storage"));

      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Learning Portal Login</h1>
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
