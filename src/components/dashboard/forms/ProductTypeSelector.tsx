
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Control } from 'react-hook-form';
import { ProductFormValues } from './productFormSchema';

interface ProductTypeSelectorProps {
  control: Control<ProductFormValues>;
}

const ProductTypeSelector = ({ control }: ProductTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <FormLabel className="text-base">Tipo de Producto</FormLabel>
      <FormDescription>
        Selecciona si este producto está disponible para alquilar o para venta de segunda mano
      </FormDescription>
      
      <FormField
        control={control}
        name="productType"
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-2 gap-4"
          >
            <FormItem className="space-y-0">
              <FormLabel asChild>
                <div 
                  className={`flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent ${field.value === 'rental' ? 'border-primary bg-accent' : 'border-input'}`}
                  onClick={() => field.onChange('rental')}
                >
                  <RadioGroupItem value="rental" id="rental" className="sr-only" />
                  <Label htmlFor="rental" className="text-base font-semibold">Alquiler</Label>
                  <FormDescription>
                    Disponible para alquiler
                  </FormDescription>
                </div>
              </FormLabel>
            </FormItem>
            <FormItem className="space-y-0">
              <FormLabel asChild>
                <div 
                  className={`flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-accent ${field.value === 'sale' ? 'border-primary bg-accent' : 'border-input'}`}
                  onClick={() => field.onChange('sale')}
                >
                  <RadioGroupItem value="sale" id="sale" className="sr-only" />
                  <Label htmlFor="sale" className="text-base font-semibold">Venta</Label>
                  <FormDescription>
                    Venta de segunda mano
                  </FormDescription>
                </div>
              </FormLabel>
            </FormItem>
          </RadioGroup>
        )}
      />
    </div>
  );
};

export default ProductTypeSelector;
