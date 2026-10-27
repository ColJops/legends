import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function AuthRoute() {
    const location = useLocation();
    const { user, authLoading } = useAuth();

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

    return <Outlet />;
}
