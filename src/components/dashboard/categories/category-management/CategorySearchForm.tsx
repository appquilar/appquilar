import React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CategoryListFilters } from "@/domain/models/Category";

interface CategorySearchFormProps {
    filters: CategoryListFilters;
    onSearch: (filters: CategoryListFilters) => void;
    isSearching: boolean;
}

const CategorySearchForm: React.FC<CategorySearchFormProps> = ({
                                                                   filters,
                                                                   onSearch,
                                                                   isSearching,
                                                               }) => {
    const [localFilters, setLocalFilters] = React.useState<CategoryListFilters>(filters);

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange =
        (field: keyof CategoryListFilters) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value || undefined;
                setLocalFilters((prev) => ({ ...prev, [field]: value }));
            };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localFilters);
    };

    const handleReset = () => {
        const cleared: CategoryListFilters = {};
        setLocalFilters(cleared);
        onSearch(cleared);
    };

    return (
        <form onSubmit={handleSubmit} className="dashboard-filter-panel">
            <div className="dashboard-filter-grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_auto]">
                <div className="relative">
                    <Input
                        placeholder="Filtrar por ID"
                        value={localFilters.id ?? ""}
                        onChange={handleChange("id")}
                        className="pr-8"
                    />
                </div>

                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                    />
                    <Input
                        placeholder="Nombre"
                        value={localFilters.name ?? ""}
                        onChange={handleChange("name")}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={isSearching} className="flex-1 md:flex-none">
                        Buscar
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={isSearching}
                        className="flex-1 md:flex-none"
                    >
                        Limpiar
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default CategorySearchForm;
