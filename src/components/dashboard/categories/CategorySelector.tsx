
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Category } from '@/domain/models/Category';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  placeholder?: string;
  includeNone?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder = "Seleccionar categoría",
  includeNone = true
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      setDisplayValue(category ? category.name : "");
    } else {
      setDisplayValue("");
    }
  }, [selectedCategoryId, categories]);

  // Group categories by parentId for hierarchical display
  const rootCategories = categories.filter(cat => cat.parentId === null);
  const categoriesByParent = categories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) {
        acc[cat.parentId] = [];
      }
      acc[cat.parentId].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() !== ''
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  const renderCategoryItems = (cats: Category[], level = 0) => {
    return cats.filter(cat => 
      filteredCategories.some(fc => fc.id === cat.id)
    ).map(category => (
      <React.Fragment key={category.id}>
        <CommandItem
          value={category.id}
          onSelect={() => {
            onCategoryChange(category.id);
            setOpen(false);
          }}
          className={cn(
            "flex items-center",
            level > 0 && `pl-${level * 4 + 2}`
          )}
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
            )}
          />
          {category.name}
        </CommandItem>
        {categoriesByParent[category.id] && renderCategoryItems(categoriesByParent[category.id], level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full min-w-[250px]" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar categoría..." 
            onValueChange={setSearchQuery}
            className="border-none"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No se encontraron categorías</CommandEmpty>
            <CommandGroup>
              {includeNone && (
                <CommandItem
                  onSelect={() => {
                    onCategoryChange(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedCategoryId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>Ninguna (categoría raíz)</span>
                </CommandItem>
              )}
              {renderCategoryItems(rootCategories)}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategorySelector;
