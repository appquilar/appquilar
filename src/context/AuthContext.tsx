import {createContext, ReactNode, useContext, useEffect, useState,} from "react";

import type {User} from "@/domain/models/User";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
} from "@/domain/models/AuthCredentials";

import {compositionRoot, queryClient} from "@/compositionRoot";
import {UserRole} from "@/domain/models/UserRole.ts";
import {AuthSession} from "@/domain/models/AuthSession.ts";

const authService = compositionRoot.authService;
const userService = compositionRoot.userService;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: User | null;

    isLoggedIn: boolean;
    hasRole: (role: UserRole) => boolean;
    canAccess: (required: UserRole[]) => boolean;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (        firstName: string,
                       lastName: string,
                       email: string,
                       password: string
    ) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    refreshCurrentUser: () => Promise<User | null>;
    getCurrentSession: () => Promise<AuthSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
};

//
// PROVIDER
//
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    //
    // Load session on mount
    //
    useEffect(() => {
        const init = async () => {
            try {
                const session = await authService.getCurrentSession();
                if (session?.token) {
                    const user = await userService.getCurrentUser();
                    setCurrentUser(user);
                }
            } catch {
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        void init();
    }, []);

    //
    // Refresh /me manually
    //
    const refreshCurrentUser = async (): Promise<User | null> => {
        try {
            const user = await userService.getCurrentUser();
            setCurrentUser(user);
            return user;
        } catch {
            return null;
        }
    };

    //
    // LOGIN
    //
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);

        try {
            const credentials: LoginCredentials = { email, password };

            await authService.login(credentials);

            const user = await userService.getCurrentUser();
            setCurrentUser(user);
        } finally {
            setIsLoading(false);
        }
    };

    //
    // SIGNUP  (no autologin)
    //
    const register = async (
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
            // No autologin → el AuthModal cambiará a "login"
        } finally {
            setIsLoading(false);
        }
    };

    //
    // FORGOT PASSWORD
    //
    const forgotPassword = async (email: string): Promise<void> => {
        await authService.requestPasswordReset(email);
    };

    const requestPasswordReset = async (email: string) => {
        setIsLoading(true);
        try {
            await authService.requestPasswordReset(email);
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string) => {
        setIsLoading(true);
        try {
            const data: ResetPasswordData = { email, token, newPassword };
            await authService.resetPassword(data);
        } finally {
            setIsLoading(false);
        }
    };

    //
    // CHANGE PASSWORD (logged-in user only)
    //
    const changePassword = async (
        oldPassword: string,
        newPassword: string
    ): Promise<void> => {
        const session = await authService.getCurrentSession();
        if (!session?.token) throw new Error("Not authenticated");

        const data: ChangePasswordData = {
            oldPassword,
            newPassword,
            token: session.token,
        };

        await authService.changePassword(data);
    };

    //
    // LOGOUT
    //
    const logout = async () => {
        await authService.logout();
        setCurrentUser(null);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    };

    const hasRole = (role: UserRole): boolean => {
        return currentUser?.roles?.includes(role) ?? false;
    };

    const canAccess = (required: UserRole[]): boolean => {
        if (!required || required.length === 0) return true;
        if (!currentUser) return false;
        return required.some(r => currentUser.roles.includes(r));
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: Boolean(currentUser),
                isAuthenticated: Boolean(currentUser),
                currentUser,
                isLoading,
                login,
                logout,
                register,
                requestPasswordReset,
                resetPassword,
                refreshCurrentUser,
                getCurrentSession: authService.getCurrentSession,
                hasRole,
                canAccess,
                changePassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
