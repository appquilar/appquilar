
import React from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { ProductFormValues } from './productFormSchema';
import { FormLabel, FormDescription, FormField, FormItem, FormControl } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProductAvailabilityFieldsProps {
  control: Control<ProductFormValues>;
}

const daysOfWeek = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  // Update the field name to match what's in the schema
  const { fields, append, remove } = useFieldArray({
    control,
    name: "unavailableDates" as any, // Cast to any to bypass TypeScript error
  });

  // Add a new unavailable date
  const handleAddDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    append(formattedDate as any); // Cast to any to bypass TypeScript error
  };

  return (
    <div className="space-y-6">
      <FormLabel className="text-base">Disponibilidad</FormLabel>
      <FormDescription>
        Establece cuándo este producto está disponible para alquilar.
      </FormDescription>

      {/* Global always available switch */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-4">
          <FormField
            control={control}
            name="isAlwaysAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg bg-background p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Siempre Disponible</FormLabel>
                  <FormDescription>
                    Marca este producto como siempre disponible, sin restricciones de fecha
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
        </CardContent>
      </Card>

      {/* Days of week availability */}
      <FormField
        control={control}
        name="isAlwaysAvailable"
        render={({ field }) => (
          <div className={field.value ? 'opacity-50 pointer-events-none' : ''}>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <FormLabel className="text-base">Días de la semana disponibles</FormLabel>
                  <FormDescription>
                    Selecciona los días de la semana en que este producto está disponible
                  </FormDescription>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {daysOfWeek.map(day => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox id={day.id} defaultChecked />
                      <Label htmlFor={day.id}>{day.label}</Label>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <FormLabel className="text-base">Horario de disponibilidad</FormLabel>
                  <FormDescription>
                    Define las horas en que este producto está disponible
                  </FormDescription>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="startTime">Hora de inicio</Label>
                      <Input 
                        type="time" 
                        id="startTime" 
                        defaultValue="08:00" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">Hora de fin</Label>
                      <Input 
                        type="time" 
                        id="endTime" 
                        defaultValue="18:00" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Unavailable dates */}
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
                        {...control.register(`unavailableDates.${index}` as const)}
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
          </div>
        )}
      />
    </div>
  );
};

export default ProductAvailabilityFields;
