import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { User } from "@/domain/models/User";

/**
 * UserService provides application-level operations on the User domain model.
 *
 * It can coordinate with AuthRepository to:
 * - retrieve the current user based on the current session
 * - handle profile updates for the logged-in user
 */
export class UserService {
    private readonly userRepository: UserRepository;
    private readonly authRepository: AuthRepository;

    constructor(userRepository: UserRepository, authRepository: AuthRepository) {
        this.userRepository = userRepository;
        this.authRepository = authRepository;
    }

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
}
