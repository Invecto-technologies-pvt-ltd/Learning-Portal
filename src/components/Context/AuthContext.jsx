import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const login = async () => {
        setLoading(true);
        try {
            window.location.href = "http://localhost:8000/login"; // Trigger SSO
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch("http://localhost:8000/logout", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("currentUser");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const checkAuth = async () => {
        try {
            const response = await fetch("http://localhost:8000/whoami", {
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
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
