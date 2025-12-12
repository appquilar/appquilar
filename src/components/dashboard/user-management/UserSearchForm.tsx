import React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { UserListFilters } from "@/domain/repositories/UserRepository";

interface UserSearchFormProps {
    filters: UserListFilters;
    onSearch: (filters: UserListFilters) => void;
    isSearching: boolean;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
                                                           filters,
                                                           onSearch,
                                                           isSearching,
                                                       }) => {
    const [localFilters, setLocalFilters] = React.useState<UserListFilters>(
        filters
    );

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange =
        (field: keyof UserListFilters) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value || undefined;
                setLocalFilters((prev) => ({
                    ...prev,
                    [field]: value,
                }));
            };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localFilters);
    };

    const handleReset = () => {
        const cleared: UserListFilters = {};
        setLocalFilters(cleared);
        onSearch(cleared);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,2fr)_auto]"
        >
            <div className="relative">
                <Input
                    placeholder="Filtrar por ID"
                    value={localFilters.id ?? ""}
                    onChange={handleChange("id")}
                    className="pr-8"
                />
            </div>

            <div className="relative">
                <Input
                    placeholder="Filtrar por email"
                    value={localFilters.email ?? ""}
                    onChange={handleChange("email")}
                    className="pr-8"
                />
            </div>

            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                />
                <Input
                    placeholder="Nombre o apellidos"
                    value={localFilters.name ?? ""}
                    onChange={handleChange("name")}
                    className="pl-9"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    disabled={isSearching}
                >
                    Buscar
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSearching}
                    className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                    Limpiar
                </button>
            </div>
        </form>
    );
};

export default UserSearchForm;
