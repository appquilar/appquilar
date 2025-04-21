
import { useEffect, useState, useMemo } from 'react';
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
import { toast } from 'sonner';

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryService = useMemo(() => CategoryService.getInstance(), []);

  // Load categories on component mount or when excludeCategoryId changes
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedCategories = await categoryService.getAllCategories();
        
        // Ensure we have valid category data and filter out the excluded category
        const validCategories = fetchedCategories
          .filter(cat => cat && typeof cat === 'object' && cat.id)
          .filter(cat => cat.id !== excludeCategoryId);
          
        setCategories(validCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Error al cargar las categorías');
        toast.error('Error al cargar las categorías');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [excludeCategoryId, categoryService]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim() || !categories.length) return categories;
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Find the selected category
  const selectedCategory = useMemo(() => 
    categories.find(category => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  // Handle the case where the selected category is no longer available
  useEffect(() => {
    if (selectedCategoryId && !isLoading && categories.length > 0 &&
        !categories.some(c => c.id === selectedCategoryId)) {
      // Selected category not found in available categories
      onCategoryChange(null);
    }
  }, [categories, selectedCategoryId, isLoading, onCategoryChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar categoría padre"
          className="w-full justify-between"
          disabled={isLoading}
          onClick={() => setOpen(!open)}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {error ? (
          <div className="p-4 text-center text-sm text-destructive">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => {
                setError(null);
                setOpen(false);
              }}
            >
              Cerrar
            </Button>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Buscar categoría..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="none"
                    value="none"
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
                    <span>Sin categoría padre</span>
                  </CommandItem>
                  
                  {filteredCategories.length > 0 && filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
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
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelector;
