
import React, { useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { ProductFormValues } from './productFormSchema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Toggle, ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ProductAvailabilityFieldsProps {
  control: Control<ProductFormValues>;
}

const statusColors = {
  available: 'bg-green-100 text-green-800 hover:bg-green-200',
  unavailable: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availability',
  });

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [includeWeekends, setIncludeWeekends] = useState<boolean>(false);
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState<boolean>(false);

  // Format date to ISO string (YYYY-MM-DD)
  const formatToISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Add a new availability period
  const handleAddPeriod = () => {
    if (startDate && endDate) {
      append({
        id: `period-${Date.now()}`,
        startDate: formatToISODate(startDate),
        endDate: formatToISODate(endDate),
        status: 'available',
        includeWeekends,
        isAlwaysAvailable
      });
      
      // Reset the selected dates and options
      setStartDate(undefined);
      setEndDate(undefined);
      setIncludeWeekends(false);
      setIsAlwaysAvailable(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormLabel className="text-base">Periodos de Disponibilidad</FormLabel>
      <CardDescription>
        Establece cuándo este producto está disponible para alquilar.
      </CardDescription>

      {/* Current availability periods */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FormField
                      control={control}
                      name={`availability.${index}.status`}
                      render={({ field }) => (
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          className="flex gap-1"
                        >
                          <ToggleGroupItem 
                            value="available"
                            className={cn(
                              field.value === 'available' ? 'bg-green-100 text-green-800' : ''
                            )}
                          >
                            Disponible
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="unavailable"
                            className={cn(
                              field.value === 'unavailable' ? 'bg-red-100 text-red-800' : ''
                            )}
                          >
                            No Disponible
                          </ToggleGroupItem>
                        </ToggleGroup>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`availability.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Fecha inicio</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(formatToISODate(date));
                                  }
                                }}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    <span>hasta</span>
                    <FormField
                      control={control}
                      name={`availability.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Fecha fin</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(formatToISODate(date));
                                  }
                                }}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-3 flex items-center gap-6">
                    <FormField
                      control={control}
                      name={`availability.${index}.includeWeekends`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">También fines de semana</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={control}
                      name={`availability.${index}.isAlwaysAvailable`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">Siempre disponible</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new availability period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Añadir nuevo periodo</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <FormLabel className="text-xs mb-1 block">Desde</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[170px] pl-3 text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <FormLabel className="text-xs mb-1 block">Hasta</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[170px] pl-3 text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => {
                      if (!startDate) return true;
                      return date < startDate;
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2 pl-1">
              <div className="flex items-center gap-2">
                <Switch 
                  id="include-weekends" 
                  checked={includeWeekends}
                  onCheckedChange={setIncludeWeekends}
                />
                <FormLabel htmlFor="include-weekends" className="text-sm">
                  También fines de semana
                </FormLabel>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="always-available" 
                  checked={isAlwaysAvailable}
                  onCheckedChange={setIsAlwaysAvailable}
                />
                <FormLabel htmlFor="always-available" className="text-sm">
                  Siempre disponible
                </FormLabel>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddPeriod}
              disabled={!startDate || !endDate}
              className="ml-auto mt-4"
            >
              <Plus size={16} className="mr-2" />
              Añadir Periodo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAvailabilityFields;
