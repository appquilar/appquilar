import type {AuthRepository} from "@/domain/repositories/AuthRepository";
import type {AuthSession} from "@/domain/models/AuthSession";
import {toAuthorizationHeader} from "@/domain/models/AuthSession";
import type {
    ChangePasswordData,
    LoginCredentials,
    RegisterUserData,
    ResetPasswordData,
} from "@/domain/models/AuthCredentials";
import {ApiClient} from "@/infrastructure/http/ApiClient";
import {AuthSessionStorage} from "@/infrastructure/auth/AuthSessionStorage";
import {Uuid} from "@/domain/valueObject/uuidv4";

interface LoginResponseDto {
    success: boolean;
    data?: {
        token?: string;
    };
}

interface RegisterUserDto {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

interface ChangePasswordDto {
    old_password: string;
    new_password: string;
    token: string;
}

interface ForgotPasswordDto {
    email: string;
}

/**
 * DTO usado para el flujo de "he olvidado la contraseña".
 * El backend obtiene el email a partir del token.
 */
interface ResetPasswordDto {
    email: string;
    token: string;
    password: string;
}

/**
 * ApiAuthRepository maps between backend DTOs and domain models.
 */
export class ApiAuthRepository implements AuthRepository {
    private readonly apiClient: ApiClient;
    private readonly sessionStorage: AuthSessionStorage;

    constructor(apiClient: ApiClient, sessionStorage: AuthSessionStorage) {
        this.apiClient = apiClient;
        this.sessionStorage = sessionStorage;
    }

    async login(credentials: LoginCredentials): Promise<AuthSession> {
        const dto = await this.apiClient.post<LoginResponseDto>(
            "/api/auth/login",
            {
                email: credentials.email,
                password: credentials.password,
            },
        );

        const token = dto?.data?.token;

        if (!token) {
            throw new Error("Login response did not contain a token");
        }

        return this.sessionStorage.saveToken(token);
    }

    async register(data: RegisterUserData): Promise<void> {
        const payload: RegisterUserDto = {
            user_id: Uuid.generate().toString(),
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password,
        };

        await this.apiClient.post<void>("/api/auth/register", payload, {
            skipParseJson: true,
        });
    }

    async logout(): Promise<void> {
        const session = await this.sessionStorage.getCurrentSession();

        try {
            await this.apiClient.post<void>("/api/auth/logout", undefined, {
                headers: session
                    ? {
                        Authorization: toAuthorizationHeader(session),
                    }
                    : undefined,
                skipParseJson: true,
            });
        } catch {
            // Best-effort: incluso si la llamada API falla, limpiamos la sesión local.
        }

        this.sessionStorage.clear();
    }

    async requestPasswordReset(email: string): Promise<void> {
        const payload: ForgotPasswordDto = {email};

        await this.apiClient.post<void>("/api/auth/forgot-password", payload, {
            skipParseJson: true,
        });
    }

    /**
     * Cambio de contraseña autenticado (no forma parte del flujo "he olvidado mi contraseña").
     * Ojo: revisa que este endpoint coincida con lo que tengas definido en el backend
     * (/api/users/{user_id}/change-password en la especificación).
     */
    async changePassword(data: ChangePasswordData): Promise<void> {
        const payload: ChangePasswordDto = {
            old_password: data.oldPassword,
            new_password: data.newPassword,
            token: data.token,
        };

        await this.apiClient.post<void>("/api/auth/change-password", payload, {
            skipParseJson: true,
        });
    }

    /**
     * Flujo de "he olvidado mi contraseña".
     *
     * - El token viene en el enlace del email (?token=...)
     * - El FE lo pasa como data.token
     * - El backend resuelve el email a partir de ese token
     */
    async resetPassword(data: ResetPasswordData): Promise<void> {
        const payload: ResetPasswordDto = {
            email: data.email,
            token: data.token,
            password: data.newPassword,
        };

        await this.apiClient.post<void>("/api/auth/change-password", payload, {
            skipParseJson: true,
        });
    }

    async getCurrentSession(): Promise<AuthSession | null> {
        return this.sessionStorage.getCurrentSession();
    }
}
