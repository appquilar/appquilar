import type { AuthSession } from "../models/AuthSession";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
} from "../models/AuthCredentials";

/**
 * AuthRepository defines how the application layer interacts with
 * authentication-related operations.
 *
 * The implementation will live in infrastructure (e.g., ApiAuthRepository)
 * and map the backend endpoints to these domain contracts.
 */
export interface AuthRepository {
    /**
     * Log in a user with email and password.
     * Returns a new AuthSession if successful.
     */
    login(credentials: LoginCredentials): Promise<AuthSession>;

    /**
     * Register a new user account.
     * Depending on your backend, this might also return a session.
     * To keep it simple, we return void here, but you can change to AuthSession
     * if your API logs in the user immediately after registration.
     */
    register(data: RegisterUserData): Promise<void>;

    /**
     * Log out the current user.
     * For many APIs this is a best-effort operation (e.g., client-side only).
     */
    logout(): Promise<void>;

    /**
     * Trigger a password reset email.
     */
    requestPasswordReset(email: string): Promise<void>;

    /**
     * Change the user password with the old password and new password.
     */
    changePassword(data: ChangePasswordData): Promise<void>;

    /**
     * Get the current AuthSession, if available.
     * Usually this means reading from some storage (localStorage, cookies, etc.).
     */
    getCurrentSession(): Promise<AuthSession | null>;
}
