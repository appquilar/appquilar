import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductFilters } from '@/domain/repositories/ProductRepository';
import CategorySelect from './CategorySelect';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SearchToolbarProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onAddProduct: () => void;
    onSearch: (e: React.FormEvent) => void;
    isAddDisabled?: boolean;
}

const SearchToolbar = ({
                           filters,
                           onFilterChange,
                           onAddProduct,
                           onSearch,
                           isAddDisabled = false,
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
        <form className="dashboard-filter-panel mb-6" onSubmit={onSearch}>
            <div className="dashboard-filter-grid">
                <Input
                    placeholder="Nombre..."
                    value={filters.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="md:col-span-2"
                />

                <Input
                    placeholder="ID Interno..."
                    value={filters.internalId || ''}
                    onChange={(e) => handleInputChange('internalId', e.target.value)}
                />

                <Input
                    placeholder="ID Producto (UUID)..."
                    value={filters.id || ''}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                />

                <CategorySelect
                    value={filters.categoryId || null}
                    onChange={(id) => handleInputChange('categoryId', id || '')}
                />

                <Select
                    value={filters.publicationStatus || 'all'}
                    onValueChange={(value) =>
                        handleInputChange(
                            'publicationStatus',
                            value === 'all' ? '' : value
                        )
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Estado de publicación" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="dashboard-filter-actions">
                {hasActiveFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClearFilters}
                        title="Limpiar filtros"
                    >
                        <X size={16} />
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={onAddProduct}
                    className="gap-2 whitespace-nowrap"
                    disabled={isAddDisabled}
                >
                    <Plus size={16} />
                    Añadir Nuevo
                </Button>
            </div>
        </form>
    );
};

export default SearchToolbar;
