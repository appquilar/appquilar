import type {
    UserRepository,
    UserListFilters,
    PaginatedUsersResult,
} from "@/domain/repositories/UserRepository";
import type { User } from "@/domain/models/User";
import type { Address } from "@/domain/models/Address";
import type { Location } from "@/domain/models/Location";
import { UserRole } from "@/domain/models/UserRole";
import { ApiClient } from "@/infrastructure/http/ApiClient";
import type { AuthSession } from "@/domain/models/AuthSession";
import { toAuthorizationHeader } from "@/domain/models/AuthSession";
import type {
    CompanyContext,
    CompanyPlanType,
    CompanyUserRoleType,
    SubscriptionStatus,
    UserPlanType,
} from "@/domain/models/Subscription";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface AddressDto {
    street: string | null;
    street2: string | null;
    city: string | null;
    postal_code: string | null;
    state: string | null;
    country: string | null;
}

interface LocationDto {
    latitude: number | null;
    longitude: number | null;
}

interface UserDto {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    roles: string[];

    address: AddressDto | null;
    location: LocationDto | null;

    company_id?: string | null;
    company_name?: string | null;
    company_role?: string | null;
    is_company_owner?: boolean | null;
    plan_type?: UserPlanType | null;
    subscription_status?: SubscriptionStatus | null;
    company_plan_type?: CompanyPlanType | null;
    company_subscription_status?: SubscriptionStatus | null;
    company_is_founding_account?: boolean | null;
    company_context?: {
        company_id: string;
        company_name: string;
        company_role: CompanyUserRoleType;
        is_company_owner: boolean;
        plan_type: CompanyPlanType;
        subscription_status: SubscriptionStatus;
        is_founding_account: boolean;
    } | null;
    company?: {
        company_id?: string;
        id?: string;
        name?: string;
    } | null;
    status?: string | null;
    date_added?: string | null;
    avatar_url?: string | null;

    /**
     * BACKEND FIELD (OpenAPI): profile_picture_id
     */
    profile_picture_id?: string | null;
}

/**
 * Respuesta de /api/users según nelmio_api_doc.yaml:
 * {
 *   data: User[],
 *   total: number,
 *   page: number,
 *   per_page: number
 * }
 */
interface UserListResponseDto {
    data: UserDto[];
    total: number;
    page: number;
    per_page: number;
}

interface UpdateUserDto {
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string[];

    /**
     * BACKEND FIELD (OpenAPI): profile_picture_id
     */
    profile_picture_id?: string | null;
}

interface UpdateUserAddressDto {
    address?: AddressDto | null;
    location?: LocationDto | null;
}

function mapAddressDtoToDomain(dto: AddressDto | null): Address | null {
    if (!dto) return null;
    return {
        street: dto.street,
        street2: dto.street2,
        city: dto.city,
        postalCode: dto.postal_code,
        state: dto.state,
        country: dto.country,
    };
}

function mapLocationDtoToDomain(dto: LocationDto | null): Location | null {
    if (!dto) return null;
    return {
        latitude: dto.latitude,
        longitude: dto.longitude,
    };
}

function mapUserDtoToDomain(dto: UserDto): User {
    const roles: UserRole[] = Array.isArray(dto.roles)
        ? (dto.roles.filter((r) => typeof r === "string") as UserRole[])
        : [];
    const companyId = dto.company_id ?? dto.company?.company_id ?? dto.company?.id ?? null;
    const companyName = dto.company_name ?? dto.company?.name ?? null;
    const companyRole = (dto.company_role as CompanyUserRoleType | null | undefined) ?? null;
    const companyContext: CompanyContext | null = dto.company_context
        ? {
            companyId: dto.company_context.company_id,
            companyName: dto.company_context.company_name,
            companyRole: dto.company_context.company_role,
            isCompanyOwner: dto.company_context.is_company_owner,
            planType: dto.company_context.plan_type,
            subscriptionStatus: dto.company_context.subscription_status,
            isFoundingAccount: dto.company_context.is_founding_account,
        }
        : companyId
            ? {
                companyId,
                companyName: companyName ?? "",
                companyRole: companyRole ?? "ROLE_CONTRIBUTOR",
                isCompanyOwner: dto.is_company_owner === true,
                planType: dto.company_plan_type ?? "starter",
                subscriptionStatus: dto.company_subscription_status ?? "active",
                isFoundingAccount: dto.company_is_founding_account === true,
            }
            : null;

    return {
        id: dto.user_id || dto.id || "",
        firstName: dto.first_name,
        lastName: dto.last_name,
        email: dto.email,
        roles,
        address: mapAddressDtoToDomain(dto.address),
        location: mapLocationDtoToDomain(dto.location),
        companyId,
        companyName,
        companyRole,
        isCompanyOwner: dto.is_company_owner ?? null,
        companyContext,
        planType: dto.plan_type ?? "explorer",
        subscriptionStatus: dto.subscription_status ?? "active",
        status: dto.status ?? null,
        dateAdded: dto.date_added ? new Date(dto.date_added) : null,
        // OpenAPI: profile_picture_id
        profilePictureId: dto.profile_picture_id ?? null,
    };
}

