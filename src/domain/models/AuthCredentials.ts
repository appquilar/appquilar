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
 * Data required to change a user's password.
 */
export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}
