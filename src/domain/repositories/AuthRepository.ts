import type { AuthSession } from "../models/AuthSession";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
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
     * Perform login with the provided credentials.
     *
     * Implementations are expected to:
     * - Call the backend login endpoint.
     * - Persist the returned token (if any) in client storage.
     * - Return the created AuthSession.
     */
    login(credentials: LoginCredentials): Promise<AuthSession>;

    /**
     * Register a new user with the provided data.
     */
    register(data: RegisterUserData): Promise<void>;

    /**
     * Logout the current user.
     *
     * Implementations should:
     * - Best-effort call the backend logout endpoint.
     * - Clear any local session/token.
     */
    logout(): Promise<void>;

    /**
     * Request a password reset for the given email.
     *
     * Implementations should call the backend endpoint that sends
     * a reset email with a token.
     */
    requestPasswordReset(email: string): Promise<void>;

    /**
     * Change the user's password by providing the old and the new password.
     * This is typically used when the user is already authenticated.
     */
    changePassword(data: ChangePasswordData): Promise<void>;

    /**
     * Reset the user's password using a reset token (usually present in the URL).
     *
     * This is the flow triggered from the "reset password" email.
     */
    resetPassword(data: ResetPasswordData): Promise<void>;

    /**
     * Get the current AuthSession, if available.
     * Usually this means reading from some storage (localStorage, cookies, etc.).
     */
    getCurrentSession(): Promise<AuthSession | null>;

    getCurrentSessionSync(): AuthSession | null;
}
