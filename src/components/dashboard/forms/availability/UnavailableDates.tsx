import React, { useState } from 'react';
import { useFormContext, useFieldArray, Control } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { FormLabel, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ProductFormValues } from '../productFormSchema';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatToISODate } from './dateUtils';

interface UnavailableDatesProps {
  control: Control<ProductFormValues>;
}

const UnavailableDates = ({ control }: UnavailableDatesProps) => {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Watch the unavailable dates directly instead of using useFieldArray
  const watchedUnavailableDates = watch('unavailableDates') || [];
  
  // Handle date selection in the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    
    // Format the date as YYYY-MM-DD for internal storage
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if date already exists in the array
    if (!watchedUnavailableDates.includes(formattedDate)) {
      // Add the new date to the existing array
      setValue('unavailableDates', [...watchedUnavailableDates, formattedDate], {
        shouldDirty: true,
        shouldValidate: true
      });
    }
    
    // Keep the calendar open for multiple selections
    setIsCalendarOpen(true);
  };
  
  // Toggle the calendar
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  // Remove a date
  const handleRemoveDate = (index: number) => {
    const updatedDates = [...watchedUnavailableDates];
    updatedDates.splice(index, 1);
    setValue('unavailableDates', updatedDates, {
      shouldDirty: true,
      shouldValidate: true
    });
  };
  
  // Disable dates in the past
  const disabledDays = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  // Render the selected dates as badges
  const renderSelectedDates = () => {
    if (!watchedUnavailableDates || watchedUnavailableDates.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay fechas seleccionadas</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {watchedUnavailableDates.map((dateString: string, index: number) => {
          // Format the date for display
          let displayDate: string;
          
          try {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // It's a valid ISO date format (YYYY-MM-DD)
              const dateObj = new Date(dateString);
              displayDate = format(dateObj, 'dd/MM/yyyy', { locale: es });
            } else {
              // Not a valid date format
              displayDate = "Fecha inválida";
            }
          } catch (err) {
            console.error("Error formatting date:", err, dateString);
            displayDate = "Fecha inválida";
          }
          
          return (
            <Badge key={index} variant="secondary" className="px-2 py-1 gap-1">
              {displayDate}
              <button 
                type="button" 
                className="ml-1 rounded-full hover:bg-muted"
                onClick={() => handleRemoveDate(index)}
              >
                <X size={14} />
              </button>
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="mt-6 overflow-visible">
      <CardContent className="p-4 space-y-4">
        <div>
          <FormLabel className="text-base">Fechas no disponibles</FormLabel>
          <FormDescription>
            Selecciona las fechas específicas en las que este producto no estará disponible
          </FormDescription>
        </div>
        
        <div className="space-y-4">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={toggleCalendar}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Seleccionar fechas no disponibles</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={es}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {renderSelectedDates()}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnavailableDates;
