import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/admin/AdminLayout";

import HomePage from "../pages/HomePage";
import LegendsPage from "../pages/LegendsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

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
]);

export default AppRouter;