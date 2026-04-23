import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

const { mockUseAuth } = vi.hoisted(() => ({
    mockUseAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: mockUseAuth,
}));

import { useRouteCurrentUserRefresh } from "@/hooks/useRouteCurrentUserRefresh";

const RouteRefreshProbe = () => {
    useRouteCurrentUserRefresh();
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate("/dashboard/products")}>
            go-products
        </button>
    );
};

describe("useRouteCurrentUserRefresh", () => {
    beforeEach(() => {
        mockUseAuth.mockReset();
    });

    it("refreshes current user when navigating to another route while authenticated", async () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue(null);

        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            refreshCurrentUser,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route path="/dashboard" element={<RouteRefreshProbe />} />
                    <Route path="/dashboard/products" element={<RouteRefreshProbe />} />
                </Routes>
            </MemoryRouter>
        );

        expect(refreshCurrentUser).not.toHaveBeenCalled();

        await act(async () => {
            screen.getByRole("button", { name: "go-products" }).click();
        });

        expect(refreshCurrentUser).toHaveBeenCalledTimes(1);
    });

    it("does not refresh on the initial render", () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue(null);

        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            refreshCurrentUser,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route path="/dashboard" element={<RouteRefreshProbe />} />
                </Routes>
            </MemoryRouter>
        );

        expect(refreshCurrentUser).not.toHaveBeenCalled();
    });

    it("does not refresh when navigating without an authenticated session", async () => {
        const refreshCurrentUser = vi.fn().mockResolvedValue(null);

        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            refreshCurrentUser,
        });

        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<RouteRefreshProbe />} />
                    <Route path="/dashboard/products" element={<RouteRefreshProbe />} />
                </Routes>
            </MemoryRouter>
        );

        await act(async () => {
            screen.getByRole("button", { name: "go-products" }).click();
        });

        expect(refreshCurrentUser).not.toHaveBeenCalled();
    });
});
