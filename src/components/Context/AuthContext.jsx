import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:8000/whoami", {
        method: "GET",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      console.log('Auth check response:', response);
      const data = await response.json();
      console.log('Auth check data:', data);

      if (response.ok && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return true;
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("currentUser");
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("currentUser");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData.user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(userData.user));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      user, 
      login, 
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);