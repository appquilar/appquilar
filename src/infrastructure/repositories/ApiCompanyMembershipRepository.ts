import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    CompanyUserMembership,
    CreateCompanyInput,
    InviteCompanyUserInput,
    RemoveCompanyUserInput,
    UpdateCompanyUserRoleInput,
} from "@/domain/models/CompanyMembership";
import type { CompanyMembershipRepository } from "@/domain/repositories/CompanyMembershipRepository";

type CompanyUserDto = {
    company_id: string;
    user_id?: string | null;
    email?: string;
    role: "ROLE_ADMIN" | "ROLE_CONTRIBUTOR";
    status: "ACCEPTED" | "PENDING" | "EXPIRED" | "SUSPENDED";
};

type ListCompanyUsersResponse =
    | { success?: boolean; data?: CompanyUserDto[]; total?: number; page?: number; per_page?: number }
    | { data?: CompanyUserDto[]; total?: number; page?: number; per_page?: number };

export class ApiCompanyMembershipRepository implements CompanyMembershipRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {
    }

    async createCompany(input: CreateCompanyInput): Promise<void> {
        const payload: Record<string, unknown> = {
            company_id: input.companyId,
            owner_id: input.ownerId,
            name: input.name,
        };

        if (input.description) {
            payload.description = input.description;
        }

        if (input.fiscalIdentifier) {
            payload.fiscal_identifier = input.fiscalIdentifier;
        }

        if (input.contactEmail) {
            payload.contact_email = input.contactEmail;
        }

        if (input.phoneNumber) {
            payload.phone_number_country_code = input.phoneNumber.countryCode;
            payload.phone_number_prefix = input.phoneNumber.prefix;
            payload.phone_number_number = input.phoneNumber.number;
        }

        if (input.address) {
            payload.address = {
                street: input.address.street,
                street2: input.address.street2 ?? null,
                city: input.address.city,
                postal_code: input.address.postalCode,
                state: input.address.state,
                country: input.address.country,
            };
        }

        if (input.location) {
            payload.location = {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
            };
        }

        await this.apiClient.post<void>(
            "/api/companies",
            payload,
            {
                headers: this.authHeaders(),
                skipParseJson: true,
            }
        );
    }

    async listCompanyUsers(
        companyId: string,
        page = 1,
        perPage = 50
    ): Promise<CompanyUserMembership[]> {
        const raw = await this.apiClient.get<ListCompanyUsersResponse>(
            `/api/companies/${encodeURIComponent(companyId)}/users?page=${page}&per_page=${perPage}`,
            { headers: this.authHeaders() }
        );

        const dtoItems = this.extractData(raw);

        return dtoItems.map((dto) => ({
            companyId: dto.company_id,
            userId: dto.user_id ?? null,
            email: dto.email ?? "",
            role: dto.role,
            status: dto.status,
        }));
    }

    async inviteCompanyUser(input: InviteCompanyUserInput): Promise<void> {
        await this.apiClient.post<void>(
            `/api/companies/${encodeURIComponent(input.companyId)}/users`,
            {
                email: input.email,
                role: input.role,
            },
            {
                headers: this.authHeaders(),
                skipParseJson: true,
            }
        );
    }

    async updateCompanyUserRole(input: UpdateCompanyUserRoleInput): Promise<void> {
        await this.apiClient.patch<void>(
            `/api/companies/${encodeURIComponent(input.companyId)}/users/${encodeURIComponent(input.userId)}`,
            {
                role: input.role,
            },
            {
                headers: this.authHeaders(),
                skipParseJson: true,
            }
        );
    }

    async removeCompanyUser(input: RemoveCompanyUserInput): Promise<void> {
        await this.apiClient.delete<void>(
            `/api/companies/${encodeURIComponent(input.companyId)}/users/${encodeURIComponent(input.userId)}`,
            undefined,
            {
                headers: this.authHeaders(),
                skipParseJson: true,
            }
        );
    }

    private authHeaders(): Record<string, string> {
        const authHeader = toAuthorizationHeader(this.getSession());

        if (!authHeader) {
            return {};
        }

        return {
            Authorization: authHeader,
        };
    }

    private extractData(raw: ListCompanyUsersResponse): CompanyUserDto[] {
        if (!raw || typeof raw !== "object") {
            return [];
        }

        if ("data" in raw && Array.isArray(raw.data)) {
            return raw.data as CompanyUserDto[];
        }

        return [];
    }
}
