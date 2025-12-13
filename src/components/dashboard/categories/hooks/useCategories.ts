import { useEffect, useState } from "react";
import type { Category } from "@/domain/models/Category";
import { categoryService } from "@/compositionRoot";

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await categoryService.getAllCategories({ page: 1, perPage: 200 });
                setCategories(result.categories);
            } catch (err) {
                console.error("Error loading categories:", err);
                setError("Error al cargar categorías");
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadCategories();
    }, []);

    return { categories, isLoading, error };
};
