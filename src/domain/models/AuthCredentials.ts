/**
 * Credentials used to log in a user.
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Data required to register a user.
 */
export interface RegisterUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

/**
 * Data required to change a user's password
 * when the user is already authenticated.
 */
export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
    token: string;
}

/**
 * Data required to reset a user's password using a reset token.
 *
 * This is the flow triggered from the "reset password" email.
 * The token is usually present in the URL.
 */
export interface ResetPasswordData {
    email: string;
    token: string;
    newPassword: string;
}
