import {type AuthSession, createAuthSession,} from "@/domain/models/AuthSession";
import {UserRole} from "@/domain/models/UserRole";

const STORAGE_KEY = "auth_token";

/**
 * Decodes a JWT payload without validating the signature.
 * This is purely for convenience on the client side.
 */
function decodeJwtPayload(token: string): unknown | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payloadBase64 = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = atob(payloadBase64);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

interface JwtPayload {
    sub?: string;
    roles?: string[];
    exp?: number;
    [key: string]: unknown;
}

/**
 * AuthSessionStorage is responsible for persisting and restoring
 * the AuthSession from browser storage.
 */
export class AuthSessionStorage {
    saveToken(token: string): AuthSession {
        if (typeof window === "undefined") {
            return createAuthSession({ token });
        }

        window.localStorage.setItem(STORAGE_KEY, token);
        return this.buildSessionFromToken(token);
    }

    clear(): void {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.removeItem(STORAGE_KEY);
    }

    getCurrentSession(): AuthSession | null {
        if (typeof window === "undefined") {
            return null;
        }

        const token = window.localStorage.getItem(STORAGE_KEY);
        if (!token) {
            return null;
        }

        return this.buildSessionFromToken(token);
    }

    private buildSessionFromToken(token: string): AuthSession {
        const payload = decodeJwtPayload(token) as JwtPayload | null;

        if (!payload) {
            return createAuthSession({ token });
        }

        const userId = typeof payload.sub === "string" ? payload.sub : null;

        const roles: UserRole[] = Array.isArray(payload.roles)
            ? (payload.roles.filter((r) => typeof r === "string") as UserRole[])
            : [];

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
}
