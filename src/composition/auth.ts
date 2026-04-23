import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { CompanyMembershipRepository } from "@/domain/repositories/CompanyMembershipRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import { AuthSessionStorage } from "@/infrastructure/auth/AuthSessionStorage";
import { ApiAuthRepository } from "@/infrastructure/repositories/ApiAuthRepository";
import { ApiCompanyMembershipRepository } from "@/infrastructure/repositories/ApiCompanyMembershipRepository";
import { ApiUserRepository } from "@/infrastructure/repositories/ApiUserRepository";
import { AuthService } from "@/application/services/AuthService";
import { CompanyMembershipService } from "@/application/services/CompanyMembershipService";
import { apiClient } from "@/composition/apiClient";

export const authSessionStorage = new AuthSessionStorage();
const session = () => authSessionStorage.getCurrentSession();

export const authRepository: AuthRepository = new ApiAuthRepository(apiClient, authSessionStorage);
export const userRepository: UserRepository = new ApiUserRepository(apiClient, session);
export const companyMembershipRepository: CompanyMembershipRepository = new ApiCompanyMembershipRepository(apiClient, session);

export const authService = new AuthService(authRepository, userRepository);
export const companyMembershipService = new CompanyMembershipService(companyMembershipRepository);
