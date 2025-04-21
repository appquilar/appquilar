
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
  // Initialize with empty array to avoid undefined issues
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const categoryService = CategoryService.getInstance();

  useEffect(() => {
    loadCategories();
  }, [excludeCategoryId]);

  const loadCategories = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      // Filter out the category to exclude (to avoid circular references)
      const filteredCategories = excludeCategoryId && Array.isArray(fetchedCategories)
        ? fetchedCategories.filter(cat => cat && cat.id !== excludeCategoryId)
        : fetchedCategories;
      
      // Triple-check to ensure we always have a valid array
      setCategories(Array.isArray(filteredCategories) ? filteredCategories.filter(Boolean) : []);
    } catch (error) {
      console.error('Error loading categories', error);
      setHasError(true);
      // Always initialize with an empty array on error
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Find selected category from the categories array
  const selectedCategory = categories.find(category => category && category.id === selectedCategoryId);

  // Safe rendering to avoid issues with undefined values
  const renderCategories = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }
    
    return categories.map((category) => {
      // Skip any potentially undefined or invalid categories
      if (!category || !category.id) return null;
      
      return (
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
      );
    }).filter(Boolean); // Filter out any null items
  };

  // Render a message when an error occurs
  const renderError = () => {
    if (!hasError) return null;
    
    return (
      <div className="p-2 text-sm text-destructive">
        Error al cargar categorías. Intente nuevamente.
      </div>
    );
  };

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
        {/* Safe rendering of the Command component with guaranteed valid data */}
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandEmpty>No se encontraron categorías.</CommandEmpty>
          {!hasError ? (
            <CommandGroup>
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
              
              {/* Render categories with a safe method to ensure we never pass undefined */}
              {renderCategories()}
            </CommandGroup>
          ) : renderError()}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
