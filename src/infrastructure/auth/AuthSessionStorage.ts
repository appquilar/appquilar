import { type AuthSession, createAuthSession } from "@/domain/models/AuthSession";
import { UserRole } from "@/domain/models/UserRole";

const STORAGE_KEY = "auth_token";

interface JwtPayloadLike {
    sub?: string;
    roles?: unknown;
    exp?: number;
    [key: string]: unknown;
}

/**
 * Safe access to window.localStorage (not available in SSR).
 */
function getStorage(): Storage | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

/**
 * Decodes a JWT payload without validating the signature.
 * This is purely for convenience on the client side.
 */
function decodeJwtPayload(token: string): JwtPayloadLike | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payloadBase64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson) as unknown;

        if (!payload || typeof payload !== "object") {
            return null;
        }

        return payload as JwtPayloadLike;
    } catch {
        return null;
    }
}

/**
 * Maps whatever comes in payload.roles into a safe UserRole[].
 * Any unknown value is silently discarded.
 */
function mapRoles(payloadRoles: unknown): UserRole[] {
    if (!Array.isArray(payloadRoles)) {
        return [];
    }

    const allowedValues = Object.values(UserRole);

    return payloadRoles
        .filter((value): value is string => typeof value === "string")
        .filter((value): value is UserRole =>
            (allowedValues as string[]).includes(value)
        );
}

/**
 * AuthSessionStorage is responsible for persisting and restoring
 * the AuthSession from browser storage.
 *
 * IMPORTANT:
 * - We only persist the raw token in localStorage.
 * - userId, roles and expiresAt are ALWAYS derived in memory
 *   from the token (e.g. JWT claims). We never persist roles separately.
 */
export class AuthSessionStorage {
    /**
     * Persists the token and returns the corresponding AuthSession.
     */
    saveToken(token: string): AuthSession {
        const storage = getStorage();
        if (storage) {
            storage.setItem(STORAGE_KEY, token);
        }

        return this.buildSessionFromToken(token);
    }

    /**
     * Clears any persisted token.
     */
    clear(): void {
        const storage = getStorage();
        if (!storage) {
            return;
        }

        storage.removeItem(STORAGE_KEY);
    }

    /**
     * Restores the current session from storage, if present.
     */
    getCurrentSession(): AuthSession | null {
        const storage = getStorage();
        if (!storage) {
            return null;
        }

        const token = storage.getItem(STORAGE_KEY);
        if (!token) {
            return null;
        }

        return this.buildSessionFromToken(token);
    }

    /**
     * Internal helper that builds an AuthSession from a token.
     * All derived fields (userId, roles, expiresAt) are computed here.
     */
    private buildSessionFromToken(token: string): AuthSession {
        const payload = decodeJwtPayload(token);

        if (!payload) {
            return createAuthSession({ token });
        }

        const userId =
            typeof payload.sub === "string" && payload.sub.length > 0
                ? payload.sub
                : null;

        const roles = mapRoles(payload.roles);

        const expiresAt =
            typeof payload.exp === "number"
                ? new Date(payload.exp * 1000)
                : null;

        return createAuthSession({
            token,
            userId,
            roles,
            expiresAt,
        });
    }

    getCurrentSessionSync(): AuthSession | null {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            return null;
        }

        return this.buildSessionFromToken(token);
    }
}
