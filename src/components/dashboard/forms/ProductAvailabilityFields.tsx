
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductAvailabilityFieldsProps {
  control: Control<ProductFormValues>;
}

const statusColors = {
  available: 'bg-green-100 text-green-800 hover:bg-green-200',
  unavailable: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  rented: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
};

const ProductAvailabilityFields = ({ control }: ProductAvailabilityFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'availability',
  });

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
        status: 'available'
      });
      
      // Reset the selected dates
      setStartDate(undefined);
      setEndDate(undefined);
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
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FormField
                      control={control}
                      name={`availability.${index}.status`}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="unavailable">No Disponible</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="rented">Alquilado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Badge className={cn(
                      statusColors[fields[index].status as keyof typeof statusColors]
                    )}>
                      {fields[index].status === 'available' && 'Disponible'}
                      {fields[index].status === 'unavailable' && 'No Disponible'}
                      {fields[index].status === 'pending' && 'Pendiente'}
                      {fields[index].status === 'rented' && 'Alquilado'}
                    </Badge>
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

            <Button
              type="button"
              onClick={handleAddPeriod}
              disabled={!startDate || !endDate}
              className="ml-auto"
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
