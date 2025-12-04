export enum UserRole {
    REGULAR_USER = "ROLE_USER",
    ADMIN = "ROLE_ADMIN",
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
