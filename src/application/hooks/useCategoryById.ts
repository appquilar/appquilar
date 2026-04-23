import { useEffect, useState } from "react";

import { categoryService } from "@/compositionRoot";
import type { Category } from "@/domain/models/Category";

export function useCategoryById(categoryId?: string | null) {
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const normalizedCategoryId = categoryId?.trim() ?? "";

        if (!normalizedCategoryId) {
            setCategory(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        const loadCategory = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const nextCategory = await categoryService.getById(normalizedCategoryId);

                if (!cancelled) {
                    setCategory(nextCategory);
                }
            } catch (loadError) {
                console.error("Error loading category by id:", loadError);

                if (!cancelled) {
                    setCategory(null);
                    setError("Error al cargar la categoría");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void loadCategory();

        return () => {
            cancelled = true;
        };
    }, [categoryId]);

    return {
        category,
        isLoading,
        error,
    };
}
