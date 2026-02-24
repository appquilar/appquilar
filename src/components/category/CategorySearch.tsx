import React from "react";
import { Search } from "lucide-react";

interface Props {
    searchQuery: string;
    categoryName: string;
    onSearchChange: (value: string) => void;
    onSearch: (e: React.FormEvent) => void;
}

const CategorySearch = ({ searchQuery, categoryName, onSearchChange, onSearch }: Props) => {
    return (
        <form onSubmit={onSearch} className="mb-6 mt-5">
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={`Buscar en ${categoryName.toLowerCase()}...`}
                    className="h-11 w-full rounded-xl border border-border/80 bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </form>
    );
};

export default CategorySearch;
