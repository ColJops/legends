import {
    lazy,
    Suspense,
} from "react";
import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import LegendsPage from "../pages/LegendsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AdminRoute from "../routes/AdminRoute";

const AdminLayout = lazy(
    () => import("../components/admin/AdminLayout")
);
const AdminDashboardPage = lazy(
    () => import("../pages/admin/AdminDashboardPage")
);
const AdminLegendsPage = lazy(
    () => import("../pages/admin/AdminLegendsPage")
);
const AdminLegendEditPage = lazy(
    () => import("../pages/admin/AdminLegendEditPage")
);
const AdminUsersPage = lazy(
    () => import("../pages/admin/AdminUsersPage")
);
const AdminMediaPage = lazy(
    () => import("../pages/admin/AdminMediaPage")
);
const AdminAuditLogsPage = lazy(
    () => import("../pages/admin/AdminAuditLogsPage")
);

const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "legends",
                element: <LegendsPage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "unauthorized",
                element: <UnauthorizedPage />,
            },
        ],
    },
    {
        element: <AdminRoute />,
        children: [
            {
                path: "/admin",
                element: (
                    <LazyRoute>
                        <AdminLayout />
                    </LazyRoute>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <Navigate
                                to="/admin/dashboard"
                                replace
                            />
                        ),
                    },
                    {
                        path: "dashboard",
                        element: (
                            <LazyRoute>
                                <AdminDashboardPage />
                            </LazyRoute>
                        ),
                    },
                    {
                        path: "legends",
                        element: (
                            <LazyRoute>
                                <AdminLegendsPage />
                            </LazyRoute>
                        ),
                    },
                    {
                        path: "legends/:id/edit",
                        element: (
                            <LazyRoute>
                                <AdminLegendEditPage />
                            </LazyRoute>
                        ),
                    },
                    {
                        path: "users",
                        element: (
                            <LazyRoute>
                                <AdminUsersPage />
                            </LazyRoute>
                        ),
                    },
                    {
                        path: "media",
                        element: (
                            <LazyRoute>
                                <AdminMediaPage />
                            </LazyRoute>
                        ),
                    },
                    {
                        path: "audit-logs",
                        element: (
                            <LazyRoute>
                                <AdminAuditLogsPage />
                            </LazyRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);

function LazyRoute({ children }) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            {children}
        </Suspense>
    );
}

export default AppRouter;
