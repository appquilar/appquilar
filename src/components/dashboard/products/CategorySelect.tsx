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

import { usePlatformCategories } from "@/application/hooks/usePlatformCategories";

type Props = {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    disabled?: boolean;
};

export default function CategorySelect({ value, onChange, disabled }: Props) {
    const [open, setOpen] = useState(false);

    const { categories, isLoading, applyFilters } = usePlatformCategories();

    const selected = useMemo(
        () => categories.find((c) => c.id === value) ?? null,
        [categories, value]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" disabled={disabled} className="w-full justify-between">
                    {selected ? selected.name : "Selecciona categoría…"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[360px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Buscar categoría…"
                        onValueChange={(q) => applyFilters({ name: q })}
                    />
                    <CommandList>
                        <CommandEmpty>{isLoading ? "Cargando…" : "No hay resultados"}</CommandEmpty>
                        <CommandGroup>
                            {(categories ?? []).map((c) => (
                                <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={() => {
                                        onChange(c.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={`mr-2 h-4 w-4 ${c.id === value ? "opacity-100" : "opacity-0"}`} />
                                    {c.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
