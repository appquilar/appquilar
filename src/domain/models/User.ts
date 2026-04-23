import type {Location} from "./Location";
import {UserRole} from "./UserRole";
import type {Address} from "./Address";
import type {
    FeatureCapabilities,
    CompanyContext,
    CompanyUserRoleType,
    SubscriptionEntitlements,
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
    subscriptionCancelAtPeriodEnd?: boolean | null;
    productSlotLimit?: number | null;
    capabilities?: FeatureCapabilities | null;
    entitlements?: SubscriptionEntitlements<UserPlanType> | null;
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
    subscriptionCancelAtPeriodEnd?: boolean | null;
    productSlotLimit?: number | null;
    capabilities?: FeatureCapabilities | null;
    entitlements?: SubscriptionEntitlements<UserPlanType> | null;
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
        subscriptionCancelAtPeriodEnd: params.subscriptionCancelAtPeriodEnd ?? null,
        productSlotLimit: params.productSlotLimit ?? null,
        capabilities: params.capabilities ?? null,
        entitlements: params.entitlements ?? null,
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

export function isPlatformAdminUser(user: User | null | undefined): boolean {
    if (!user) {
        return false;
    }

    const entitlementOverride = user.entitlements?.overrides?.isPlatformAdmin;
    if (typeof entitlementOverride === "boolean") {
        return entitlementOverride;
    }

    return userHasRole(user, UserRole.ADMIN);
}

export function isRegularUser(user: User | null | undefined): boolean {
    if (!user) {
        return false;
    }

    if (userHasRole(user, UserRole.REGULAR_USER)) {
        return true;
    }

    return !isPlatformAdminUser(user);
}

export function getUserCompanyId(user: User | null | undefined): string | null {
    return user?.companyContext?.companyId ?? user?.companyId ?? null;
}

export function getUserCompanyName(user: User | null | undefined): string | null {
    return user?.companyContext?.companyName ?? user?.companyName ?? null;
}

export function getUserCompanyRole(user: User | null | undefined): CompanyUserRoleType | null {
    return user?.companyContext?.companyRole ?? user?.companyRole ?? null;
}

export function hasCompanyMembership(user: User | null | undefined): boolean {
    return Boolean(getUserCompanyId(user));
}

export function isCompanyOwnerUser(user: User | null | undefined): boolean {
    if (!user) {
        return false;
    }

    const entitlementOverride = user.companyContext?.entitlements?.overrides?.isCompanyOwner;
    if (typeof entitlementOverride === "boolean") {
        return entitlementOverride;
    }

    return user.companyContext?.isCompanyOwner === true || user.isCompanyOwner === true;
}

export function isCompanyAdminUser(user: User | null | undefined): boolean {
    if (!user) {
        return false;
    }

    const entitlementOverride = user.companyContext?.entitlements?.overrides?.isCompanyAdmin;
    if (typeof entitlementOverride === "boolean") {
        return entitlementOverride;
    }

    return getUserCompanyRole(user) === "ROLE_ADMIN";
}
