import {
   lazy,
    Suspense,
} from "react";
import { createBrowserRouter,
    Navigate,
} from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";

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

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminPlaceholderPage from "../pages/admin/AdminPlaceholderPage";
import AdminRoute from "../routes/AdminRoute";
import AdminLegendsPage from "../pages/admin/AdminLegendsPage";
import AdminLegendEditPage from "../pages/admin/AdminLegendEditPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";

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
            {
                path: "legends/:id/edit",
                element: <AdminLegendEditPage />,
            },
            {
                path: "users",
                element: <AdminUsersPage />,
            },
        ],
    },
    {
        element: <AdminRoute />,
        children: [
            {
                path: "/admin",
                element: <AdminLayout />,
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
                        element: <AdminDashboardPage />,
                    },
                    {
                        path: "legends",
                        element: <AdminLegendsPage />,
                    },
                    {
                        path: "legends/:id/edit",
                        element: <AdminLegendEditPage />,
                    },
                    {
                        path: "users",
                        element: <AdminUsersPage />,
                    },
                    {
                        path: "media",
                        element: (
                            <AdminPlaceholderPage
                                title="Pliki i obrazy"
                                description="Kontrola przesłanych grafik oraz usuwanie nieużywanych plików."
                            />
                        ),
                    },
                    {
                        path: "audit-logs",
                        element: (
                            <AdminPlaceholderPage
                                title="Dziennik działań"
                                description="Historia operacji wykonywanych przez administratorów aplikacji."
                            />
                        ),
                    },
                ],
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
