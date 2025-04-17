
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

interface UnavailableDatesProps {
  control: Control<ProductFormValues>;
}

const UnavailableDates = ({ control }: UnavailableDatesProps) => {
  const { setValue, watch } = useFormContext();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Use useFieldArray from react-hook-form to handle the array of dates
  const { fields, append, remove } = useFieldArray({
    control,
    name: "unavailableDates" as any // Type assertion to allow this field name
  });
  
  const currentUnavailableDates = watch('unavailableDates') || [];
  
  // Handle date selection in the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if date already exists in the array
    if (!currentUnavailableDates.includes(formattedDate)) {
      append(formattedDate);
    }
  };
  
  // Remove a date
  const handleRemoveDate = (index: number) => {
    remove(index);
  };
  
  // Disable dates that are already in the unavailable dates array
  const disabledDays = (date: Date) => {
    // Don't allow dates in the past
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    return false;
  };
  
  // Render the selected dates as badges
  const renderSelectedDates = () => {
    if (fields.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay fechas seleccionadas</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {fields.map((field, index) => {
          // Check if the field value is a valid date string
          let displayDate = '';
          try {
            // The field value is stored in field.value since we're using useFieldArray
            const dateValue = field.value || field.id;
            if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // It's already a formatted date string like "2023-04-17"
              displayDate = format(new Date(dateValue), 'dd/MM/yyyy');
            } else {
              // Try to display whatever we have
              displayDate = String(dateValue);
            }
          } catch (err) {
            console.error("Error formatting date:", err);
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
    <Card className="mt-6">
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Seleccionar fechas no disponibles</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={es}
                className={cn("p-3 pointer-events-auto")}
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
