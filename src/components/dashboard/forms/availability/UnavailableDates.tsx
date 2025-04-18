import React, { useState } from 'react';
import { useFormContext, Control } from 'react-hook-form';
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

interface UnavailableDatesProps {
  control: Control<ProductFormValues>;
}

const UnavailableDates = ({ control }: UnavailableDatesProps) => {
  const { setValue, watch } = useFormContext<ProductFormValues>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const watchedUnavailableDates = watch('unavailableDates') || [];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Toggle date selection - if already selected, remove it
    const newDates = watchedUnavailableDates.includes(formattedDate)
      ? watchedUnavailableDates.filter(d => d !== formattedDate)
      : [...watchedUnavailableDates, formattedDate];
    
    setValue('unavailableDates', newDates, {
      shouldDirty: true,
      shouldValidate: true
    });
    
    // Keep the calendar open after selection
    setIsCalendarOpen(true);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleRemoveDate = (index: number) => {
    const updatedDates = [...watchedUnavailableDates];
    updatedDates.splice(index, 1);
    setValue('unavailableDates', updatedDates, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  const disabledDays = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const modifiers = {
    selected: (date: Date) => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      return watchedUnavailableDates.includes(formattedDate);
    }
  };

  const modifiersStyles = {
    selected: {
      backgroundColor: 'rgb(243 244 246)', // grey background for selected dates
      color: 'rgb(75 85 99)', // darker text for selected dates
    }
  };

  const renderSelectedDates = () => {
    if (!watchedUnavailableDates || watchedUnavailableDates.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay fechas seleccionadas</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {watchedUnavailableDates.map((dateString: string, index: number) => {
          let displayDate: string;
          
          try {
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const dateObj = new Date(dateString);
              displayDate = format(dateObj, 'dd/MM/yyyy', { locale: es });
            } else {
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
    <Card>
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
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
            >
              <Calendar
                mode="single"
                selected={undefined}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={es}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="p-3"
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
