import { useAuth } from "@/context/AuthContext";
import type { User } from "@/domain/models/User";

/**
 * useCurrentUser is the application-level hook that exposes
 * the current authenticated user and auth state to the UI.
 *
 * It wraps the AuthContext so that UI components don't need
 * to know anything about services or repositories.
 */
export interface UseCurrentUserResult {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /**
     * Alias for refreshCurrentUser from AuthContext.
     * Forces a fresh /api/me and updates the cache.
     */
    refresh: () => Promise<User | null>;
}

export const useCurrentUser = (): UseCurrentUserResult => {
    const {
        currentUser,
        isAuthenticated,
        isLoading,
        refreshCurrentUser,
    } = useAuth();

    return {
        user: currentUser,
        isAuthenticated,
        isLoading,
        refresh: refreshCurrentUser,
    };
};
