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
import {QueryClient} from "@tanstack/react-query";
import {CategoryService} from "@/application/services/CategoryService.ts";
import {CategoryRepository} from "@/domain/repositories/CategoryRepository.ts";
import {ApiCategoryRepository} from "@/infrastructure/repositories/ApiCategoryRepository.ts";
import {SiteRepository} from "@/domain/repositories/SiteRepository.ts";
import {ApiSiteRepository} from "@/infrastructure/repositories/ApiSiteRepository.ts";
import {SiteService} from "@/application/services/SiteService.ts";
import {SeoService} from "@/core/application/SeoService.ts";
import {ProductRepository} from "@/domain/repositories/ProductRepository.ts";
import {ApiProductRepository} from "@/infrastructure/repositories/ApiProductRepository.ts";
import {ProductService} from "@/application/services/ProductService.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutos
        },
    },
});

export const apiClient = new ApiClient({baseUrl: API_BASE_URL,});

export const authSessionStorage = new AuthSessionStorage();
const session = () => authSessionStorage.getCurrentSession();

export const authRepository: AuthRepository = new ApiAuthRepository(apiClient, authSessionStorage);
export const userRepository: UserRepository = new ApiUserRepository(apiClient, session);
export const mediaRepository: MediaRepository = new ApiMediaRepository(apiClient, session);
export const categoryRepository: CategoryRepository = new ApiCategoryRepository(apiClient, session);
export const siteRepository: SiteRepository = new ApiSiteRepository(apiClient, session);
export const productRepository: ProductRepository = new ApiProductRepository(apiClient, session);

export const seoService = new SeoService();
export const authService = new AuthService(authRepository, userRepository);
export const userService = new UserService(userRepository, authRepository);
export const mediaService = new MediaService(mediaRepository);
export const categoryService = new CategoryService(categoryRepository);
export const siteService = new SiteService(siteRepository);
export const productService = new ProductService(productRepository);

export const compositionRoot = {
    queryClient,

    apiClient,
    authSessionStorage,

    seoService,
    authRepository,
    userRepository,
    mediaRepository,
    categoryRepository,
    siteRepository,
    productRepository,

    authService,
    userService,
    mediaService,
    categoryService,
    siteService,
    productService,
};

export type CompositionRoot = typeof compositionRoot;
