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
import {RentalRepository} from "@/domain/repositories/RentalRepository.ts";
import {ApiRentalRepository} from "@/infrastructure/repositories/ApiRentalRepository.ts";
import {RentalService} from "@/application/services/RentalService.ts";
import { BlogRepository } from "@/domain/repositories/BlogRepository.ts";
import { ApiBlogRepository } from "@/infrastructure/repositories/ApiBlogRepository.ts";
import { BlogService } from "@/application/services/BlogService.ts";
import { CaptchaRepository } from "@/domain/repositories/CaptchaRepository.ts";
import { ApiCaptchaRepository } from "@/infrastructure/repositories/ApiCaptchaRepository.ts";
import { CaptchaService } from "@/application/services/CaptchaService.ts";
import { ContactRepository } from "@/domain/repositories/ContactRepository.ts";
import { ApiContactRepository } from "@/infrastructure/repositories/ApiContactRepository.ts";
import { ContactService } from "@/application/services/ContactService.ts";
import { CompanyMembershipRepository } from "@/domain/repositories/CompanyMembershipRepository.ts";
import { ApiCompanyMembershipRepository } from "@/infrastructure/repositories/ApiCompanyMembershipRepository.ts";
import { CompanyMembershipService } from "@/application/services/CompanyMembershipService.ts";
import { CompanyProfileRepository } from "@/domain/repositories/CompanyProfileRepository.ts";
import { ApiCompanyProfileRepository } from "@/infrastructure/repositories/ApiCompanyProfileRepository.ts";
import { CompanyProfileService } from "@/application/services/CompanyProfileService.ts";
import { CompanyInvitationRepository } from "@/domain/repositories/CompanyInvitationRepository.ts";
import { ApiCompanyInvitationRepository } from "@/infrastructure/repositories/ApiCompanyInvitationRepository.ts";
import { CompanyInvitationService } from "@/application/services/CompanyInvitationService.ts";
import { CompanyEngagementRepository } from "@/domain/repositories/CompanyEngagementRepository.ts";
import { ApiCompanyEngagementRepository } from "@/infrastructure/repositories/ApiCompanyEngagementRepository.ts";
import { CompanyEngagementService } from "@/application/services/CompanyEngagementService.ts";
import { UserEngagementRepository } from "@/domain/repositories/UserEngagementRepository.ts";
import { ApiUserEngagementRepository } from "@/infrastructure/repositories/ApiUserEngagementRepository.ts";
import { UserEngagementService } from "@/application/services/UserEngagementService.ts";
import { CompanyAdminRepository } from "@/domain/repositories/CompanyAdminRepository.ts";
import { ApiCompanyAdminRepository } from "@/infrastructure/repositories/ApiCompanyAdminRepository.ts";
import { CompanyAdminService } from "@/application/services/CompanyAdminService.ts";
import { BillingRepository } from "@/domain/repositories/BillingRepository.ts";
import { ApiBillingRepository } from "@/infrastructure/repositories/ApiBillingRepository.ts";
import { BillingService } from "@/application/services/BillingService.ts";
import { PublicCompanyProfileRepository } from "@/domain/repositories/PublicCompanyProfileRepository.ts";
import { ApiPublicCompanyProfileRepository } from "@/infrastructure/repositories/ApiPublicCompanyProfileRepository.ts";
import { PublicCompanyProfileService } from "@/application/services/PublicCompanyProfileService.ts";

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
export const rentalRepository: RentalRepository = new ApiRentalRepository(apiClient, session);
export const blogRepository: BlogRepository = new ApiBlogRepository(apiClient, session);
export const captchaRepository: CaptchaRepository = new ApiCaptchaRepository(apiClient);
export const contactRepository: ContactRepository = new ApiContactRepository(apiClient);
export const companyMembershipRepository: CompanyMembershipRepository = new ApiCompanyMembershipRepository(apiClient, session);
export const companyProfileRepository: CompanyProfileRepository = new ApiCompanyProfileRepository(apiClient, session);
export const companyInvitationRepository: CompanyInvitationRepository = new ApiCompanyInvitationRepository(apiClient, session);
export const companyEngagementRepository: CompanyEngagementRepository = new ApiCompanyEngagementRepository(apiClient, session);
export const userEngagementRepository: UserEngagementRepository = new ApiUserEngagementRepository(apiClient, session);
export const companyAdminRepository: CompanyAdminRepository = new ApiCompanyAdminRepository(apiClient, session);
export const billingRepository: BillingRepository = new ApiBillingRepository(apiClient, session);
export const publicCompanyProfileRepository: PublicCompanyProfileRepository = new ApiPublicCompanyProfileRepository(apiClient);

export const seoService = new SeoService();
export const authService = new AuthService(authRepository, userRepository);
export const userService = new UserService(userRepository, authRepository);
export const mediaService = new MediaService(mediaRepository);
export const categoryService = new CategoryService(categoryRepository);
export const siteService = new SiteService(siteRepository);
export const productService = new ProductService(productRepository);
export const rentalService = new RentalService(rentalRepository);
export const blogService = new BlogService(blogRepository);
export const captchaService = new CaptchaService(captchaRepository);
export const contactService = new ContactService(contactRepository);
export const companyMembershipService = new CompanyMembershipService(companyMembershipRepository);
export const companyProfileService = new CompanyProfileService(companyProfileRepository);
export const companyInvitationService = new CompanyInvitationService(companyInvitationRepository);
export const companyEngagementService = new CompanyEngagementService(companyEngagementRepository);
export const userEngagementService = new UserEngagementService(userEngagementRepository);
export const companyAdminService = new CompanyAdminService(companyAdminRepository);
export const billingService = new BillingService(billingRepository);
export const publicCompanyProfileService = new PublicCompanyProfileService(publicCompanyProfileRepository);

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
    rentalRepository,
    blogRepository,
    captchaRepository,
    contactRepository,
    companyMembershipRepository,
    companyProfileRepository,
    companyInvitationRepository,
    companyEngagementRepository,
    userEngagementRepository,
    companyAdminRepository,
    billingRepository,
    publicCompanyProfileRepository,

    authService,
    userService,
    mediaService,
    categoryService,
    siteService,
    productService,
    rentalService,
    blogService,
    captchaService,
    contactService,
    companyMembershipService,
    companyProfileService,
    companyInvitationService,
    companyEngagementService,
    userEngagementService,
    companyAdminService,
    billingService,
    publicCompanyProfileService,
};

export type CompositionRoot = typeof compositionRoot;
