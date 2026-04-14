import { useQuery } from "@tanstack/react-query";
import { authService } from "@/compositionRoot";

export function useCurrentUser() {
    const session = authService.getCurrentSessionSync();
    const isAuthenticated = Boolean(session?.token);

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
