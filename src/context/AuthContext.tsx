import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from "@/domain/models/User";
import type { AuthSession } from "@/domain/models/AuthSession";
import type {
    LoginCredentials,
    RegisterUserData,
    ChangePasswordData,
} from "@/domain/models/AuthCredentials";

import { AuthService } from "@/application/services/AuthService";
import { UserService } from "@/application/services/UserService";
import { RepositoryFactory } from "@/infrastructure/repositories/RepositoryFactory";

/**
 * Application services wired with infrastructure.
 * These are singletons at module level.
 */
const authService = new AuthService(
    RepositoryFactory.getAuthRepository(),
    RepositoryFactory.getUserRepository()
);

const userService = new UserService(
    RepositoryFactory.getUserRepository(),
    RepositoryFactory.getAuthRepository()
);

/**
 * Public shape of the Auth context.
 */
export interface AuthContextState {
    /**
     * Current authenticated user, or null if not logged in.
     */
    currentUser: User | null;

    /**
     * Current auth session (token, userId, roles, expiration), or null if none.
     */
    session: AuthSession | null;

    /**
     * True while the auth state is being initialised or an auth operation is in progress.
     */
    isLoading: boolean;

    /**
     * Derived boolean: true if there is a non-null, non-empty session token.
     */
    isAuthenticated: boolean;

    /**
     * Perform login with email + password. On success, updates session and user.
     * Throws on error (to be handled by caller UI).
     */
    login: (credentials: LoginCredentials) => Promise<void>;

    /**
     * Log out the current user (server + local session).
     */
    logout: () => Promise<void>;

    /**
     * Register a new user. Does NOT auto-login by default.
     */
    register: (data: RegisterUserData) => Promise<void>;

    /**
     * Request a password reset email.
     */
    requestPasswordReset: (email: string) => Promise<void>;

    /**
     * Change the current user's password.
     */
    changePassword: (data: ChangePasswordData) => Promise<void>;

    /**
     * Force reload of the current user from the backend (e.g. after the profile update).
     */
    refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                      }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    /**
     * Derived: the user is authenticated if there is a session with a non-empty token.
     */
    const isAuthenticated = Boolean(session && session.token);

    /**
     * Initialise auth state on mount:
     * - Load existing session from storage
     * - If we have a userId, load the current user from the backend
     */
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            setIsLoading(true);
            try {
                const existingSession = await authService.getCurrentSession();

                if (!isMounted) return;

                setSession(existingSession);

                if (existingSession && existingSession.userId) {
                    const user = await userService.getUserById(existingSession.userId);
                    if (!isMounted) return;
                    setCurrentUser(user);
                } else {
                    setCurrentUser(null);
                }
            } catch {
                if (!isMounted) return;
                setSession(null);
                setCurrentUser(null);
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

    /**
     * Login: ask AuthService to login → update session + user in state.
     */
    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const { session: newSession, user } = await authService.login(credentials);
            setSession(newSession);
            setCurrentUser(user ?? null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Logout: call AuthService → clear state locally.
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setSession(null);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Register: call AuthService. No auto-login by default.
     * You can change this behaviour later if your UX requires it.
     */
    const register = useCallback(async (data: RegisterUserData) => {
        setIsLoading(true);
        try {
            await authService.register(data);
            // Optionally: auto-login here in the future.
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Request password reset email.
     */
    const requestPasswordReset = useCallback(async (email: string) => {
        setIsLoading(true);
        try {
            await authService.requestPasswordReset(email);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Change the current user's password.
     */
    const changePassword = useCallback(async (data: ChangePasswordData) => {
        setIsLoading(true);
        try {
            await authService.changePassword(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Reload current user from backend using current session.
     */
    const refreshCurrentUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await userService.getCurrentUser();
            setCurrentUser(user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value: AuthContextState = {
        currentUser,
        session,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        requestPasswordReset,
        changePassword,
        refreshCurrentUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Convenience hook to access auth context.
 */
export const useAuth = (): AuthContextState => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
