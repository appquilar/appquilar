import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
} from "@/domain/models/AuthCredentials";
import type { AuthSession } from "@/domain/models/AuthSession";
import type { User } from "@/domain/models/User";

/**
 * AuthService is the application layer service that orchestrates
 * all authentication use cases.
 *
 * It coordinates AuthRepository (session / token) and UserRepository
 * (current user profile).
 *
 * NOTE: on the frontend we intentionally keep this stateful:
 * we keep an in-memory cache of the current user so that
 * the /api/me call is done at most once per browser session
 * (unless we explicitly force a refresh).
 */
export class AuthService {
    private cachedUser: User | null = null;
    private hasLoadedUser = false;
    private pendingUserPromise: Promise<User | null> | null = null;

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Performs login and returns the freshly loaded current user.
     * We always force a fresh /api/me after login.
     */
    async login(credentials: LoginCredentials): Promise<User> {
        await this.authRepository.login(credentials);

        const user = await this.refreshCurrentUser();
        if (!user) {
            throw new Error(
                "Login succeeded but current user could not be loaded."
            );
        }

        return user;
    }

    async register(data: RegisterUserData): Promise<void> {
        await this.authRepository.register(data);
    }

    async logout(): Promise<void> {
        await this.authRepository.logout();
        this.cachedUser = null;
        this.hasLoadedUser = false;
        this.pendingUserPromise = null;
    }

    async requestPasswordReset(email: string): Promise<void> {
        await this.authRepository.requestPasswordReset(email);
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        await this.authRepository.changePassword(data);
    }

    /**
     * Reset the password using a reset token.
     *
     * This is the flow coming from the email link.
     * We do not attempt to auto-login here; the user will log in manually.
     */
    async resetPassword(data: ResetPasswordData): Promise<void> {
        await this.authRepository.resetPassword(data);
    }

    async getCurrentSession(): Promise<AuthSession | null> {
        return this.authRepository.getCurrentSession();
    }

    /**
     * Returns the current user using an in-memory cache, so that /api/me
     * is only called once per browser session (or until logout).
     *
     * If there is no session, it returns null without calling the backend.
     */
    async getCurrentUser(): Promise<User | null> {
        // If we already loaded the user at least once, just return the cache.
        if (this.hasLoadedUser) {
            return this.cachedUser;
        }

        // If another caller already triggered the load, reuse the same promise.
        if (this.pendingUserPromise) {
            return this.pendingUserPromise;
        }

        this.pendingUserPromise = this.loadUserFromBackend();
        const user = await this.pendingUserPromise;

        this.cachedUser = user;
        this.hasLoadedUser = true;
        this.pendingUserPromise = null;

        return user;
    }

    /**
     * Forces a fresh /api/me (if there is a session) and updates the cache.
     * Useful right after login or when the UI explicitly wants to refresh.
     */
    async refreshCurrentUser(): Promise<User | null> {
        const session = await this.authRepository.getCurrentSession();
        if (!session) {
            this.cachedUser = null;
            this.hasLoadedUser = true;
            this.pendingUserPromise = null;
            return null;
        }

        const user = await this.userRepository.getCurrentUser();
        this.cachedUser = user;
        this.hasLoadedUser = true;
        this.pendingUserPromise = null;

        return user;
    }

    /**
     * Internal helper: only calls the backend if there is a valid session.
     */
    private async loadUserFromBackend(): Promise<User | null> {
        const session = await this.authRepository.getCurrentSession();
        if (!session) {
            return null;
        }

        return this.userRepository.getCurrentUser();
    }
}
