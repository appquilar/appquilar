
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProductFormValues } from './productFormSchema';

interface ProductPriceFieldsProps {
  control: Control<ProductFormValues>;
}

const ProductPriceFields = ({ control }: ProductPriceFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Precios</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precio diario (obligatorio) */}
        <FormField
          control={control}
          name="price.daily"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio diario (€/día) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Depósito */}
        <FormField
          control={control}
          name="price.deposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fianza (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Precio por hora (opcional) */}
        <FormField
          control={control}
          name="price.hourly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio por hora (€/hora)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Precio semanal (opcional) */}
        <FormField
          control={control}
          name="price.weekly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio semanal (€/semana)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Precio mensual (opcional) */}
        <FormField
          control={control}
          name="price.monthly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio mensual (€/mes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProductPriceFields;
