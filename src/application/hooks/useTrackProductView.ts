import { useEffect } from "react";
import { companyEngagementService } from "@/compositionRoot";

const MIN_DWELL_MS = 8000;
const ANON_ID_STORAGE_KEY = "analytics:anonymous_id";
const SESSION_ID_STORAGE_KEY = "analytics:session_id";

const createRandomId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getOrCreateStorageValue = (storage: Storage, key: string): string => {
    const existing = storage.getItem(key);
    if (existing && existing.trim().length > 0) {
        return existing;
    }

    const next = createRandomId();
    storage.setItem(key, next);
    return next;
};

export const useTrackProductView = (productId: string | null | undefined) => {
    useEffect(() => {
        if (!productId) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }

        const startedAt = Date.now();
        let tracked = false;

        const anonymousId = getOrCreateStorageValue(window.localStorage, ANON_ID_STORAGE_KEY);
        const sessionId = getOrCreateStorageValue(window.sessionStorage, SESSION_ID_STORAGE_KEY);

        const flushTracking = () => {
            if (tracked) {
                return;
            }

            const dwellTimeMs = Date.now() - startedAt;
            if (dwellTimeMs < MIN_DWELL_MS) {
                return;
            }

            tracked = true;
            companyEngagementService.trackProductView({
                productId,
                anonymousId,
                sessionId,
                dwellTimeMs,
                occurredAt: new Date().toISOString(),
            });
        };

        const minDwellTimer = window.setTimeout(flushTracking, MIN_DWELL_MS);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                flushTracking();
            }
        };

        const handlePageHide = () => {
            flushTracking();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", handlePageHide);

        return () => {
            window.clearTimeout(minDwellTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", handlePageHide);
            flushTracking();
        };
    }, [productId]);
};

