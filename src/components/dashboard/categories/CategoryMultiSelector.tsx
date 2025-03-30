
import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Category } from '@/domain/models/Category';

interface CategoryMultiSelectorProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  placeholder?: string;
}

export function CategoryMultiSelector({
  categories,
  selectedCategoryIds,
  onCategoriesChange,
  placeholder = "Seleccionar categorías"
}: CategoryMultiSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Get selected categories data for display
  const selectedCategories = categories.filter(cat => 
    selectedCategoryIds.includes(cat.id)
  );

  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() !== ''
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  const handleSelect = (categoryId: string) => {
    const newSelectedIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    onCategoriesChange(newSelectedIds);
  };

  const removeCategory = (categoryId: string) => {
    onCategoriesChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const renderCategoryItems = (cats: Category[], level = 0) => {
    return cats.filter(cat => 
      filteredCategories.some(fc => fc.id === cat.id)
    ).map(category => (
      <React.Fragment key={category.id}>
        <CommandItem
          value={category.id}
          onSelect={() => handleSelect(category.id)}
          className={cn(
            "flex items-center justify-between",
            level > 0 && `pl-${level * 4 + 2}`
          )}
        >
          <div className="flex items-center">
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedCategoryIds.includes(category.id) ? "opacity-100" : "opacity-0"
              )}
            />
            {category.name}
          </div>
        </CommandItem>
        {categoriesByParent[category.id] && renderCategoryItems(categoriesByParent[category.id], level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategories.length > 0 
              ? `${selectedCategories.length} categorías seleccionadas` 
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar categoría..." 
              onValueChange={setSearchQuery}
              className="border-none"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No se encontraron categorías</CommandEmpty>
              <CommandGroup>
                {renderCategoryItems(rootCategories)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected categories badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCategories.map(category => (
            <Badge 
              key={category.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {category.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeCategory(category.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryMultiSelector;
