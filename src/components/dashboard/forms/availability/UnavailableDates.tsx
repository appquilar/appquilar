
import React from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormLabel, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductFormValues } from '../productFormSchema';

interface UnavailableDatesProps {
  control: Control<ProductFormValues>;
}

const UnavailableDates = ({ control }: UnavailableDatesProps) => {
  // Use useFieldArray from react-hook-form to handle the array of dates
  const { fields, append, remove } = useFieldArray({
    control,
    name: "unavailableDates" as "availability" // Type assertion to resolve TypeScript error
  });

  // Add a new unavailable date
  const handleAddDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    append(formattedDate);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4 space-y-4">
        <div>
          <FormLabel className="text-base">Fechas no disponibles</FormLabel>
          <FormDescription>
            Añade fechas específicas en las que este producto no estará disponible
          </FormDescription>
        </div>
        
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input 
                type="date" 
                {...control.register(`unavailableDates.${index}` as any)}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => remove(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddDate}
        >
          Añadir fecha no disponible
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnavailableDates;
