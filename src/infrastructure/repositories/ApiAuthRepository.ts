import type {AuthRepository} from "@/domain/repositories/AuthRepository";
import type {AuthSession} from "@/domain/models/AuthSession";
import type {ChangePasswordData, LoginCredentials, RegisterUserData,} from "@/domain/models/AuthCredentials";
import {ApiClient} from "@/infrastructure/http/ApiClient";
import {AuthSessionStorage} from "@/infrastructure/auth/AuthSessionStorage";

interface LoginResponseDto {
    token: string;
}

interface RegisterUserDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

interface ChangePasswordDto {
    old_password: string;
    new_password: string;
}

interface ForgotPasswordDto {
    email: string;
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
            }
        );

        return this.sessionStorage.saveToken(dto.token);
    }

    async register(data: RegisterUserData): Promise<void> {
        const payload: RegisterUserDto = {
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
        try {
            await this.apiClient.post<void>("/api/auth/logout", undefined, {
                skipParseJson: true,
            });
        } catch {
            // Best-effort: even if the API call fails, clear the local session.
        }

        this.sessionStorage.clear();
    }

    async requestPasswordReset(email: string): Promise<void> {
        const payload: ForgotPasswordDto = { email };

        await this.apiClient.post<void>(
            "/api/auth/forgot-password",
            payload,
            { skipParseJson: true }
        );
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        const payload: ChangePasswordDto = {
            old_password: data.oldPassword,
            new_password: data.newPassword,
        };

        await this.apiClient.post<void>(
            "/api/auth/change-password",
            payload,
            { skipParseJson: true }
        );
    }

    async getCurrentSession(): Promise<AuthSession | null> {
        return this.sessionStorage.getCurrentSession();
    }
}
