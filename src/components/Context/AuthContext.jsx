import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

<<<<<<< Updated upstream
export function useAuth() {
  return useContext(AuthContext);
}
=======
const AuthContext = createContext(null);
const ApiUrl = import.meta.env.VITE_BASE_SSO_URL;
>>>>>>> Stashed changes

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

<<<<<<< Updated upstream
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
=======
    //SSO Login
    const ssoLogin = async () => {
        setLoading(true);
        try {
            window.location.href = `http://${ApiUrl}/login`;
        } catch (error) {
            console.error("SSO Login failed:", error);
        } finally {
            setLoading(false);
>>>>>>> Stashed changes
        }

        // Clear learning data after successful sync
        localStorage.setItem("learningData", JSON.stringify([]));
      } catch (error) {
        console.error("Error syncing learning data during logout:", error);
      }
    }

<<<<<<< Updated upstream
    // Only clear storage after sync attempt is complete
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('learningData');
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
=======
    //Logout (SSO + Local)
    const logout = async () => {
        try {
            await fetch(`http://${ApiUrl}/logout`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (e) {
            console.warn("SSO logout failed, ignoring");
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('learningTimes');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    //Check SSO Login Only (skip when local login)
    const checkAuth = async () => {
        if (localStorage.getItem('token')) return; // skip for local login
        try {
            const response = await fetch(`http://${ApiUrl}/whoami`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Not authenticated");

            const data = await response.json();
            if (data?.user) {
                setUser(data.user);
                setIsAuthenticated(true);
                localStorage.setItem("currentUser", JSON.stringify(data.user));
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem("currentUser");
            }
        } catch (error) {
            setIsAuthenticated(false);
            localStorage.removeItem("currentUser");
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, ssoLogin, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
>>>>>>> Stashed changes
