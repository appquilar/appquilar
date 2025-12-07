import { IRentalRepository } from "@/domain/repositories/IRentalRepository";
import { IProductRepository } from "@/domain/repositories/IProductRepository";
import { IConversationRepository } from "@/domain/repositories/IConversationRepository";
import { MediaRepository } from "@/domain/repositories/MediaRepository";

import { MockRentalRepository } from "./MockRentalRepository";
import { MockProductRepository } from "./MockProductRepository";
import { MockConversationRepository } from "./MockConversationRepository";

import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";

import { ApiAuthRepository } from "./ApiAuthRepository";
import { ApiUserRepository } from "./ApiUserRepository";
import { ApiMediaRepository } from "./ApiMediaRepository";

import { ApiClient } from "../http/ApiClient";
import { AuthSessionStorage } from "../auth/AuthSessionStorage";

/**
 * Central DI container for repositories
 */
export class RepositoryFactory {
    // Existing repositories
    private static rentalRepository: IRentalRepository;
    private static productRepository: IProductRepository;
    private static conversationRepository: IConversationRepository;

    // New repositories
    private static authRepository: AuthRepository;
    private static userRepository: UserRepository;
    private static mediaRepository: MediaRepository;

    // Shared infrastructure
    private static apiClient: ApiClient;
    private static sessionStorage: AuthSessionStorage;

    /**
     * Internal: lazy init ApiClient
     */
    private static getApiClient(): ApiClient {
        if (!this.apiClient) {
            // CORRECCIÓN: Usamos import.meta.env.VITE_API_BASE_URL para Vite
            // En lugar de process.env.NEXT_PUBLIC_API_BASE_URL
            this.apiClient = new ApiClient({
                baseUrl:
                    import.meta.env.VITE_API_BASE_URL ??
                    "http://localhost:9000", // fallback
            });
        }
        return this.apiClient;
    }

    /**
     * Internal: lazy init AuthSessionStorage
     */
    private static getSessionStorage(): AuthSessionStorage {
        if (!this.sessionStorage) {
            this.sessionStorage = new AuthSessionStorage();
        }
        return this.sessionStorage;
    }

    // --------------------------------------------------------------------------
    // AUTH REPOSITORY
    // --------------------------------------------------------------------------

    public static getAuthRepository(): AuthRepository {
        if (!this.authRepository) {
            this.authRepository = new ApiAuthRepository(
                this.getApiClient(),
                this.getSessionStorage()
            );
        }
        return this.authRepository;
    }

    public static setAuthRepository(repository: AuthRepository): void {
        this.authRepository = repository;
    }

    // --------------------------------------------------------------------------
    // USER REPOSITORY
    // --------------------------------------------------------------------------

    public static getUserRepository(): UserRepository {
        if (!this.userRepository) {
            const getSession = async () =>
                this.getAuthRepository().getCurrentSession();

            this.userRepository = new ApiUserRepository(
                this.getApiClient(),
                getSession
            );
        }
        return this.userRepository;
    }

    public static setUserRepository(repository: UserRepository): void {
        this.userRepository = repository;
    }

    // --------------------------------------------------------------------------
    // MEDIA REPOSITORY
    // --------------------------------------------------------------------------

    public static getMediaRepository(): MediaRepository {
        if (!this.mediaRepository) {
            const getSession = async () =>
                this.getAuthRepository().getCurrentSession();

            this.mediaRepository = new ApiMediaRepository(
                this.getApiClient(),
                getSession
            );
        }
        return this.mediaRepository;
    }

    public static setMediaRepository(repository: MediaRepository): void {
        this.mediaRepository = repository;
    }

    // --------------------------------------------------------------------------
    // RENTAL
    // --------------------------------------------------------------------------

    public static getRentalRepository(): IRentalRepository {
        if (!this.rentalRepository) {
            this.rentalRepository = new MockRentalRepository();
        }
        return this.rentalRepository;
    }

    public static setRentalRepository(repository: IRentalRepository): void {
        this.rentalRepository = repository;
    }

    // --------------------------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------------------------

    public static getProductRepository(): IProductRepository {
        if (!this.productRepository) {
            this.productRepository = new MockProductRepository();
        }
        return this.productRepository;
    }

    public static setProductRepository(repository: IProductRepository): void {
        this.productRepository = repository;
    }

    // --------------------------------------------------------------------------
    // CONVERSATION
    // --------------------------------------------------------------------------

    public static getConversationRepository(): IConversationRepository {
        if (!this.conversationRepository) {
            this.conversationRepository = new MockConversationRepository();
        }
        return this.conversationRepository;
    }

    public static setConversationRepository(
        repository: IConversationRepository
    ): void {
        this.conversationRepository = repository;
    }
}