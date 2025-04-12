
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon, Clock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { formatDate, formatTime, generateTimeOptions, handleHourChange } from '../utils/dateTimeUtils';
import { RentalFormValues } from '@/domain/models/RentalForm';
import { es } from 'date-fns/locale';

interface DateTimeFieldProps {
  form: UseFormReturn<RentalFormValues>;
  name: "startDate" | "endDate";
  label: string;
  disabledDateFn?: (date: Date) => boolean;
}

const DateTimeField = ({ form, name, label, disabledDateFn }: DateTimeFieldProps) => {
  const isMobile = useIsMobile();
  const timeOptions = generateTimeOptions();
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="w-full pl-3 text-left font-normal"
                  >
                    {field.value ? (
                      formatDate(field.value)
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className={isMobile ? "w-[calc(100vw-32px)] left-0 right-0 p-0" : "w-auto p-0"} 
                align="start"
              >
                <Calendar
                  locale={es}
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={disabledDateFn}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="w-[120px] pl-3 text-left font-normal"
                  >
                    {field.value ? (
                      formatTime(field.value)
                    ) : (
                      <span>Hora</span>
                    )}
                    <Clock className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent 
                className={isMobile ? "w-[calc(100vw-32px)] left-0 right-0 p-0" : "w-[220px] p-0"} 
                align="start"
              >
                <div className="h-[300px] overflow-y-auto">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => handleHourChange(field, field.value || new Date(), time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateTimeField;
