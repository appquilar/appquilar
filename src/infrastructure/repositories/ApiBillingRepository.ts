import type {
    BillingSessionResult,
    CompanyMigrationResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
    MigrateCompanyToExplorerInput,
} from "@/domain/models/Billing";
import type { BillingRepository } from "@/domain/repositories/BillingRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface BillingSessionDto {
    url: string;
}

interface CheckoutSessionRequestDto {
    scope: "user" | "company";
    plan_type: string;
    success_url: string;
    cancel_url: string;
}

interface CustomerPortalSessionRequestDto {
    scope: "user" | "company";
    return_url: string;
}

interface MigrateCompanyToExplorerRequestDto {
    target_owner_user_id?: string;
    confirm: boolean;
}

interface MigrateCompanyToExplorerResponseDto {
    migrated_owner_user_id: string;
    company_deleted: boolean;
}

export class ApiBillingRepository implements BillingRepository {
    private readonly apiClient: ApiClient;
    private readonly getSession: () => AuthSession | null;

    constructor(apiClient: ApiClient, getSession: () => AuthSession | null) {
        this.apiClient = apiClient;
        this.getSession = getSession;
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);
        return authHeader ? { Authorization: authHeader } : {};
    }

    async createCheckoutSession(
        input: CreateCheckoutSessionInput
    ): Promise<BillingSessionResult> {
        const headers = await this.authHeaders();

        const payload: CheckoutSessionRequestDto = {
            scope: input.scope,
            plan_type: input.planType,
            success_url: input.successUrl,
            cancel_url: input.cancelUrl,
        };

        const response = await this.apiClient.post<ApiResponse<BillingSessionDto>>(
            "/api/billing/checkout-session",
            payload,
            { headers }
        );

        return {
            url: response.data.url,
        };
    }

    async createCustomerPortalSession(
        input: CreateCustomerPortalSessionInput
    ): Promise<BillingSessionResult> {
        const headers = await this.authHeaders();

        const payload: CustomerPortalSessionRequestDto = {
            scope: input.scope,
            return_url: input.returnUrl,
        };

        const response = await this.apiClient.post<ApiResponse<BillingSessionDto>>(
            "/api/billing/customer-portal-session",
            payload,
            { headers }
        );

        return {
            url: response.data.url,
        };
    }

    async migrateCompanyToExplorer(
        input: MigrateCompanyToExplorerInput
    ): Promise<CompanyMigrationResult> {
        const headers = await this.authHeaders();

        const payload: MigrateCompanyToExplorerRequestDto = {
            confirm: input.confirm,
        };

        if (input.targetOwnerUserId) {
            payload.target_owner_user_id = input.targetOwnerUserId;
        }

        const response = await this.apiClient.post<ApiResponse<MigrateCompanyToExplorerResponseDto>>(
            "/api/billing/company/migrate-to-explorer",
            payload,
            { headers }
        );

        return {
            migratedOwnerUserId: response.data.migrated_owner_user_id,
            companyDeleted: response.data.company_deleted,
        };
    }
}
