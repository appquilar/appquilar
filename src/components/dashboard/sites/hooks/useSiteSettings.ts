import { useCallback, useEffect, useMemo, useState } from "react";
import { compositionRoot } from "@/compositionRoot";
import type { Site } from "@/domain/models/Site";
import type { Category } from "@/domain/models/Category";
import { SITE_CONFIG } from "@/domain/config/siteConfig";

const SITE_ID = import.meta.env.VITE_APPQUILAR_SITE_ID as string | undefined;

async function fetchAllCategories(): Promise<Category[]> {
    const out: Category[] = [];
    let page = 1;
    const perPage = 50;

    while (true) {
        const res = await compositionRoot.categoryService.getAllCategories({ page, perPage });
        out.push(...res.categories);

        const totalLoaded = out.length;
        if (totalLoaded >= res.total) break;

        page += 1;
        if (page > 50) break; // guardrail
    }

    return out;
}

export const useSiteSettings = () => {
    const [site, setSite] = useState<Site | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const siteId = useMemo(() => SITE_ID, []);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!siteId) {
                    throw new Error("Missing VITE_APPQUILAR_SITE_ID");
                }

                const [loadedSite, loadedCategories] = await Promise.all([
                    compositionRoot.siteService.getById(siteId),
                    fetchAllCategories(),
                ]);

                setSite(loadedSite);
                setCategories(loadedCategories);
            } catch (e) {
                console.error(e);
                setError("Error al cargar la configuración del sitio.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [siteId]);

    const updateSite = useCallback((updater: (currentSite: Site) => Site) => {
        setSite((currentSite) => (currentSite ? updater(currentSite) : currentSite));
    }, []);

    const setDescription = useCallback((value: string) => {
        updateSite((currentSite) => ({
            ...currentSite,
            description: value.length > 0 ? value : null,
        }));
    }, [updateSite]);

    const setCategoryIds = useCallback((categoryIds: string[]) => {
        updateSite((currentSite) => ({
            ...currentSite,
            categoryIds,
        }));
    }, [updateSite]);

    const setMenuCategoryIds = useCallback((menuCategoryIds: string[]) => {
        updateSite((currentSite) => ({
            ...currentSite,
            menuCategoryIds: menuCategoryIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES),
        }));
    }, [updateSite]);

    const setFeaturedCategoryIds = useCallback((featuredCategoryIds: string[]) => {
        updateSite((currentSite) => ({
            ...currentSite,
            featuredCategoryIds: featuredCategoryIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES),
        }));
    }, [updateSite]);

    const save = useCallback(async () => {
        if (!site) {
            throw new Error("No site loaded");
        }

        setIsSaving(true);

        try {
            const siteToUpdate: Site = {
                ...site,
                description: site.description ?? null,
                menuCategoryIds: site.menuCategoryIds.slice(0, SITE_CONFIG.MAX_MENU_CATEGORIES),
                featuredCategoryIds: site.featuredCategoryIds.slice(0, SITE_CONFIG.MAX_FEATURED_CATEGORIES),
            };

            await compositionRoot.siteService.update(siteToUpdate);
            setSite(siteToUpdate);
        } finally {
            setIsSaving(false);
        }
    }, [site]);

    return {
        site,
        categories,
        isLoading,
        isSaving,
        error,
        setDescription,
        setCategoryIds,
        setMenuCategoryIds,
        setFeaturedCategoryIds,
        save,
    };
};
