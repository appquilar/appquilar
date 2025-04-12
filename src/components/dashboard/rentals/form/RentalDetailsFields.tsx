
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface RentalDetailsFieldsProps {
  form: UseFormReturn<RentalFormValues>;
}

const RentalDetailsFields = ({ form }: RentalDetailsFieldsProps) => {
  const isMobile = useIsMobile();
  
  // Helper functions for formatting and handling date-time
  const formatDate = (date: Date): string => {
    return format(date, "PPP", { locale: es });
  };
  
  const formatTime = (date: Date): string => {
    return format(date, "HH:mm", { locale: es });
  };

  // Helper to handle hour selection
  const handleHourChange = (field: any, date: Date, hour: string) => {
    const [h, m] = hour.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(h, m);
    field.onChange(newDate);
  };

  // Create time options for select
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <>
      <h2 className="text-lg sm:text-xl font-medium">Detalles del Alquiler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Fecha de Inicio con hora */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Inicio</FormLabel>
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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

        {/* Fecha de Fin con hora */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Fin</FormLabel>
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
                      disabled={(date) => {
                        const startDate = form.getValues("startDate");
                        return date < startDate || date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
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

        {/* Total Amount */}
        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe Total</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    className="pl-7"
                  />
                  <span className="absolute left-3 top-2.5">€</span>
                </div>
              </FormControl>
              <FormDescription>
                Importe total del alquiler en euros
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deposit Amount */}
        <FormField
          control={form.control}
          name="depositAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe de la Fianza</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    className="pl-7"
                  />
                  <span className="absolute left-3 top-2.5">€</span>
                </div>
              </FormControl>
              <FormDescription>
                Importe de la fianza en euros
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default RentalDetailsFields;
