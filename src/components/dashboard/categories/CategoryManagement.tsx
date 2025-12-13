import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryManagementHeader from "./category-management/CategoryManagementHeader";
import CategorySearchForm from "./category-management/CategorySearchForm";
import CategoryTable from "./category-management/CategoryTable";
import ResultsCount from "./category-management/ResultsCount";

import { usePlatformCategories } from "@/application/hooks/usePlatformCategories";
import type { CategoryListFilters } from "@/domain/models/Category";

const CategoryManagement: React.FC = () => {
    const navigate = useNavigate();

    const {
        categories,
        total,
        page,
        perPage,
        filters,
        isLoading,
        error,
        setPage,
        applyFilters,
    } = usePlatformCategories();

    const [lastAppliedFilters, setLastAppliedFilters] = useState<CategoryListFilters>(filters);

    const handleSearch = (newFilters: CategoryListFilters) => {
        setLastAppliedFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleCreate = () => {
        navigate("/dashboard/categories/new");
    };

    const handleEdit = (categoryId: string) => {
        if (!categoryId) return;
        navigate(`/dashboard/categories/${encodeURIComponent(categoryId)}`);
    };

    const handleViewProducts = (categoryId: string) => {
        // placeholder (no implementado)
        navigate(`/dashboard/categories/${encodeURIComponent(categoryId)}/products`);
    };

    return (
        <div className="space-y-6 max-w-full">
            <CategoryManagementHeader onCreate={handleCreate} />

            <CategorySearchForm
                filters={lastAppliedFilters}
                onSearch={handleSearch}
                isSearching={isLoading}
            />

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                    {error}
                </div>
            )}

            <ResultsCount visibleCount={categories.length} total={total} />

            <CategoryTable
                categories={categories}
                isLoading={isLoading}
                onEdit={handleEdit}
                onViewProducts={handleViewProducts}
            />

            {/* Paginación (simple placeholder similar a users si ya tienes componente, úsalo)
                Si ya tienes paginación en UserTable, úsala igual aquí.
                Por ahora no rompo nada: el hook soporta setPage(). */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    className="px-3 py-2 border rounded-md disabled:opacity-50"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </button>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                    Página {page} (x{perPage})
                </div>
                <button
                    type="button"
                    className="px-3 py-2 border rounded-md disabled:opacity-50"
                    disabled={isLoading || categories.length < perPage}
                    onClick={() => setPage(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default CategoryManagement;
