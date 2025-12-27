import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";

interface Props {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    disabled?: boolean;

    /**
     * ID de la categoría que estamos editando (para excluirla del selector).
     * En modo "create" será undefined.
     */
    excludeCategoryId?: string;

    /**
     * ✅ Overrides de UI (para reutilizarlo en Product)
     */
    hideLabel?: boolean;
    hideHelp?: boolean;
    labelText?: string;
    noneOptionLabel?: string;
    searchPlaceholder?: string;
    helpText?: string;

    /**
     * ✅ UX: mostrar breadcrumb debajo del nombre
     */
    showBreadcrumbs?: boolean;
}

const CategoryParentSelect = ({
                                  value,
                                  onChange,
                                  disabled,
                                  excludeCategoryId,

                                  hideLabel = false,
                                  hideHelp = false,
                                  labelText = "Categoría padre",
                                  noneOptionLabel = "Sin categoría padre",
                                  searchPlaceholder = "Buscar categorías...",
                                  helpText = "Usa el buscador para encontrar la categoría (pueden crecer indefinidamente).",

                                  showBreadcrumbs = true,
                              }: Props) => {
    const [open, setOpen] = useState(false);

    const { categories, isLoading, applyFilters } = usePlatformCategories();

    const filteredCategories = useMemo(() => {
        if (!excludeCategoryId) return categories;
        return categories.filter((c) => c.id !== excludeCategoryId);
    }, [categories, excludeCategoryId]);

    const byId = useMemo(() => {
        const map = new Map<string, Category>();
        for (const c of filteredCategories) map.set(c.id, c);
        return map;
    }, [filteredCategories]);

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

    const onSearch = (q: string) => {
        // Ojo: tu hook es paginado, así que aquí seguimos usando el filtro remoto por nombre
        applyFilters({ name: q || undefined, id: undefined });
    };

    const choose = (cat: Category | null) => {
        onChange(cat ? cat.id : null);
        setOpen(false);
    };

    const buttonLabel = useMemo(() => {
        if (!selected) return noneOptionLabel;

        if (!showBreadcrumbs) return selected.name;

        const bc = buildCategoryBreadcrumbName(selected, byId);
        // Si el helper devuelve "A > B > C" y el nombre ya es C, igualmente ayuda a contexto
        return bc || selected.name;
    }, [byId, noneOptionLabel, selected, showBreadcrumbs]);

    return (
        <div className="space-y-2">
            {!hideLabel && <p className="text-sm font-medium">{labelText}</p>}

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
                        <span className="truncate">{buttonLabel}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[420px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
                        <CommandList>
                            <CommandEmpty>{isLoading ? "Cargando..." : "No hay resultados"}</CommandEmpty>

                            <CommandGroup>
                                <CommandItem onSelect={() => choose(null)}>
                                    <Check className={`mr-2 h-4 w-4 ${value === null ? "opacity-100" : "opacity-0"}`} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm">{noneOptionLabel}</span>
                                    </div>
                                </CommandItem>

                                {filteredCategories.map((c) => {
                                    const breadcrumb = showBreadcrumbs ? buildCategoryBreadcrumbName(c, byId) : null;

                                    return (
                                        <CommandItem
                                            key={c.id}
                                            onSelect={() => choose(c)}
                                            value={`${c.name} ${c.slug} ${c.id}`}
                                        >
                                            <Check className={`mr-2 h-4 w-4 ${value === c.id ? "opacity-100" : "opacity-0"}`} />
                                            <div className="flex flex-col items-start min-w-0">
                                                <span className="text-sm font-medium truncate">{c.name}</span>
                                                {showBreadcrumbs && breadcrumb ? (
                                                    <span className="text-xs text-muted-foreground truncate">
                            {breadcrumb}
                          </span>
                                                ) : null}
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {!hideHelp && <p className="text-xs text-muted-foreground">{helpText}</p>}
        </div>
    );
};

export default CategoryParentSelect;
