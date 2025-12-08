import {ApiClient} from "@/infrastructure/http/ApiClient";
import {AuthSessionStorage} from "@/infrastructure/auth/AuthSessionStorage";

import {ApiAuthRepository} from "@/infrastructure/repositories/ApiAuthRepository";
import {ApiUserRepository} from "@/infrastructure/repositories/ApiUserRepository";

import type {AuthRepository} from "@/domain/repositories/AuthRepository";
import type {UserRepository} from "@/domain/repositories/UserRepository";

import {AuthService} from "@/application/services/AuthService";
import {UserService} from "@/application/services/UserService";
import {MediaRepository} from "@/domain/repositories/MediaRepository.ts";
import {ApiMediaRepository} from "@/infrastructure/repositories/ApiMediaRepository.ts";
import {MediaService} from "@/application/services/MediaService.ts";

// 1) Infra básica compartida (cross-cutting)

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = new ApiClient({
    baseUrl: API_BASE_URL,
});

export const authSessionStorage = new AuthSessionStorage();
const session = () => authSessionStorage.getCurrentSession();

// 2) Repositorios (infra) ya instanciados
export const authRepository: AuthRepository = new ApiAuthRepository(apiClient, authSessionStorage);
export const userRepository: UserRepository = new ApiUserRepository(apiClient, session);
export const mediaRepository: MediaRepository = new ApiMediaRepository(apiClient, session);

// 3) Servicios de aplicación
export const authService = new AuthService(authRepository, userRepository);
export const userService = new UserService(userRepository, authRepository);
export const mediaService = new MediaService(mediaRepository);

// 4) (Opcional) Objeto “raíz” por si quieres pasarlo completo a algo
export const compositionRoot = {
    apiClient,
    authSessionStorage,
    authRepository,
    userRepository,
    authService,
    userService,
};

export type CompositionRoot = typeof compositionRoot;
