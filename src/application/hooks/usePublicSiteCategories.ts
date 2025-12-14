import { useEffect, useMemo, useRef, useState } from "react";
import { compositionRoot } from "@/compositionRoot";
import type { Category } from "@/domain/models/Category";
import type { Site } from "@/domain/models/Site";

const MAX_PER_PAGE = 50;

// ===== Cache (memoria + sessionStorage) =====
const CACHE_KEY = "appquilar:publicSiteCategories:v1";

type CacheEntry = {
    siteId: string;
    site: Site;
    categories: Category[];
    fetchedAt: number;
};

let memCache: CacheEntry | null = null;

const readSessionCache = (): CacheEntry | null => {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CacheEntry;
    } catch {
        return null;
    }
};

const writeSessionCache = (entry: CacheEntry) => {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // ignore
    }
};

export const invalidatePublicSiteCategoriesCache = () => {
    memCache = null;
    try {
        sessionStorage.removeItem(CACHE_KEY);
    } catch {
        // ignore
    }
};

async function fetchAllCategories(): Promise<Category[]> {
    const out: Category[] = [];
    let page = 1;

    while (true) {
        const res = await compositionRoot.categoryService.getAllCategories({
            page,
            perPage: MAX_PER_PAGE,
        });

        out.push(...res.categories);

        if (out.length >= res.total) break;

        page += 1;
        if (page > 200) break; // guardrail
    }

    return out;
}

/**
 * Carga el site público por env VITE_APPQUILAR_SITE_ID y resuelve sus categorías.
 * - usa cache (memoria + sessionStorage) para render instantáneo
 * - revalida en background
 * - expone refresh() para invalidar + recargar
 */
export const usePublicSiteCategories = () => {
    const siteId = import.meta.env.VITE_APPQUILAR_SITE_ID as string | undefined;

    // bootstrap desde cache sin “flash”
    const cached = useMemo(() => {
        if (!siteId) return null;

        // memoria primero
        if (memCache?.siteId === siteId) return memCache;

        // luego sessionStorage
        const s = readSessionCache();
        if (s?.siteId === siteId) {
            memCache = s;
            return s;
        }

        return null;
    }, [siteId]);

    const [site, setSite] = useState<Site | null>(cached?.site ?? null);
    const [allCategories, setAllCategories] = useState<Category[]>(cached?.categories ?? []);
    const [isLoading, setIsLoading] = useState<boolean>(!cached); // si hay cache => no loading visible
    const [error, setError] = useState<string | null>(null);

    const revalidateInFlight = useRef(false);

    const load = async (opts?: { force?: boolean }) => {
        if (!siteId) {
            setError("Falta VITE_APPQUILAR_SITE_ID en el .env");
            setIsLoading(false);
            return;
        }

        const force = opts?.force ?? false;

        // si no forzamos y ya hay cache (estado), no mostramos loading
        if (!force && site && allCategories.length > 0) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }

        setError(null);

        try {
            const [loadedSite, loadedCategories] = await Promise.all([
                compositionRoot.siteService.getById(siteId),
                fetchAllCategories(),
            ]);

            const entry: CacheEntry = {
                siteId,
                site: loadedSite,
                categories: loadedCategories,
                fetchedAt: Date.now(),
            };

            memCache = entry;
            writeSessionCache(entry);

            setSite(loadedSite);
            setAllCategories(loadedCategories);
        } catch {
            setError("No se pudo cargar el sitio o las categorías.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let alive = true;

        const run = async () => {
            if (!siteId) {
                setError("Falta VITE_APPQUILAR_SITE_ID en el .env");
                setIsLoading(false);
                return;
            }

            // Si no hay cache, cargamos normal
            if (!cached) {
                if (!alive) return;
                await load({ force: true });
                return;
            }

            // Con cache: render instantáneo + revalidate en background
            if (revalidateInFlight.current) return;
            revalidateInFlight.current = true;

            try {
                await load({ force: false });
            } finally {
                revalidateInFlight.current = false;
            }
        };

        void run();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    const refresh = async () => {
        invalidatePublicSiteCategoriesCache();
        await load({ force: true });
    };

    const categoryById = useMemo(() => {
        const map = new Map<string, Category>();
        for (const c of allCategories) map.set(c.id, c);
        return map;
    }, [allCategories]);

    const rotatingCategories = useMemo(() => {
        if (!site) return [];
        return site.categoryIds.map((id) => categoryById.get(id)).filter(Boolean) as Category[];
    }, [site, categoryById]);

    const menuCategories = useMemo(() => {
        if (!site) return [];
        return site.menuCategoryIds.map((id) => categoryById.get(id)).filter(Boolean) as Category[];
    }, [site, categoryById]);

    const featuredCategories = useMemo(() => {
        if (!site) return [];
        return site.featuredCategoryIds.map((id) => categoryById.get(id)).filter(Boolean) as Category[];
    }, [site, categoryById]);

    return {
        site,
        allCategories,
        rotatingCategories,
        menuCategories,
        featuredCategories,
        isLoading,
        error,
        refresh,
    };
};
