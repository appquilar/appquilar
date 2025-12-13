import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { usePlatformCategories } from "@/application/hooks/usePlatformCategories";
import type { Category } from "@/domain/models/Category";

interface Props {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    disabled?: boolean;

    /**
     * ID de la categoría que estamos editando (para excluirla del selector).
     * En modo "create" será undefined.
     */
    excludeCategoryId?: string;
}

const CategoryParentSelect = ({ value, onChange, disabled, excludeCategoryId }: Props) => {
    const [open, setOpen] = useState(false);

    // Reutilizamos hook paginado; para el selector buscamos por nombre
    const { categories, isLoading, applyFilters } = usePlatformCategories();

    const filteredCategories = useMemo(() => {
        if (!excludeCategoryId) {
            return categories;
        }
        return categories.filter((c) => c.id !== excludeCategoryId);
    }, [categories, excludeCategoryId]);

    const selected = useMemo(() => {
        return filteredCategories.find((c) => c.id === value) ?? null;
    }, [filteredCategories, value]);

    // Si por cualquier motivo el parentId actual coincide con la categoría que estamos editando,
    // lo limpiamos automáticamente.
    useEffect(() => {
        if (excludeCategoryId && value === excludeCategoryId) {
            onChange(null);
        }
    }, [excludeCategoryId, onChange, value]);

    const label = selected ? selected.name : "Sin categoría padre";

    const onSearch = (q: string) => {
        applyFilters({ name: q || undefined, id: undefined });
    };

    const choose = (cat: Category | null) => {
        onChange(cat ? cat.id : null);
        setOpen(false);
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Categoría padre</p>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        {label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[420px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar categorías..." onValueChange={onSearch} />
                        <CommandList>
                            <CommandEmpty>{isLoading ? "Cargando..." : "No hay resultados"}</CommandEmpty>

                            <CommandGroup>
                                <CommandItem onSelect={() => choose(null)}>
                                    <Check className={`mr-2 h-4 w-4 ${value === null ? "opacity-100" : "opacity-0"}`} />
                                    Sin categoría padre
                                </CommandItem>

                                {filteredCategories.map((c) => (
                                    <CommandItem
                                        key={c.id}
                                        onSelect={() => choose(c)}
                                        value={`${c.name} ${c.id}`}
                                    >
                                        <Check className={`mr-2 h-4 w-4 ${value === c.id ? "opacity-100" : "opacity-0"}`} />
                                        {c.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <p className="text-xs text-muted-foreground">
                Usa el buscador para encontrar la categoría (pueden crecer indefinidamente).
            </p>
        </div>
    );
};

export default CategoryParentSelect;
