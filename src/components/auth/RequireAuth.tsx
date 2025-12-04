import React from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * RequireAuth wraps protected content.
 *
 * - If auth state is still loading, it renders an optional loading fallback.
 * - If a user is not authenticated, it renders an optional unauthenticated fallback.
 * - Otherwise, it renders the children.
 */
export interface RequireAuthProps {
    children: React.ReactNode;

    /**
     * Rendered while the auth state is being initialised.
     * Defaults to null.
     */
    loadingFallback?: React.ReactNode;

    /**
     * Rendered when the user is not authenticated.
     * For example
     * - a "please log in" message
     * - a login form
     * - a redirect component (React Router / Next, etc.)
     *
     * Defaults to null.
     */
    unauthenticatedFallback?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
                                                            children,
                                                            loadingFallback = null,
                                                            unauthenticatedFallback = null,
                                                        }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <>{loadingFallback}</>;
    }

    if (!isAuthenticated) {
        return <>{unauthenticatedFallback}</>;
    }

    return <>{children}</>;
};
