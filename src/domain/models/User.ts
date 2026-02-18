import type {Location} from "./Location";
import type {UserRole} from "./UserRole";
import type {Address} from "./Address";
import type {
    CompanyContext,
    CompanyUserRoleType,
    SubscriptionStatus,
    UserPlanType,
} from "./Subscription";

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
    companyRole?: CompanyUserRoleType | null;
    isCompanyOwner?: boolean | null;
    companyContext?: CompanyContext | null;
    planType?: UserPlanType | null;
    subscriptionStatus?: SubscriptionStatus | null;
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
    companyRole?: CompanyUserRoleType | null;
    isCompanyOwner?: boolean | null;
    companyContext?: CompanyContext | null;
    planType?: UserPlanType | null;
    subscriptionStatus?: SubscriptionStatus | null;
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
        companyRole: params.companyRole ?? null,
        isCompanyOwner: params.isCompanyOwner ?? null,
        companyContext: params.companyContext ?? null,
        planType: params.planType ?? null,
        subscriptionStatus: params.subscriptionStatus ?? null,
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