function mapAddressDomainToDto(address?: Address | null): AddressDto | null {
    if (!address) return null;
    return {
        street: address.street ?? null,
        street2: address.street2 ?? null,
        city: address.city ?? null,
        postal_code: address.postalCode ?? null,
        state: address.state ?? null,
        country: address.country ?? null,
    };
}

function mapLocationDomainToDto(location?: Location | null): LocationDto | null {
    if (!location) return null;
    return {
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
    };
}

export class ApiUserRepository implements UserRepository {
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

    async getCurrentUser(): Promise<User> {
        const headers = await this.authHeaders();
        const response = await this.apiClient.get<ApiResponse<UserDto>>(
            "/api/me",
            { headers }
        );
        return mapUserDtoToDomain(response.data);
    }

    async getById(userId: string): Promise<User> {
        const headers = await this.authHeaders();
        const response = await this.apiClient.get<ApiResponse<UserDto>>(
            `/api/users/${encodeURIComponent(userId)}`,
            { headers }
        );
        return mapUserDtoToDomain(response.data);
    }

    async update(userId: string, partialUser: Partial<User>): Promise<User> {
        const headers = await this.authHeaders();

        const payload: UpdateUserDto = {};

        if (partialUser.firstName !== undefined)
            payload.first_name = partialUser.firstName;
        if (partialUser.lastName !== undefined)
            payload.last_name = partialUser.lastName;
        if (partialUser.email !== undefined) payload.email = partialUser.email;
        if (partialUser.roles !== undefined)
            payload.roles = partialUser.roles as string[];

        if (partialUser.profilePictureId !== undefined) {
            // OpenAPI: profile_picture_id
            payload.profile_picture_id = partialUser.profilePictureId;
        }

        await this.apiClient.patch(
            `/api/users/${encodeURIComponent(userId)}`,
            payload,
            { headers }
        );

        return this.getById(userId);
    }

    async updateAddress(
        userId: string,
        data: { address?: User["address"]; location?: User["location"] }
    ): Promise<User> {
        const headers = await this.authHeaders();
        const payload: UpdateUserAddressDto = {
            address: mapAddressDomainToDto(data.address),
            location: mapLocationDomainToDto(data.location),
        };

        await this.apiClient.patch<ApiResponse<UserDto>>(
            `/api/users/${encodeURIComponent(userId)}/address`,
            payload,
            { headers }
        );
        return this.getById(userId);
    }

    async getByCompanyId(companyId: string): Promise<User[]> {
        const headers = await this.authHeaders();
        const response = await this.apiClient.get<ApiResponse<UserDto[]>>(
            `/api/companies/${encodeURIComponent(companyId)}/users`,
            { headers }
        );
        return response.data.map(mapUserDtoToDomain);
    }

    /**
     * Global list of users (/api/users) para administradores de plataforma.
     * Sigue el esquema de nelmio (sin wrapper "success").
     */
    async getAllUsers(
        filters?: UserListFilters
    ): Promise<PaginatedUsersResult> {
        const headers = await this.authHeaders();

        const params = new URLSearchParams();

        if (filters?.id) {
            params.set("id", filters.id);
        }
        if (filters?.email) {
            params.set("email", filters.email);
        }
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
        const path = "/api/users" + (qs ? `?${qs}` : "");

        const response = await this.apiClient.get<UserListResponseDto>(path, {
            headers,
        });

        return {
            users: response.data.map(mapUserDtoToDomain),
            total: response.total,
            page: response.page,
            perPage: response.per_page,
        };
    }
}
