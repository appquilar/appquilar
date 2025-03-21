
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ProductFormValues } from "./productFormSchema";

interface ProductPriceFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductPriceFields = ({ control }: ProductPriceFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="price.daily"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio Diario (€)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="25" 
                {...field}
                onChange={e => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormDescription>Precio requerido por día</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="price.hourly"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio por Hora (€)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="8" 
                {...field}
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>Tarifa por hora (opcional)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="price.weekly"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio Semanal (€)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="120" 
                {...field}
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>Tarifa semanal (opcional)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="price.monthly"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio Mensual (€)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="350" 
                {...field}
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>Tarifa mensual (opcional)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductPriceFields;
