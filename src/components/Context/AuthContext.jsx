import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleAuthChange); // Listen to changes in localStorage
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Get learning data before clearing anything
    const learningData = JSON.parse(localStorage.getItem("learningData")) || [];
    
    if (learningData.length > 0) {
      try {
        // Send all learning data entries
        const promises = learningData.map(data => 
          fetch("http://192.168.1.215:8000/api/v1/activity/log", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              startTime: data.startTime,
              duration: data.duration,
              oemId: parseInt(data.oemId)
            })
          })
        );

        // Wait for all requests to complete
        const responses = await Promise.all(promises);
        
        // Check if any request failed
        const hasError = responses.some(response => !response.ok);
        if (hasError) {
          throw new Error("Failed to send some learning data");
        }

        // Clear learning data after successful sync
        localStorage.setItem("learningData", JSON.stringify([]));
      } catch (error) {
        console.error("Error syncing learning data during logout:", error);
      }
    }

    // Only clear storage after sync attempt is complete
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('learningTimes');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeSessions');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
