import type {
    CompanyAdminFilters,
    CompanyAdminRepository,
    PaginatedAdminCompaniesResult,
} from "@/domain/repositories/CompanyAdminRepository";
import type { CompanyAdminSummary } from "@/domain/models/CompanyAdminSummary";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";

interface CompanyAdminDto {
    company_id: string;
    owner_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    fiscal_identifier?: string | null;
    contact_email?: string | null;
    plan_type: "starter" | "pro" | "enterprise";
    subscription_status: "active" | "paused" | "canceled";
    is_founding_account: boolean;
}

interface CompanyListResponseDto {
    success: boolean;
    data: CompanyAdminDto[];
    total: number;
    page: number;
}

const mapDtoToDomain = (dto: CompanyAdminDto): CompanyAdminSummary => {
    return {
        id: dto.company_id,
        ownerId: dto.owner_id,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        fiscalIdentifier: dto.fiscal_identifier ?? null,
        contactEmail: dto.contact_email ?? null,
        planType: dto.plan_type,
        subscriptionStatus: dto.subscription_status,
        isFoundingAccount: dto.is_founding_account,
    };
};

export class ApiCompanyAdminRepository implements CompanyAdminRepository {
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

    async listCompanies(
        filters?: CompanyAdminFilters
    ): Promise<PaginatedAdminCompaniesResult> {
        const headers = await this.authHeaders();

        const params = new URLSearchParams();

        if (filters?.name) {
            params.set("name", filters.name);
        }

        if (filters?.page) {
            params.set("page", String(filters.page));
        }

        if (filters?.perPage) {
            params.set("per_page", String(filters.perPage));
        }

        const qs = params.toString();
        const path = "/api/companies" + (qs ? `?${qs}` : "");

        const response = await this.apiClient.get<CompanyListResponseDto>(path, {
            headers,
        });

        return {
            companies: response.data.map(mapDtoToDomain),
            total: response.total,
            page: response.page,
        };
    }
}
