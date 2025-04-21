
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { CategoryFormData } from '@/domain/models/Category';
import { useEffect, useState } from 'react';
import IconPicker from '../icon-picker/IconPicker';
import { MockCategoryRepository } from '@/infrastructure/repositories/MockCategoryRepository';
import { cn } from '@/lib/utils';

interface CategoryBasicInfoFieldsProps {
  form: UseFormReturn<CategoryFormData>;
}

const CategoryBasicInfoFields = ({ form }: CategoryBasicInfoFieldsProps) => {
  const [open, setOpen] = useState(false);
  const [parentCategories, setParentCategories] = useState<{ id: string; name: string; }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRepository = new MockCategoryRepository();

  useEffect(() => {
    const loadParentCategories = async () => {
      const categories = await categoryRepository.getAllCategories();
      setParentCategories(categories);
    };
    loadParentCategories();
  }, []);

  const filteredCategories = parentCategories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la categoría" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="slug-de-categoria" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="parentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría Padre</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <div
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? parentCategories.find((category) => category.id === field.value)?.name
                      : "Seleccionar categoría padre (opcional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar categoría..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>No se encontraron categorías</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        field.onChange(null);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === null ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Sin categoría padre
                    </CommandItem>
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.id}
                        onSelect={() => {
                          field.onChange(category.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === category.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="iconUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icono</FormLabel>
            <FormControl>
              <IconPicker
                selectedIcon={field.value}
                onSelectIcon={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CategoryBasicInfoFields;
