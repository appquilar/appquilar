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

    /**
     * Optional/legacy fields, useful while migrating from CompanyUser.
     * You can keep or remove them as your UI/domain evolves.
     */

    // Company-related info (optional).
    companyId?: string | null;
    companyName?: string | null;

    // Invitation / lifecycle status if you need it in the UI.
    status?: string | null;

    // When this user was added to the company or the system.
    dateAdded?: Date | null;

    // Avatar or profile image URL used in the UI.
    avatarUrl?: string | null;
}

/**
 * Convenience function to build a User object.
 * You can use this as a factory in your mappers (DTO -> domain).
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
    status?: string | null;
    dateAdded?: Date | null;
    avatarUrl?: string | null;
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
        status: params.status ?? null,
        dateAdded: params.dateAdded ?? null,
        avatarUrl: params.avatarUrl ?? null,
    };
}

/**
 * Returns the full name of the user, composed of firstName + lastName.
 */
export function getUserFullName(user: User): string {
    if (!user.firstName && !user.lastName) {
        return user.email;
    }

    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

/**
 * Returns true if the user has a non-empty roles array.
 */
export function userHasAnyRole(user: User): boolean {
    return Array.isArray(user.roles) && user.roles.length > 0;
}

/**
 * Returns true if the user has the given role.
 */
export function userHasRole(user: User, role: UserRole): boolean {
    return Array.isArray(user.roles) && user.roles.includes(role);
}

/**
 * Returns true if the user has an address considered "usable".
 * You can reuse hasMinimalAddress from Address if you want stricter rules.
 */
export function userHasAddress(user: User): boolean {
    return Boolean(user.address);
}

/**
 * Returns true if the user has a valid location.
 */
export function userHasLocation(user: User): boolean {
    return Boolean(user.location);
}
