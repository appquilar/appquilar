import { useMemo, useState } from "react";
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

import { useAllPlatformCategories } from "@/application/hooks/useAllPlatformCategories";
import type { Category } from "@/domain/models/Category";
import { buildCategoryBreadcrumbName } from "@/utils/categoryBreadcrumb";
import { normalizeSearchText } from "@/utils/normalizeSearchText";

type Props = {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    onCategorySelect?: (category: Category | null) => void;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
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
    searchPlaceholder = "Buscar categoría...",
    emptyLabel = "No hay resultados",
    allowClear = false,
    clearLabel = "Sin categoría",
    showBreadcrumbs = true,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const { categories, isLoading } = useAllPlatformCategories();

    const categoriesById = useMemo(() => {
        return new Map(categories.map((category) => [category.id, category]));
    }, [categories]);

    const selected = useMemo(
        () => categories.find((c) => c.id === value) ?? null,
        [categories, value]
    );

    const filteredCategories = useMemo(() => {
        const normalizedQuery = normalizeSearchText(query);

        const enrichedCategories = categories
            .map((category) => {
                const breadcrumb = buildCategoryBreadcrumbName(category, categoriesById);

                return {
                    category,
                    breadcrumb,
                    searchText: normalizeSearchText(`${category.name} ${breadcrumb} ${category.slug}`),
                };
            })
            .sort((left, right) => left.breadcrumb.localeCompare(right.breadcrumb, "es", { sensitivity: "base" }));

        if (!normalizedQuery) {
            return enrichedCategories;
        }

        return enrichedCategories.filter((entry) => entry.searchText.includes(normalizedQuery));
    }, [categories, categoriesById, query]);

    const buttonLabel = useMemo(() => {
        if (!selected) {
            return placeholder;
        }

        if (!showBreadcrumbs) {
            return selected.name;
        }

        return buildCategoryBreadcrumbName(selected, categoriesById) || selected.name;
    }, [categoriesById, placeholder, selected, showBreadcrumbs]);

    const handleSelect = (category: Category | null) => {
        onChange(category?.id ?? null);
        onCategorySelect?.(category);
        setOpen(false);
        setQuery("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className="w-full justify-between"
                >
                    <span className="truncate">{buttonLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
                align="start"
                side="bottom"
                sideOffset={4}
                avoidCollisions={false}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>{isLoading ? "Cargando..." : emptyLabel}</CommandEmpty>
                        <CommandGroup>
                            {allowClear ? (
                                <CommandItem onSelect={() => handleSelect(null)} value="__clear__">
                                    <Check className={`mr-2 h-4 w-4 ${value === null ? "opacity-100" : "opacity-0"}`} />
                                    <span className="truncate">{clearLabel}</span>
                                </CommandItem>
                            ) : null}

                            {filteredCategories.map(({ category, breadcrumb }) => (
                                <CommandItem
                                    key={category.id}
                                    value={category.id}
                                    onSelect={() => handleSelect(category)}
                                    className="items-start"
                                >
                                    <Check className={`mr-2 mt-0.5 h-4 w-4 ${category.id === value ? "opacity-100" : "opacity-0"}`} />
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">{category.name}</div>
                                        {showBreadcrumbs && breadcrumb !== category.name ? (
                                            <div className="truncate text-xs text-muted-foreground">{breadcrumb}</div>
                                        ) : null}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
