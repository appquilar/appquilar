import { useEffect, useState } from "react";
import { categoryService } from "@/compositionRoot";
import type { Category, CategoryListFilters } from "@/domain/models/Category";

export function usePlatformCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [filters, setFilters] = useState<CategoryListFilters>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async (next?: CategoryListFilters) => {
        setIsLoading(true);
        setError(null);

        try {
            const f = next ?? filters;

            const result = await categoryService.getAllCategories({
                ...f,
                page,
                perPage,
            });

            setCategories(result.categories);
            setTotal(result.total);
        } catch (e) {
            console.error("Error loading categories:", e);
            setError("Error al cargar categorías");
            setCategories([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage]);

    const applyFilters = (next: CategoryListFilters) => {
        setFilters(next);
        setPage(1);
        void load(next);
    };

    return {
        categories,
        total,
        page,
        perPage,
        filters,
        isLoading,
        error,
        setPage,
        setPerPage,
        applyFilters,
        reload: () => load(),
    };
}
