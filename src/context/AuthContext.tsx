import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from "@/domain/models/User";
import type {
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
} from "@/domain/models/AuthCredentials";
import type { AuthSession } from "@/domain/models/AuthSession";

import { AuthService } from "@/application/services/AuthService";

import { ApiClient } from "@/infrastructure/http/ApiClient";
import { AuthSessionStorage } from "@/infrastructure/auth/AuthSessionStorage";
import { ApiAuthRepository } from "@/infrastructure/repositories/ApiAuthRepository";
import { ApiUserRepository } from "@/infrastructure/repositories/ApiUserRepository";

interface AuthContextType {
    /**
     * True when there is a logged-in user.
     * Alias for isAuthenticated.
     */
    isLoggedIn: boolean;
    isAuthenticated: boolean;

    /**
     * Current authenticated user (or null if there is no session).
     * Both user and currentUser are exposed for convenience.
     */
    user: User | null;
    currentUser: User | null;

    /**
     * True while resolving the initial auth state or performing
     * login/logout/refresh operations.
     */
    isLoading: boolean;

    /**
     * Login with email and password.
     */
    login: (email: string, password: string) => Promise<void>;

    /**
     * User registration.
     */
    signup: (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => Promise<void>;

    /**
     * Logout current user.
     */
    logout: () => void;

    /**
     * Request a "forgot password" email for the given address.
     */
    requestPasswordReset: (email: string) => Promise<void>;

    /**
     * Reset the password using a reset token and new password.
     */
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;

    /**
     * Forces a fresh /api/me and updates the cached user.
     */
    refreshCurrentUser: () => Promise<User | null>;

    /**
     * Exposes the AuthSession in case the UI needs non-sensitive data
     * (e.g. showing expiration date).
     */
    getCurrentSession: () => Promise<AuthSession | null>;
}

// -----------------
// Composition root
// -----------------

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const apiClient = new ApiClient({
    baseUrl: API_BASE_URL,
});

const sessionStorage = new AuthSessionStorage();
const authRepository = new ApiAuthRepository(apiClient, sessionStorage);
const userRepository = new ApiUserRepository(apiClient, () =>
    authRepository.getCurrentSession()
);

const authService = new AuthService(authRepository, userRepository);

// -----------------
// React context
// -----------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Load the current session/user once on mount.
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            setIsLoading(true);
            try {
                const user = await authService.getCurrentUser();
                if (!isMounted) return;

                setCurrentUser(user);
            } catch (error) {
                console.error("Error initialising auth state:", error);
                if (isMounted) {
                    setCurrentUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void init();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const credentials: LoginCredentials = { email, password };
            const user = await authService.login(credentials);
            setCurrentUser(user);
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<void> => {
        setIsLoading(true);
        try {
            const data: RegisterUserData = {
                firstName,
                lastName,
                email,
                password,
            };
            await authService.register(data);
            // No auto-login: the UI flow is responsible for showing messages.
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        setIsLoading(true);
        void (async () => {
            try {
                await authService.logout();
            } finally {
                setCurrentUser(null);
                setIsLoading(false);
            }
        })();
    };

    const requestPasswordReset = async (email: string): Promise<void> => {
        setIsLoading(true);
        try {
            await authService.requestPasswordReset(email);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (
        email: string,
        token: string,
        newPassword: string
    ): Promise<void> => {
        const data: ResetPasswordData = { email, token, newPassword };
        setIsLoading(true);
        try {
            await authService.resetPassword(data);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshCurrentUser = async (): Promise<User | null> => {
        setIsLoading(true);
        try {
            const user = await authService.refreshCurrentUser();
            setCurrentUser(user);
            return user;
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentSession = async (): Promise<AuthSession | null> => {
        return authService.getCurrentSession();
    };

    const isAuthenticated = !!currentUser;
    const isLoggedIn = isAuthenticated;

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isAuthenticated,
                user: currentUser,
                currentUser,
                isLoading,
                login,
                signup,
                logout,
                requestPasswordReset,
                resetPassword,
                refreshCurrentUser,
                getCurrentSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
