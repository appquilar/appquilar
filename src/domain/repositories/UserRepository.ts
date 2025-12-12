import type { User } from "../models/User";

/**
 * Filtros permitidos para el listado global de usuarios (/api/users).
 */
export interface UserListFilters {
    /**
     * Si se pasa un ID válido, tiene prioridad sobre el resto de filtros.
     */
    id?: string;
    /**
     * Filtro por email (búsqueda parcial, case-insensitive).
     */
    email?: string;
    /**
     * Filtro por nombre/apellidos (parcial, case-insensitive).
     * Corresponde al parámetro `name` del backend.
     */
    name?: string;
    /**
     * Página actual (1 por defecto).
     */
    page?: number;
    /**
     * Elementos por página (10 por defecto, máx 50).
     */
    perPage?: number;
}

/**
 * Resultado paginado del listado global de usuarios.
 */
export interface PaginatedUsersResult {
    users: User[];
    total: number;
    page: number;
    perPage: number;
}

/**
 * UserRepository defines the operations the application layer can perform
 * on User domain objects, regardless of the underlying implementation
 * (HTTP API, mocks, etc.).
 */
export interface UserRepository {
    /**
     * Fetch a user by ID.
     */
    getById(userId: string): Promise<User>;

    /**
     * Update a user's profile data (firstName, lastName, roles, etc.).
     */
    update(userId: string, partialUser: Partial<User>): Promise<User>;

    /**
     * Update the user's address and/or location.
     */
    updateAddress(
        userId: string,
        data: {
            address?: User["address"];
            location?: User["location"];
        }
    ): Promise<User>;

    /**
     * Fetch users belonging to a given company (if you need this feature).
     * Returns a list of User domain objects.
     */
    getByCompanyId?(companyId: string): Promise<User[]>;

    /**
     * Fetch the user from the access token (/api/me).
     */
    getCurrentUser(): Promise<User>;

    /**
     * Global, paginated list of users for platform admins (/api/users).
     * Es opcional para no romper implementaciones existentes.
     */
    getAllUsers?(filters?: UserListFilters): Promise<PaginatedUsersResult>;
}
