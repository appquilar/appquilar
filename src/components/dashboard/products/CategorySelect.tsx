import { useMemo, type ChangeEvent } from "react";

import { useAllPlatformCategories } from "@/application/hooks/useAllPlatformCategories";
import type { Category } from "@/domain/models/Category";
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";
import { cn } from "@/lib/utils";

type Props = {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    onCategorySelect?: (category: Category | null) => void;
    disabled?: boolean;
    placeholder?: string;
    emptyLabel?: string;
    allowClear?: boolean;
    clearLabel?: string;
    showBreadcrumbs?: boolean;
};

export default function CategorySelect({
    value,
    onChange,
    onCategorySelect,
    disabled,
    placeholder = "Selecciona categoría…",
    emptyLabel = "No hay resultados",
    allowClear = false,
    clearLabel = "Sin categoría",
    showBreadcrumbs = true,
}: Props) {
    const { categories, isLoading, error } = useAllPlatformCategories();

    const categoriesById = useMemo(() => {
        return new Map(categories.map((category) => [category.id, category]));
    }, [categories]);

    const categoryOptions = useMemo(() => {
        return categories
            .map((category) => {
                const breadcrumb = buildCategoryBreadcrumbName(category, categoriesById);

                return {
                    category,
                    breadcrumb,
                };
            })
            .sort((left, right) => left.breadcrumb.localeCompare(right.breadcrumb, "es", { sensitivity: "base" }));
    }, [categories, categoriesById]);

    const handleSelect = (category: Category | null) => {
        onChange(category?.id ?? null);
        onCategorySelect?.(category);
    };

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const nextValue = event.target.value;
        handleSelect(nextValue ? categoriesById.get(nextValue) ?? null : null);
    };

    return (
        <select
            className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={disabled || isLoading || Boolean(error)}
            value={value ?? ""}
            onChange={handleChange}
        >
            <option value="" disabled={!allowClear}>
                {isLoading ? "Cargando..." : error ?? (allowClear ? clearLabel : placeholder)}
            </option>
            {categoryOptions.length === 0 && !isLoading && !error ? (
                <option value="" disabled>
                    {emptyLabel}
                </option>
            ) : null}
            {categoryOptions.map(({ category, breadcrumb }) => (
                <option key={category.id} value={category.id}>
                    {showBreadcrumbs ? breadcrumb : category.name}
                </option>
            ))}
        </select>
    );
}
