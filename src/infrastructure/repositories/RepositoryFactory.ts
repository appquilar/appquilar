import {IRentalRepository} from "@/domain/repositories/IRentalRepository";
import {IConversationRepository} from "@/domain/repositories/IConversationRepository";

import {MockRentalRepository} from "./MockRentalRepository";
import {MockConversationRepository} from "./MockConversationRepository";

import {ApiClient} from "../http/ApiClient";
import {ProductRepository} from "@/domain/repositories/ProductRepository.ts";
import {ApiProductRepository} from "@/infrastructure/repositories/ApiProductRepository.ts";

/**
 * Central DI container for repositories
 */
export class RepositoryFactory {
    // Existing repositories
    private static rentalRepository: IRentalRepository;
    private static productRepository: ProductRepository;
    private static conversationRepository: IConversationRepository;

    // Shared infrastructure
    private static apiClient: ApiClient;

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

    public static getProductRepository(): ProductRepository {
        if (!this.productRepository) {
            this.productRepository = new ApiProductRepository(
                this.apiClient
            );
        }
        return this.productRepository;
    }

    public static setProductRepository(repository: ProductRepository): void {
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