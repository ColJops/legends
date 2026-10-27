import { Navigate, Outlet } from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function UserRoute() {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: { pathname: "/my-legends" } }}
            />
        );
    }

    if (user.role !== "USER") {
        return <Navigate to="/admin/legends" replace />;
    }

    return <Outlet />;
}
