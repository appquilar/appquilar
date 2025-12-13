import { useEffect, useMemo, useState } from "react";
import { compositionRoot } from "@/compositionRoot";
import type { Category } from "@/domain/models/Category";
import type { Site } from "@/domain/models/Site";

/**
 * Carga el site público por env VITE_APPQUILAR_SITE_ID y resuelve sus categorías.
 * Estrategia: pedimos TODAS las categorías (paginado alto) y resolvemos por mapa.
 */
export const usePublicSiteCategories = () => {
    const siteId = import.meta.env.VITE_APPQUILAR_SITE_ID as string | undefined;

    const [site, setSite] = useState<Site | null>(null);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        const run = async () => {
            if (!siteId) {
                setError("Falta VITE_APPQUILAR_SITE_ID en el .env");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const loadedSite = await compositionRoot.siteService.getById(siteId);

                // Traemos muchas (si tienes miles, lo refinamos luego).
                const res = await compositionRoot.categoryService.getAllCategories({
                    page: 1,
                    perPage: 1000,
                });

                if (!alive) return;

                setSite(loadedSite);
                setAllCategories(res.categories);
            } catch (e) {
                if (!alive) return;
                setError("No se pudo cargar el sitio o las categorías.");
            } finally {
                if (!alive) return;
                setIsLoading(false);
            }
        };

        run();

        return () => {
            alive = false;
        };
    }, [siteId]);

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
    };
};
