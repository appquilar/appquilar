
import React from 'react';
import { Control, UseFieldArrayRemove } from 'react-hook-form';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { ProductFormValues } from '../productFormSchema';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface AvailabilityPeriodItemProps {
  control: Control<ProductFormValues>;
  index: number;
  field: Record<string, any>;
  remove: UseFieldArrayRemove;
}

const AvailabilityPeriodItem = ({ 
  control, 
  index, 
  field, 
  remove 
}: AvailabilityPeriodItemProps) => {
  // Format date to ISO string (YYYY-MM-DD)
  const formatToISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
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
  );
};

export default AvailabilityPeriodItem;
