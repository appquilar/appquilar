import { useQuery } from "@tanstack/react-query";
import { authService } from "@/composition/auth";
import { isAuthenticated as hasAuthenticatedSession } from "@/domain/models/AuthSession";

export function useCurrentUser() {
    const session = authService.getCurrentSessionSync();
    const isAuthenticated = hasAuthenticatedSession(session);

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: () => {
            if (!isAuthenticated) return null;
            return authService.getCurrentUser();
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5,
    });

    return {
        user: query.data ?? null,
        isAuthenticated: isAuthenticated && Boolean(query.data),
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
