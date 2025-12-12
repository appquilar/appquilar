import { useQuery } from "@tanstack/react-query";

import { compositionRoot } from "@/compositionRoot";
import type { User } from "@/domain/models/User";

const userService = compositionRoot.userService;

/**
 * Hook de aplicación para obtener un usuario por ID.
 *
 * - No accede a infrastructure.
 * - No instancia servicios (usa compositionRoot).
 */
export function useUserById(userId: string | undefined) {
    const query = useQuery<User | null, Error>({
        queryKey: ["userById", userId],
        queryFn: async () => {
            if (!userId) return null;
            return await userService.getUserById(userId);
        },
        enabled: Boolean(userId),
        staleTime: 1000 * 60 * 5,
    });

    return {
        user: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error ? query.error.message : null,
        refetch: query.refetch,
    };
}
