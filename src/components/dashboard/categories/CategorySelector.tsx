
import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Category } from '@/domain/models/Category';
import { CategoryService } from '@/application/services/CategoryService';

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  placeholder?: string;
  excludeCategoryId?: string;
}

const CategorySelector = ({
  selectedCategoryId,
  onCategoryChange,
  placeholder = 'Seleccionar categoría',
  excludeCategoryId
}: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadCategories();
  }, [excludeCategoryId]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      // Filter out the category to exclude (to avoid circular references)
      const filteredCategories = excludeCategoryId 
        ? fetchedCategories.filter(cat => cat.id !== excludeCategoryId)
        : fetchedCategories;
      setCategories(Array.isArray(filteredCategories) ? filteredCategories : []);
    } catch (error) {
      console.error('Error loading categories', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(category => category.id === selectedCategoryId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandEmpty>No se encontraron categorías.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            <CommandItem
              key="none"
              value="none"
              onSelect={() => {
                onCategoryChange(null);
                setOpen(false);
              }}
              className="text-muted-foreground"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !selectedCategoryId ? "opacity-100" : "opacity-0"
                )}
              />
              Sin categoría padre
            </CommandItem>
            
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                value={category.name || ''}
                onSelect={() => {
                  onCategoryChange(category.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {category.name || ''}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
