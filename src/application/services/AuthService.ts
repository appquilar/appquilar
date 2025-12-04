import type {AuthRepository} from "@/domain/repositories/AuthRepository";
import type {UserRepository} from "@/domain/repositories/UserRepository";
import type {AuthSession} from "@/domain/models/AuthSession";
import type {User} from "@/domain/models/User";
import type {ChangePasswordData, LoginCredentials, RegisterUserData,} from "@/domain/models/AuthCredentials";

/**
 * AuthService orchestrates auth use-cases:
 * - login / logout
 * - registration
 * - password management
 * - loading the current session and optional current user
 *
 * It sits in the application layer and depends on repositories only.
 */
export class AuthService {
    private readonly authRepository: AuthRepository;
    private readonly userRepository: UserRepository;

    constructor(authRepository: AuthRepository, userRepository: UserRepository) {
        this.authRepository = authRepository;
        this.userRepository = userRepository;
    }

    /**
     * Log in and return both the new session and (if possible) the current user.
     *
     * If the token does not contain a userId, you may decide to:
     * - add a /api/auth/me endpoint on the backend, or
     * - pass userId from elsewhere in the UI.
     */
    async login(
        credentials: LoginCredentials
    ): Promise<{ session: AuthSession; user: User | null }> {
        const session = await this.authRepository.login(credentials);

        let user: User | null = null;

        if (session.userId) {
            user = await this.userRepository.getById(session.userId);
        }

        return { session, user };
    }

    async logout(): Promise<void> {
        await this.authRepository.logout();
    }

    async register(data: RegisterUserData): Promise<void> {
        await this.authRepository.register(data);
    }

    async requestPasswordReset(email: string): Promise<void> {
        await this.authRepository.requestPasswordReset(email);
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        await this.authRepository.changePassword(data);
    }

    async getCurrentSession(): Promise<AuthSession | null> {
        return this.authRepository.getCurrentSession();
    }
}
