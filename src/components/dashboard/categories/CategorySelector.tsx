
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
  // Ensure this is initialized as an empty array
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
      
      // Ensure we have a valid array and filter by excludeCategoryId if needed
      let validCategories = Array.isArray(fetchedCategories) ? fetchedCategories : [];
      
      // Filter out any null/undefined or invalid category items
      validCategories = validCategories.filter(cat => cat && typeof cat === 'object' && 'id' in cat); 
      
      if (excludeCategoryId) {
        validCategories = validCategories.filter(cat => cat.id !== excludeCategoryId);
      }
      
      setCategories(validCategories);
    } catch (error) {
      console.error('Error loading categories', error);
      setHasError(true);
      setCategories([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Find selected category from the categories array
  const selectedCategory = categories.find(category => category && category.id === selectedCategoryId);

  // Safely check if we have categories to render
  const hasCategories = Array.isArray(categories) && categories.length > 0;

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
          <CommandGroup>
            {/* Add the "no category" option */}
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
            
            {/* Only render category items if we have valid categories */}
            {hasCategories && categories.map((category) => {
              // Skip rendering if category is invalid
              if (!category || !category.id || typeof category.name !== 'string') {
                return null;
              }
              
              return (
                <CommandItem
                  key={category.id}
                  value={category.name}
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
                  {category.name}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
