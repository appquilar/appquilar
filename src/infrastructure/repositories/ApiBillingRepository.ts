import type {
    BillingSessionResult,
    CreateCheckoutSessionInput,
    CreateCustomerPortalSessionInput,
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
}
