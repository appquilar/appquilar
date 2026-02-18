import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    CompanyProfile,
    UpdateCompanyProfileInput,
} from "@/domain/models/CompanyProfile";
import type { CompanyProfileRepository } from "@/domain/repositories/CompanyProfileRepository";

type AddressDto = {
    street?: string | null;
    street2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    state?: string | null;
    country?: string | null;
} | null;

type LocationDto = {
    latitude?: number | null;
    longitude?: number | null;
} | null;

type CompanyPhoneNumberDto = {
    country_code?: string | null;
    prefix?: string | null;
    number?: string | null;
} | null;

type CompanyProfileDto = {
    company_id: string;
    owner_id?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    fiscal_identifier?: string | null;
    contact_email?: string | null;
    phone_number?: CompanyPhoneNumberDto;
    address?: AddressDto;
    location?: LocationDto;
    plan_type?: "starter" | "pro" | "enterprise";
    subscription_status?: "active" | "paused" | "canceled";
    is_founding_account?: boolean;
};

type WrappedCompanyResponse = {
    success?: boolean;
    data?: CompanyProfileDto;
};

export class ApiCompanyProfileRepository implements CompanyProfileRepository {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly getSession: () => AuthSession | null
    ) {
    }

    async getById(companyId: string): Promise<CompanyProfile> {
        const raw = await this.apiClient.get<CompanyProfileDto | WrappedCompanyResponse>(
            `/api/companies/${encodeURIComponent(companyId)}`,
            { headers: this.authHeaders() }
        );

        const dto = this.unwrap(raw);

        return {
            id: dto.company_id,
            ownerId: dto.owner_id ?? null,
            name: dto.name,
            slug: dto.slug,
            description: dto.description ?? null,
            fiscalIdentifier: dto.fiscal_identifier ?? null,
            contactEmail: dto.contact_email ?? null,
            phoneNumber: dto.phone_number
                ? {
                    countryCode: dto.phone_number.country_code ?? "",
                    prefix: dto.phone_number.prefix ?? "",
                    number: dto.phone_number.number ?? "",
                }
                : null,
            address: dto.address
                ? {
                    street: dto.address.street ?? null,
                    street2: dto.address.street2 ?? null,
                    city: dto.address.city ?? null,
                    postalCode: dto.address.postal_code ?? null,
                    state: dto.address.state ?? null,
                    country: dto.address.country ?? null,
                }
                : null,
            location: dto.location
                ? {
                    latitude: dto.location.latitude ?? null,
                    longitude: dto.location.longitude ?? null,
                }
                : null,
            planType: dto.plan_type ?? null,
            subscriptionStatus: dto.subscription_status ?? null,
            isFoundingAccount: dto.is_founding_account ?? null,
        };
    }

    async update(input: UpdateCompanyProfileInput): Promise<void> {
        const payload: Record<string, unknown> = {
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            fiscal_identifier: input.fiscalIdentifier ?? null,
            contact_email: input.contactEmail ?? null,
        };

        if (
            input.phoneNumber?.countryCode &&
            input.phoneNumber.prefix &&
            input.phoneNumber.number
        ) {
            payload.phone_number_country_code = input.phoneNumber.countryCode;
            payload.phone_number_prefix = input.phoneNumber.prefix;
            payload.phone_number_number = input.phoneNumber.number;
        }

        if (input.address) {
            payload.address = {
                street: input.address.street ?? null,
                street2: input.address.street2 ?? null,
                city: input.address.city ?? null,
                postal_code: input.address.postalCode ?? null,
                state: input.address.state ?? null,
                country: input.address.country ?? null,
            };
        }

        if (
            typeof input.location?.latitude === "number" &&
            typeof input.location?.longitude === "number"
        ) {
            payload.location = {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
            };
        }

        await this.apiClient.patch<void>(
            `/api/companies/${encodeURIComponent(input.companyId)}`,
            payload,
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

    private unwrap(raw: CompanyProfileDto | WrappedCompanyResponse): CompanyProfileDto {
        if (raw && typeof raw === "object" && "data" in raw && raw.data) {
            return raw.data;
        }

        return raw as CompanyProfileDto;
    }
}
