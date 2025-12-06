import type {UserRepository} from "@/domain/repositories/UserRepository";
import type {User} from "@/domain/models/User";
import type {Address} from "@/domain/models/Address";
import type {Location} from "@/domain/models/Location";
import {UserRole} from "@/domain/models/UserRole";
import {ApiClient} from "@/infrastructure/http/ApiClient";
import type {AuthSession} from "@/domain/models/AuthSession";
import {toAuthorizationHeader} from "@/domain/models/AuthSession";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

/**
 * DTOs aligned with backend User, Address and Location schemas.
 */

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
    first_name: string;
    last_name: string;
    email: string;
    roles: string[];

    address: AddressDto | null;
    location: LocationDto | null;

    company_id?: string | null;
    company_name?: string | null;
    status?: string | null;
    date_added?: string | null;
    avatar_url?: string | null;
}

interface UpdateUserDto {
    first_name?: string;
    last_name?: string;
    roles?: string[];
}

interface UpdateUserAddressDto {
    address?: AddressDto | null;
    location?: LocationDto | null;
}

/**
 * Helper to map DTOs to domain models.
 */

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

    return {
        id: dto.id,
        firstName: dto.first_name,
        lastName: dto.last_name,
        email: dto.email,
        roles,
        address: mapAddressDtoToDomain(dto.address),
        location: mapLocationDtoToDomain(dto.location),
        companyId: dto.company_id ?? null,
        companyName: dto.company_name ?? null,
        status: dto.status ?? null,
        dateAdded: dto.date_added ? new Date(dto.date_added) : null,
        avatarUrl: dto.avatar_url ?? null,
    };
}

/**
 * Helper to map domain models to DTOs for updates.
 */

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

/**
 * ApiUserRepository is the HTTP implementation of UserRepository
 * using the Symfony backend.
 */
export class ApiUserRepository implements UserRepository {
    private readonly apiClient: ApiClient;
    private readonly getSession: () => Promise<AuthSession | null>;

    constructor(
        apiClient: ApiClient,
        getSession: () => Promise<AuthSession | null>
    ) {
        this.apiClient = apiClient;
        this.getSession = getSession;
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const session = await this.getSession();
        const authHeader = toAuthorizationHeader(session);

        if (!authHeader) {
            return {};
        }

        return {
            Authorization: authHeader,
        };
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

        if (partialUser.firstName !== undefined) {
            payload.first_name = partialUser.firstName;
        }

        if (partialUser.lastName !== undefined) {
            payload.last_name = partialUser.lastName;
        }

        if (partialUser.roles !== undefined) {
            payload.roles = partialUser.roles as string[];
        }

        const response = await this.apiClient.patch<ApiResponse<UserDto>>(
            `/api/users/${encodeURIComponent(userId)}`,
            payload,
            { headers }
        );

        return mapUserDtoToDomain(response.data);
    }

    async updateAddress(
        userId: string,
        data: {
            address?: User["address"];
            location?: User["location"];
        }
    ): Promise<User> {
        const headers = await this.authHeaders();

        const payload: UpdateUserAddressDto = {
            address: mapAddressDomainToDto(data.address),
            location: mapLocationDomainToDto(data.location),
        };

        const response = await this.apiClient.patch<ApiResponse<UserDto>>(
            `/api/users/${encodeURIComponent(userId)}/address`,
            payload,
            { headers }
        );

        return mapUserDtoToDomain(response.data);
    }

    async getByCompanyId(companyId: string): Promise<User[]> {
        const headers = await this.authHeaders();

        const response = await this.apiClient.get<ApiResponse<UserDto[]>>(
            `/api/companies/${encodeURIComponent(companyId)}/users`,
            { headers }
        );

        return response.data.map(mapUserDtoToDomain);
    }
}
