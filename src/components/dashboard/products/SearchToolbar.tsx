import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductFilters } from '@/domain/repositories/ProductRepository';
import CategorySelect from './CategorySelect';

interface SearchToolbarProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onAddProduct: () => void;
    onSearch: (e: React.FormEvent) => void;
}

const SearchToolbar = ({
                           filters,
                           onFilterChange,
                           onAddProduct,
                           onSearch
                       }: SearchToolbarProps) => {

    const handleInputChange = (field: keyof ProductFilters, value: string) => {
        onFilterChange({
            ...filters,
            [field]: value || undefined
        });
    };

    const handleClearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                {/* Name Filter - Reduced width */}
                <Input
                    placeholder="Nombre..."
                    value={filters.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full sm:w-[250px]"
                />

                {/* Internal ID Filter */}
                <Input
                    placeholder="ID Interno..."
                    value={filters.internalId || ''}
                    onChange={(e) => handleInputChange('internalId', e.target.value)}
                    className="w-full sm:w-[150px]"
                />

                {/* Product ID Filter */}
                <Input
                    placeholder="ID Producto (UUID)..."
                    value={filters.id || ''}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    className="w-full sm:w-[280px]"
                />

                {/* Category Filter - Increased width for better look */}
                <div className="w-full sm:w-[250px]">
                    <CategorySelect
                        value={filters.categoryId || null}
                        onChange={(id) => handleInputChange('categoryId', id || '')}
                    />
                </div>

                {/* Actions - Pushed to end or next line depending on space */}
                <div className="flex items-center gap-2 mt-2 xl:mt-0 xl:ml-auto">
                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={handleClearFilters} title="Limpiar filtros">
                            <X size={16} />
                        </Button>
                    )}
                    <Button onClick={onAddProduct} className="gap-2 whitespace-nowrap">
                        <Plus size={16} />
                        Añadir Nuevo
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SearchToolbar;