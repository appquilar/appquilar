import { useEffect, useMemo, useState } from "react";
import { compositionRoot } from "@/compositionRoot";
import type { Site } from "@/domain/models/Site";
import type { Category } from "@/domain/models/Category";

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

        load();
    }, [siteId]);

    return {
        site,
        setSite,
        categories,
        isLoading,
        error,
    };
};
