import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import type { User } from "@/domain/models/User";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
} from "@/domain/models/AuthCredentials";

import { compositionRoot, queryClient } from "@/compositionRoot";
import { UserRole } from "@/domain/models/UserRole";
import type { AuthSession } from "@/domain/models/AuthSession";
import { Uuid } from "@/domain/valueObject/uuidv4";
import type { CreateCompanyInput } from "@/domain/models/CompanyMembership";
import { ApiError } from "@/infrastructure/http/ApiClient";

const authService = compositionRoot.authService;
const companyMembershipService = compositionRoot.companyMembershipService;

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: User | null;
    authBlockMessage: string | null;

    isLoggedIn: boolean;
    hasRole: (role: UserRole) => boolean;
    canAccess: (required: UserRole[]) => boolean;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        captchaToken: string,
    ) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (
        email: string,
        token: string,
        newPassword: string
    ) => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    refreshCurrentUser: () => Promise<User | null>;
    getCurrentSession: () => Promise<AuthSession | null>;
    upgradeToCompany: (
        input: string | Omit<CreateCompanyInput, "companyId" | "ownerId">
    ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COMPANY_SUBSCRIPTION_INACTIVE_ERROR_CODE = "subscription.company.inactive.contact_account_manager";
const COMPANY_SUBSCRIPTION_INACTIVE_MESSAGE =
    "Hay un problema con la suscripción de tu empresa. Contacta con el gestor de la cuenta.";

const resolveAuthBlockMessage = (error: unknown): string | null => {
    if (!(error instanceof ApiError) || error.status !== 401) {
        return null;
    }

    const payload = error.payload as { error?: unknown } | undefined;
    const backendError = payload?.error;

    const errorCode = Array.isArray(backendError)
        ? backendError.find((value): value is string => typeof value === "string")
        : typeof backendError === "string"
            ? backendError
            : null;

    if (errorCode === COMPANY_SUBSCRIPTION_INACTIVE_ERROR_CODE) {
        return COMPANY_SUBSCRIPTION_INACTIVE_MESSAGE;
    }

    return null;
};

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
    const [authBlockMessage, setAuthBlockMessage] = useState<string | null>(null);

    //
    // Carga inicial: si hay sesión válida, traemos /api/me
    //
    useEffect(() => {
        const init = async () => {
            try {
                const user = await authService.getCurrentUser();
                setCurrentUser(user);
                setAuthBlockMessage(null);
            } catch (error) {
                setCurrentUser(null);
                setAuthBlockMessage(resolveAuthBlockMessage(error));
            } finally {
                setIsLoading(false);
            }
        };

        void init();
    }, []);

    //
    // Refrescar /me manualmente
    //
    const refreshCurrentUser = async (): Promise<User | null> => {
        try {
            const user = await authService.refreshCurrentUser();
            setCurrentUser(user);
            setAuthBlockMessage(null);
            return user;
        } catch (error) {
            setCurrentUser(null);
            setAuthBlockMessage(resolveAuthBlockMessage(error));
            return null;
        }
    };

    //
    // LOGIN
    //
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        setAuthBlockMessage(null);

        try {
            const credentials: LoginCredentials = { email, password };

            await authService.login(credentials);
            const user = await authService.getCurrentUser();
            console.log("User logged in:", user);
            setCurrentUser(user);

            // Por si acaso alguien más usa la query "currentUser"
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        } finally {
            setIsLoading(false);
        }
    };

    //
    // SIGNUP (no autologin)
    //
    const register = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        captchaToken: string,
    ): Promise<void> => {
        setIsLoading(true);

        try {
            const data: RegisterUserData = {
                firstName,
                lastName,
                email,
                password,
                captchaToken,
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
        setIsLoading(true);
        try {
            const data: ResetPasswordData = { email, token, newPassword };
            await authService.resetPassword(data);
        } finally {
            setIsLoading(false);
        }
    };

    //
    // CHANGE PASSWORD (usuario autenticado)
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
        setAuthBlockMessage(null);

        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        await queryClient.invalidateQueries();
    };

    const upgradeToCompany = async (
        input: string | Omit<CreateCompanyInput, "companyId" | "ownerId">
    ): Promise<void> => {
        if (!currentUser) {
            throw new Error("Not authenticated");
        }

        const payload =
            typeof input === "string"
                ? { name: input }
                : input;

        const trimmedName = payload.name.trim();
        if (!trimmedName) {
            throw new Error("El nombre de la empresa es obligatorio.");
        }

        await companyMembershipService.createCompany({
            companyId: Uuid.generate().toString(),
            ownerId: currentUser.id,
            name: trimmedName,
            description: payload.description?.trim() || null,
            fiscalIdentifier: payload.fiscalIdentifier?.trim() || null,
            contactEmail: payload.contactEmail?.trim() || null,
            phoneNumber: payload.phoneNumber ?? null,
            address: payload.address ?? null,
            location: payload.location ?? null,
        });

        await refreshCurrentUser();
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    };

    //
    // ROLES
    //
    const hasRole = (role: UserRole): boolean => {
        return currentUser?.roles?.includes(role) ?? false;
    };

    const canAccess = (required: UserRole[]): boolean => {
        if (!required || required.length === 0) return true;
        if (!currentUser) return false;
        return required.some((r) => currentUser.roles.includes(r));
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: Boolean(currentUser),
                isAuthenticated: Boolean(currentUser),
                currentUser,
                authBlockMessage,
                isLoading,
                login,
                logout,
                register,
                requestPasswordReset,
                resetPassword,
                refreshCurrentUser,
                getCurrentSession: authService.getCurrentSession.bind(authService),
                hasRole,
                canAccess,
                changePassword,
                upgradeToCompany,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
