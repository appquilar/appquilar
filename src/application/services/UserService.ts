import type {
    UserRepository,
    UserListFilters,
    PaginatedUsersResult,
} from "@/domain/repositories/UserRepository";
import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { User } from "@/domain/models/User";

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authRepository: AuthRepository
    ) {}

    /**
     * Get a user by ID.
     */
    async getUserById(userId: string): Promise<User> {
        return this.userRepository.getById(userId);
    }

    /**
     * Get the currently authenticated user.
     * Returns null if there's no valid session or userId.
     */
    async getCurrentUser(): Promise<User | null> {
        const session = await this.authRepository.getCurrentSession();

        if (!session || !session.userId) {
            return null;
        }

        return this.userRepository.getById(session.userId);
    }

    /**
     * Update the profile of the given user.
     */
    async updateUser(
        userId: string,
        partialUser: Partial<User>
    ): Promise<User> {
        return this.userRepository.update(userId, partialUser);
    }

    /**
     * Update the address and/or location of the given user.
     */
    async updateUserAddress(
        userId: string,
        data: {
            address?: User["address"];
            location?: User["location"];
        }
    ): Promise<User> {
        return this.userRepository.updateAddress(userId, data);
    }

    /**
     * Get users belonging to a given company.
     * Only available if the underlying repository supports it.
     */
    async getUsersByCompanyId(companyId: string): Promise<User[]> {
        if (!this.userRepository.getByCompanyId) {
            throw new Error(
                "getByCompanyId is not implemented in the current UserRepository."
            );
        }

        return this.userRepository.getByCompanyId(companyId);
    }

    /**
     * Global, paginated list of users for platform admins (/api/users).
     */
    async getAllUsers(
        filters?: UserListFilters
    ): Promise<PaginatedUsersResult> {
        if (!this.userRepository.getAllUsers) {
            throw new Error(
                "getAllUsers is not implemented in the current UserRepository."
            );
        }

        return this.userRepository.getAllUsers(filters);
    }
}
