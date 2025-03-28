//AuthContext

import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token") || !!localStorage.getItem("currentUser"));
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("currentUser")) || null);

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token") || !!localStorage.getItem("currentUser"));
        };
        window.addEventListener("storage", handleAuthChange);
        return () => window.removeEventListener("storage", handleAuthChange);
    }, []);

    //SSO Login
    const ssoLogin = async () => {
        setLoading(true);
        try {
            window.location.href = "http://localhost:8000/login";
        } catch (error) {
            console.error("SSO Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    //Local Login (called from Loginlocal.jsx)
    const login = ({ accessToken, user }) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
    };

    //Logout (SSO + Local)
    const logout = async () => {
        try {
            await fetch("http://localhost:8000/logout", {
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
        <AuthContext.Provider value={{ isAuthenticated, user, loading, ssoLogin, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
