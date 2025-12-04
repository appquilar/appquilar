import type { UserRole } from "./UserRole";

export interface AuthSession {
    /**
     * Raw access token returned by the backend.
     * Usually a JWT.
     */
    token: string;

    /**
     * User identifier, if available (for example, from JWT `sub` claim).
     * May be null if you choose not to decode the token on the frontend.
     */
    userId: string | null;

    /**
     * Roles extracted from the token if you decide to decode it.
     * You can leave this empty and rely on the User domain model instead.
     */
    roles: UserRole[];

    /**
     * Expiration date of the current session, if obtainable from the token.
     */
    expiresAt: Date | null;
}

/**
 * Factory to create an AuthSession.
 * Useful when mapping from infrastructure (e.g. JWT + decoded claims) to domain.
 */
export function createAuthSession(params: {
    token: string;
    userId?: string | null;
    roles?: UserRole[];
    expiresAt?: Date | null;
}): AuthSession {
    return {
        token: params.token,
        userId: params.userId ?? null,
        roles: params.roles ?? [],
        expiresAt: params.expiresAt ?? null,
    };
}

/**
 * Returns true if the session has a non-empty token.
 */
export function isAuthenticated(session: AuthSession | null | undefined): boolean {
    if (!session) return false;
    return Boolean(session.token);
}

/**
 * Returns true if the session is expired at the given point in time.
 * If expiresAt is null, we consider the session as not expired.
 */
export function isSessionExpired(
    session: AuthSession | null | undefined,
    now: Date = new Date()
): boolean {
    if (!session || !session.expiresAt) {
        return false;
    }

    return session.expiresAt.getTime() <= now.getTime();
}

/**
 * Returns a string suitable for the Authorization header.
 * Example: "Bearer <token>"
 */
export function toAuthorizationHeader(
    session: AuthSession | null | undefined
): string | null {
    if (!session || !session.token) {
        return null;
    }

    return `Bearer ${session.token}`;
}

/**
 * Returns true if the session has the given role.
 */
export function sessionHasRole(
    session: AuthSession | null | undefined,
    role: UserRole
): boolean {
    if (!session || !Array.isArray(session.roles)) {
        return false;
    }

    return session.roles.includes(role);
}
