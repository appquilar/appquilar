import type {Location} from "./Location";
import type {UserRole} from "./UserRole";
import type {Address} from "./Address";

export interface User {
    id: string;

    firstName: string;
    lastName: string;
    email: string;

    roles: UserRole[];

    address: Address | null;
    location: Location | null;

    // Added for location privacy circle
    circle?: { latitude: number; longitude: number }[];

    /**
     * Optional/legacy fields
     */
    companyId?: string | null;
    companyName?: string | null;
    isCompanyOwner?: boolean | null;
    status?: string | null;
    dateAdded?: Date | null;

    // The UUID of the profile image
    profilePictureId?: string | null;
}

/**
 * Convenience function to build a User object.
 */
export function createUser(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles?: UserRole[];
    address?: Address | null;
    location?: Location | null;
    companyId?: string | null;
    companyName?: string | null;
    isCompanyOwner?: boolean | null;
    status?: string | null;
    dateAdded?: Date | null;
    profilePictureId?: string | null;
}): User {
    return {
        id: params.id,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        roles: params.roles ?? [],
        address: params.address ?? null,
        location: params.location ?? null,
        companyId: params.companyId ?? null,
        companyName: params.companyName ?? null,
        isCompanyOwner: params.isCompanyOwner ?? null,
        status: params.status ?? null,
        dateAdded: params.dateAdded ?? null,
        profilePictureId: params.profilePictureId ?? null,
    };
}

export function getUserFullName(user: User): string {
    if (!user.firstName && !user.lastName) {
        return user.email;
    }
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

export function userHasAnyRole(user: User): boolean {
    return Array.isArray(user.roles) && user.roles.length > 0;
}

export function userHasRole(user: User, role: UserRole): boolean {
    return Array.isArray(user.roles) && user.roles.includes(role);
}

export function userHasAddress(user: User): boolean {
    return Boolean(user.address);
}

export function userHasLocation(user: User): boolean {
    return Boolean(user.location);
}
