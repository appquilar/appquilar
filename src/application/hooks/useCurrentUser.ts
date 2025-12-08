import { useQuery } from "@tanstack/react-query";
import { authService } from "@/compositionRoot";

export function useCurrentUser() {
    const session = authService.getCurrentSessionSync();

    const token = session?.token ?? null;

    const query = useQuery({
        queryKey: ["currentUser", token], // <-- depende del token
        queryFn: () => {
            if (!token) return null;
            return authService.getCurrentUser();
        },
        enabled: Boolean(token),  // solo corre si hay token
        staleTime: 1000 * 60 * 5,
    });

    return {
        user: query.data,
        isAuthenticated: Boolean(query.data),
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}
