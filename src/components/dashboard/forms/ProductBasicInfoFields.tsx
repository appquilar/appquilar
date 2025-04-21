
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { ProductFormValues } from "./productFormSchema";
import { useEffect, useState } from "react";
import { Category } from "@/domain/models/Category";
import { CategoryService } from "@/application/services/CategoryService";

interface ProductBasicInfoFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductBasicInfoFields = ({ control }: ProductBasicInfoFieldsProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryService = CategoryService.getInstance();
        const allCategories = await categoryService.getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <>
      <FormField
        control={control}
        name="internalId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ID Interno</FormLabel>
            <FormControl>
              <Input placeholder="ID Interno (opcional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Producto</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de Herramienta Profesional" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="category.id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría del producto" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="slug-del-producto" {...field} />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-muted-foreground mt-1">Usado en URLs - debe ser único (ejemplo: taladro-profesional-20v)</p>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe tu producto en detalle" 
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ProductBasicInfoFields;
