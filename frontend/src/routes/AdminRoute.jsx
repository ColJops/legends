import { Navigate, Outlet, useLocation } from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { user, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (user.role !== "ADMIN") {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
