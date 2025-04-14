
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ProductFormValues } from './productFormSchema';

interface ProductSecondHandFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductSecondHandFields = ({ control }: ProductSecondHandFieldsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-2">Información de Venta (Segunda Mano)</h3>
      
      <FormField
        control={control}
        name="secondHand.price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Precio de venta (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="secondHand.negotiable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Precio negociable</FormLabel>
              <FormDescription>
                Permitir que los usuarios puedan negociar el precio
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="secondHand.additionalInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Información adicional</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Estado del producto, tiempo de uso, etc."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
            <FormDescription>
              Proporciona detalles adicionales sobre el estado del producto, tiempo de uso, etc.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductSecondHandFields;
