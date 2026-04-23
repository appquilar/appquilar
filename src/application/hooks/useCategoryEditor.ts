import { useEffect, useMemo, useState } from "react";

import { categoryService } from "@/compositionRoot";
import type { Category, CategoryUpsertPayload } from "@/domain/models/Category";
import { Uuid } from "@/domain/valueObject/uuidv4";

export type CategoryFormValues = Omit<CategoryUpsertPayload, "id">;

const EMPTY_CATEGORY_VALUES: CategoryFormValues = {
    name: "",
    slug: "",
    description: null,
    parentId: null,
    iconName: null,
    featuredImageId: null,
    landscapeImageId: null,
    dynamicPropertyDefinitions: [],
};

const mapCategoryToFormValues = (category: Category): CategoryFormValues => ({
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    parentId: category.parentId ?? null,
    iconName: category.iconName ?? null,
    featuredImageId: category.featuredImageId ?? null,
    landscapeImageId: category.landscapeImageId ?? null,
    dynamicPropertyDefinitions: category.dynamicPropertyDefinitions ?? [],
});

export const useCategoryEditor = (categoryId?: string) => {
    const isCreateMode = useMemo(() => !categoryId || categoryId === "new", [categoryId]);
    const [defaultValues, setDefaultValues] = useState<CategoryFormValues>(EMPTY_CATEGORY_VALUES);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadCategory = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (isCreateMode || !categoryId) {
                    if (!cancelled) {
                        setDefaultValues(EMPTY_CATEGORY_VALUES);
                    }
                    return;
                }

                const category = await categoryService.getById(categoryId);
                if (!cancelled) {
                    setDefaultValues(mapCategoryToFormValues(category));
                }
            } catch (loadError) {
                console.error("Error loading category:", loadError);
                if (!cancelled) {
                    setDefaultValues(EMPTY_CATEGORY_VALUES);
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
    }, [categoryId, isCreateMode]);

    const saveCategory = async (values: CategoryFormValues): Promise<"created" | "updated"> => {
        setIsSubmitting(true);

        try {
            if (isCreateMode) {
                await categoryService.create({
                    id: Uuid.generate().toString(),
                    ...values,
                });

                return "created";
            }

            if (!categoryId) {
                throw new Error("Missing categoryId");
            }

            await categoryService.update({
                id: categoryId,
                ...values,
            });

            return "updated";
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        defaultValues,
        error,
        isCreateMode,
        isLoading,
        isSubmitting,
        saveCategory,
    };
};
