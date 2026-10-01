import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getCurrentUser,
    loginUser,
    registerUser,
} from "../services/authApi";
import {
    AUTH_SESSION_CLEARED_EVENT,
    clearStoredAuthSession,
    persistAuthSession,
    persistStoredUser,
    readStoredToken,
    readStoredUser,
} from "../services/authSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(readStoredToken);
    const [user, setUser] = useState(readStoredUser);
    const [authLoading, setAuthLoading] = useState(
        Boolean(token)
    );

    const isAuthenticated = Boolean(token && user);

    const clearAuthState = useCallback(() => {
        setToken(null);
        setUser(null);
        setAuthLoading(false);
    }, []);

    const logout = useCallback(() => {
        clearStoredAuthSession();
        clearAuthState();
    }, [clearAuthState]);

    useEffect(() => {
        const handleSessionCleared = () => {
            clearAuthState();
        };

        window.addEventListener(
            AUTH_SESSION_CLEARED_EVENT,
            handleSessionCleared
        );

        return () => {
            window.removeEventListener(
                AUTH_SESSION_CLEARED_EVENT,
                handleSessionCleared
            );
        };
    }, [clearAuthState]);

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!token) {
                setAuthLoading(false);
                return;
            }

            setAuthLoading(true);

            try {
                const currentUser = await getCurrentUser();

                const normalizedUser = {
                    username: currentUser.username,
                    role: normalizeRole(currentUser.role),
                };

                setUser(normalizedUser);
                persistStoredUser(normalizedUser);
            } catch {
                logout();
            } finally {
                setAuthLoading(false);
            }
        };

        void loadCurrentUser();
    }, [token, logout]);

    const login = useCallback(async (credentials) => {
        const data = await loginUser(credentials);

        const loggedUser = {
            username: data.username,
            role: normalizeRole(data.role),
        };

        persistAuthSession(data.token, loggedUser);
        setToken(data.token);
        setUser(loggedUser);

        return data;
    }, []);

    const register = useCallback(
        (payload) => registerUser(payload),
        []
    );

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
        [
            token,
            user,
            authLoading,
            isAuthenticated,
            login,
            register,
            logout,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

function normalizeRole(role) {
    if (!role) {
        return null;
    }

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
