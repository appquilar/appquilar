import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { formatDate } from '../utils/dateTimeUtils';
import { RentalFormValues } from '@/domain/models/RentalForm';
import { es } from 'date-fns/locale';

interface DateTimeFieldProps {
  form: UseFormReturn<RentalFormValues>;
  name: "startDate" | "endDate";
  label: string;
  disabledDateFn?: (date: Date) => boolean;
  disabled?: boolean;
}

const DateTimeField = ({ form, name, label, disabledDateFn, disabled = false }: DateTimeFieldProps) => {
  const isMobile = useIsMobile();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className="w-full pl-3 text-left font-normal"
                  disabled={disabled}
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
                onSelect={disabled ? undefined : field.onChange}
                disabled={disabled ? true : disabledDateFn}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateTimeField;
