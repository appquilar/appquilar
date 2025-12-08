import type { UserRole } from "./UserRole";

/**
 * AuthSession represents the authenticated session on the client.
 *
 * Intentionally small: we only persist the raw token in storage.
 * All derived fields (userId, roles, expiresAt) can be computed
 * from the token (e.g. JWT claims) and kept in memory.
 */
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
     * Roles attached to this user by the backend.
     * They are used for UI logic only.
     * Never rely on them for real saecurity.
     */
    roles: UserRole[];

    /**
     * Token expiration date, if available (e.g. from JWT `exp` claim).
     * Null means “we do not know the expiration”.
     */
    expiresAt: Date | null;
}

export interface CreateAuthSessionParams {
    token: string;
    userId?: string | null;
    roles?: UserRole[] | null;
    expiresAt?: Date | null;
}

/**
 * Factory function to create an AuthSession with sensible defaults.
 */
export function createAuthSession(params: CreateAuthSessionParams): AuthSession {
    return {
        token: params.token,
        userId: params.userId ?? null,
        roles: params.roles ?? [],
        expiresAt: params.expiresAt ?? null,
    };
}

/**
 * Returns true if the session is expired at the given time.
 * If no expiration is present, we assume it is NOT expired.
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
 * Convenience function: returns true if the user is authenticated.
 * Currently, it means “there is a session, and it is not expired”.
 */
export function isAuthenticated(
    session: AuthSession | null | undefined,
    now: Date = new Date()
): boolean {
    return !!session && !isSessionExpired(session, now);
}

/**
 * Builds the Authorisation header from a session, if possible.
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
