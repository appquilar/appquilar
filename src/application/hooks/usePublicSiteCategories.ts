import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { compositionRoot } from "@/compositionRoot";
import type { Category } from "@/domain/models/Category";
import type { Site } from "@/domain/models/Site";

const MAX_PER_PAGE = 50;
const PUBLIC_SITE_CATEGORIES_QUERY_KEY = ["publicSiteCategories"] as const;

// ===== Cache (memoria + sessionStorage) =====
const CACHE_KEY = "appquilar:publicSiteCategories:v2";

type CacheEntry = {
    siteId: string;
    site: Site;
    categories: Category[];
    fetchedAt: number;
};

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
    try {
        sessionStorage.removeItem(CACHE_KEY);
    } catch {
        // ignore
    }
};

const buildPublicSiteCategoriesQueryKey = (siteId: string) =>
    [...PUBLIC_SITE_CATEGORIES_QUERY_KEY, siteId] as const;

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

async function fetchPublicSiteCategories(siteId: string): Promise<Omit<CacheEntry, "fetchedAt">> {
    const [site, categories] = await Promise.all([
        compositionRoot.siteService.getById(siteId),
        fetchAllCategories(),
    ]);

    return {
        siteId,
        site,
        categories,
    };
}

/**
 * Carga el site público por env VITE_APPQUILAR_SITE_ID y resuelve sus categorías.
 * - usa cache (memoria + sessionStorage) para render instantáneo
 * - revalida en background
 * - expone refresh() para invalidar + recargar
 */
export const usePublicSiteCategories = () => {
    const siteId = import.meta.env.VITE_APPQUILAR_SITE_ID as string | undefined;
    const queryClient = useQueryClient();

    // bootstrap desde cache sin “flash”
    const cached = useMemo(() => {
        if (!siteId) return null;
        const s = readSessionCache();
        return s?.siteId === siteId ? s : null;
    }, [siteId]);

    const query = useQuery({
        queryKey: siteId ? buildPublicSiteCategoriesQueryKey(siteId) : [...PUBLIC_SITE_CATEGORIES_QUERY_KEY, "missing"],
        queryFn: async () => {
            if (!siteId) {
                throw new Error("Missing public site id");
            }

            return fetchPublicSiteCategories(siteId);
        },
        enabled: Boolean(siteId),
        initialData: cached
            ? {
                siteId: cached.siteId,
                site: cached.site,
                categories: cached.categories,
            }
            : undefined,
        initialDataUpdatedAt: cached?.fetchedAt,
        placeholderData: (previousData) => previousData,
    });

    useEffect(() => {
        if (!siteId || !query.data) return;

        writeSessionCache({
            siteId,
            site: query.data.site,
            categories: query.data.categories,
            fetchedAt: query.dataUpdatedAt || Date.now(),
        });
    }, [query.data, query.dataUpdatedAt, siteId]);

    const refresh = async () => {
        if (!siteId) return;

        invalidatePublicSiteCategoriesCache();
        await queryClient.invalidateQueries({
            queryKey: buildPublicSiteCategoriesQueryKey(siteId),
        });
    };

    const site: Site | null = query.data?.site ?? cached?.site ?? null;
    const allCategories: Category[] = query.data?.categories ?? cached?.categories ?? [];

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
        isLoading: siteId ? query.isLoading : false,
        error: !siteId
            ? "Falta VITE_APPQUILAR_SITE_ID en el .env"
            : query.error
                ? "No se pudo cargar el sitio o las categorías."
                : null,
        refresh,
    };
};
