import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("legends_token"));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("legends_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [authLoading, setAuthLoading] = useState(Boolean(token));

    const isAuthenticated = Boolean(token && user);

    const logout = () => {
        localStorage.removeItem("legends_token");
        localStorage.removeItem("legends_user");

        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!token) {
                setAuthLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUser();

                const normalizedUser = {
                    username: currentUser.username,
                    role: normalizeRole(currentUser.role),
                };

                setUser(normalizedUser);
                localStorage.setItem("legends_user", JSON.stringify(normalizedUser));
            } catch {
                logout();
            } finally {
                setAuthLoading(false);
            }
        };

        void loadCurrentUser();
    }, [token]);

    const login = async (credentials) => {
        const data = await loginUser(credentials);

        const loggedUser = {
            username: data.username,
            role: data.role,
        };

        localStorage.setItem("legends_token", data.token);
        localStorage.setItem("legends_user", JSON.stringify(loggedUser));

        setToken(data.token);
        setUser(loggedUser);

        return data;
    };

    const register = async (payload) => {
        return await registerUser(payload);
    };


    const value = useMemo(
        () => ({
            token,
            user,
            authLoading,
            isAuthenticated,
            login,
            register,
            logout,
            isAdmin: user?.role === "ADMIN",
        }),
        [token, user, authLoading, isAuthenticated]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}

function normalizeRole(role) {
    if (!role) return null;

    if (role === "USER" || role === "ADMIN") {
        return role;
    }

    if (role.includes("ADMIN")) {
        return "ADMIN";
    }

    if (role.includes("USER")) {
        return "USER";
    }

    return role;
}