export enum UserRole {
    REGULAR_USER = "ROLE_USER",
    ADMIN = "ROLE_ADMIN",
    COMPANY_ADMIN = "company_admin",
}

export function canRoleAccess(
    role: UserRole,
    requiredRoles: UserRole[]
): boolean {
    switch (role) {
        case UserRole.ADMIN:
            return true;

        case UserRole.REGULAR_USER:
            return requiredRoles.includes(UserRole.REGULAR_USER);

        default:
            return false;
    }
}

export function hasRole(
    roles: UserRole[],
    role: UserRole
): boolean {
    return roles.includes(role);
}
