import React, { useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';

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

interface TimeRange {
  id: string;
  startTime: string;
  endTime: string;
}

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  // State to track time ranges for each day
  const [timeRanges, setTimeRanges] = useState<Record<string, TimeRange[]>>({
    monday: [{ id: 'monday-1', startTime: '08:00', endTime: '18:00' }],
    tuesday: [{ id: 'tuesday-1', startTime: '08:00', endTime: '18:00' }],
    wednesday: [{ id: 'wednesday-1', startTime: '08:00', endTime: '18:00' }],
    thursday: [{ id: 'thursday-1', startTime: '08:00', endTime: '18:00' }],
    friday: [{ id: 'friday-1', startTime: '08:00', endTime: '18:00' }],
    saturday: [{ id: 'saturday-1', startTime: '08:00', endTime: '18:00' }],
    sunday: [{ id: 'sunday-1', startTime: '08:00', endTime: '18:00' }],
  });

  // State to track which days are selected
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Handle unavailable dates
  const { fields, append, remove } = useFieldArray({
    control,
    name: "unavailableDates"
  });

  // Add a new unavailable date
  const handleAddDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    append(formattedDate);
  };

  // Add a new time range for a specific day
  const addTimeRange = (day: string) => {
    const newRanges = [...(timeRanges[day] || [])];
    const newId = `${day}-${newRanges.length + 1}`;
    newRanges.push({ id: newId, startTime: '08:00', endTime: '18:00' });
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Remove a time range for a specific day
  const removeTimeRange = (day: string, rangeId: string) => {
    const newRanges = timeRanges[day].filter(range => range.id !== rangeId);
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Update a time range value
  const updateTimeRange = (day: string, rangeId: string, field: 'startTime' | 'endTime', value: string) => {
    const newRanges = timeRanges[day].map(range => 
      range.id === rangeId 
        ? { ...range, [field]: value } 
        : range
    );
    setTimeRanges({
      ...timeRanges,
      [day]: newRanges
    });
  };

  // Toggle day selection
  const toggleDaySelection = (day: string, checked: boolean) => {
    setSelectedDays({
      ...selectedDays,
      [day]: checked
    });
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
                      <Checkbox 
                        id={day.id} 
                        checked={selectedDays[day.id]} 
                        onCheckedChange={(checked) => toggleDaySelection(day.id, !!checked)}
                      />
                      <Label htmlFor={day.id}>{day.label}</Label>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {daysOfWeek.map(day => (
                  <div 
                    key={`timeranges-${day.id}`} 
                    className={!selectedDays[day.id] ? 'hidden' : 'space-y-3'}
                  >
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">{day.label}</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addTimeRange(day.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Añadir horario
                      </Button>
                    </div>
                    
                    {timeRanges[day.id]?.map((range, index) => (
                      <div key={range.id} className="flex items-center space-x-2">
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                          <div>
                            <Label htmlFor={`${range.id}-start`}>Hora inicio</Label>
                            <Input 
                              type="time" 
                              id={`${range.id}-start`}
                              value={range.startTime}
                              onChange={(e) => updateTimeRange(day.id, range.id, 'startTime', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${range.id}-end`}>Hora fin</Label>
                            <Input 
                              type="time" 
                              id={`${range.id}-end`}
                              value={range.endTime}
                              onChange={(e) => updateTimeRange(day.id, range.id, 'endTime', e.target.value)}
                            />
                          </div>
                        </div>
                        {timeRanges[day.id].length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="mt-5"
                            onClick={() => removeTimeRange(day.id, range.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Separator className="my-2" />
                  </div>
                ))}
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
