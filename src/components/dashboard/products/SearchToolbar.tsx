import { ChevronDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DEFAULT_PRODUCT_PUBLICATION_STATUSES,
    ProductFilters
} from '@/domain/repositories/ProductRepository';
import CategorySelect from './CategorySelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { PublicationStatusType } from '@/domain/models/Product';

interface SearchToolbarProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onAddProduct: () => void;
    onSearch: (e: React.FormEvent) => void;
    isAddDisabled?: boolean;
}

const PUBLICATION_STATUS_OPTIONS: Array<{
    value: PublicationStatusType;
    label: string;
}> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'archived', label: 'Archivado' },
];

const SearchToolbar = ({
    filters,
    onFilterChange,
    onAddProduct,
    onSearch,
    isAddDisabled = false,
}: SearchToolbarProps) => {
    const handleInputChange = (
        field: Exclude<keyof ProductFilters, 'publicationStatus'>,
        value: string
    ) => {
        onFilterChange({
            ...filters,
            [field]: value || undefined,
        });
    };

    const selectedStatuses = Array.isArray(filters.publicationStatus)
        ? filters.publicationStatus
        : filters.publicationStatus
            ? [filters.publicationStatus]
            : [...DEFAULT_PRODUCT_PUBLICATION_STATUSES];

    const handlePublicationStatusToggle = (status: PublicationStatusType, checked: boolean) => {
        const nextStatuses = checked
            ? Array.from(new Set([...selectedStatuses, status]))
            : selectedStatuses.filter((currentStatus) => currentStatus !== status);

        onFilterChange({
            ...filters,
            publicationStatus: nextStatuses.length > 0 ? nextStatuses : undefined,
        });
    };

    const handleClearFilters = () => {
        onFilterChange({
            publicationStatus: [...DEFAULT_PRODUCT_PUBLICATION_STATUSES],
        });
    };

    const hasNonDefaultStatuses =
        selectedStatuses.length !== DEFAULT_PRODUCT_PUBLICATION_STATUSES.length
        || selectedStatuses.some((status) => !DEFAULT_PRODUCT_PUBLICATION_STATUSES.includes(status));

    const hasActiveFilters = Boolean(
        filters.name
        || filters.id
        || filters.internalId
        || filters.categoryId
        || hasNonDefaultStatuses
    );

    const publicationStatusLabel = (() => {
        if (selectedStatuses.length === 0) {
            return 'Todos los estados';
        }

        if (
            selectedStatuses.length === DEFAULT_PRODUCT_PUBLICATION_STATUSES.length
            && DEFAULT_PRODUCT_PUBLICATION_STATUSES.every((status) => selectedStatuses.includes(status))
        ) {
            return 'Borrador + Publicado';
        }

        return PUBLICATION_STATUS_OPTIONS
            .filter((option) => selectedStatuses.includes(option.value))
            .map((option) => option.label)
            .join(', ');
    })();

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

                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="justify-between font-normal">
                            <span className="truncate text-left">
                                Estado: {publicationStatusLabel}
                            </span>
                            <ChevronDown size={16} className="ml-2 shrink-0 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[260px] p-3">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium">Estados visibles</p>
                                <p className="text-xs text-muted-foreground">
                                    Elige uno o varios estados para el listado.
                                </p>
                            </div>
                            <div className="space-y-2">
                                {PUBLICATION_STATUS_OPTIONS.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted/40"
                                    >
                                        <Checkbox
                                            checked={selectedStatuses.includes(option.value)}
                                            onCheckedChange={(checked) =>
                                                handlePublicationStatusToggle(option.value, Boolean(checked))
                                            }
                                        />
                                        <span>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={handleClearFilters}
                            >
                                Restaurar borrador + publicado
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
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
