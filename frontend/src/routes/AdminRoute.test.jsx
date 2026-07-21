import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import AdminRoute from "./AdminRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("AdminRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows a loading screen while authentication is being restored", () => {
        useAuth.mockReturnValue({
            authLoading: true,
            user: null,
        });

        renderAdminRoute();

        expect(screen.getByText("Loading legends...")).toBeInTheDocument();
        expect(screen.queryByText("login page")).not.toBeInTheDocument();
    });

    it("redirects unauthenticated users to login", () => {
        useAuth.mockReturnValue({
            authLoading: false,
            user: null,
        });

        renderAdminRoute();

        expect(screen.getByText("login page")).toBeInTheDocument();
    });

    it("redirects non-admin users to the unauthorized page", () => {
        useAuth.mockReturnValue({
            authLoading: false,
            user: {
                username: "ania",
                role: "USER",
            },
        });

        renderAdminRoute();

        expect(screen.getByText("unauthorized page")).toBeInTheDocument();
    });

    it("renders admin content for administrators", () => {
        useAuth.mockReturnValue({
            authLoading: false,
            user: {
                username: "admin",
                role: "ADMIN",
            },
        });

        renderAdminRoute();

        expect(screen.getByText("admin page")).toBeInTheDocument();
    });
});

function renderAdminRoute() {
    return render(
        <MemoryRouter initialEntries={["/admin"]}>
            <Routes>
                <Route element={<AdminRoute />}>
                    <Route
                        path="/admin"
                        element={<div>admin page</div>}
                    />
                </Route>
                <Route
                    path="/login"
                    element={<div>login page</div>}
                />
                <Route
                    path="/unauthorized"
                    element={<div>unauthorized page</div>}
                />
            </Routes>
        </MemoryRouter>
    );
}
