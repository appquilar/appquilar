import { useCallback, useEffect, useState } from "react";
import type { User } from "@/domain/models/User";
import type {
    UserListFilters,
    PaginatedUsersResult,
} from "@/domain/repositories/UserRepository";
import { compositionRoot } from "@/compositionRoot";

const { userService } = compositionRoot;

export interface UsePlatformUsersApi extends PaginatedUsersResult {
    users: User[];
    isLoading: boolean;
    error: string | null;
    filters: UserListFilters;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    applyFilters: (filters: UserListFilters) => void;
    reload: () => Promise<void>;
}

/**
 * Hook para consumir el listado global de usuarios de plataforma (/api/users).
 * Este hook está pensado sólo para ROLE_ADMIN, y NO reemplaza al useUsers
 * que ya usas en gestión de usuarios de empresa.
 */
export const usePlatformUsers = (): UsePlatformUsersApi => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filters, setFilters] = useState<UserListFilters>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await userService.getAllUsers({
                ...filters,
                page,
                perPage,
            });

            setUsers(result.users);
            setTotal(result.total);
        } catch (err) {
            console.error("Error loading platform users:", err);
            setError("Error al cargar los usuarios. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, perPage]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const applyFilters = (newFilters: UserListFilters) => {
        setPage(1);
        setFilters(newFilters);
    };

    const reload = async () => {
        await loadUsers();
    };

    return {
        users,
        total,
        page,
        perPage,
        filters,
        isLoading,
        error,
        setPage,
        setPerPage,
        applyFilters,
        reload,
    };
};
