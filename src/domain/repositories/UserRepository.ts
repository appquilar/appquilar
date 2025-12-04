import type { User } from "../models/User";

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
}
