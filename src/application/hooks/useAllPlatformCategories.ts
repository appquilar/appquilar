import { useEffect, useState } from "react";

import { categoryService } from "@/compositionRoot";
import { filterVisiblePublicCategories } from "@/domain/config/publicCategoryVisibility";
import type { Category } from "@/domain/models/Category";

const PAGE_SIZE = 50;

export function useAllPlatformCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadAllCategories = async () => {
            setIsLoading(true);
            setError(null);

            const allCategories: Category[] = [];

            try {
                let page = 1;
                let total = 0;

                do {
                    const result = await categoryService.getAllCategories({
                        page,
                        perPage: PAGE_SIZE,
                    });

                    total = result.total;
                    allCategories.push(...result.categories);

                    if (result.categories.length === 0) {
                        break;
                    }

                    page += 1;
                } while (allCategories.length < total);

                if (!cancelled) {
                    const uniqueCategories = Array.from(
                        new Map(allCategories.map((category) => [category.id, category])).values()
                    );

                    setCategories(filterVisiblePublicCategories(uniqueCategories));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Error loading all platform categories:", err);
                    setError("Error al cargar categorías");
                    if (allCategories.length > 0) {
                        setCategories(filterVisiblePublicCategories(Array.from(
                            new Map(allCategories.map((category) => [category.id, category])).values()
                        )));
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void loadAllCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        categories,
        isLoading,
        error,
    };
}
