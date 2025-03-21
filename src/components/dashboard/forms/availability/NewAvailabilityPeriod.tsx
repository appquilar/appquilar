
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface NewAvailabilityPeriodProps {
  onAddPeriod: (startDate: Date, endDate: Date, includeWeekends: boolean, isAlwaysAvailable: boolean) => void;
}

const NewAvailabilityPeriod = ({ onAddPeriod }: NewAvailabilityPeriodProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [includeWeekends, setIncludeWeekends] = useState<boolean>(false);
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState<boolean>(false);

  const handleAddPeriodClick = () => {
    if (startDate && endDate) {
      onAddPeriod(startDate, endDate, includeWeekends, isAlwaysAvailable);
      
      // Reset the form
      setStartDate(undefined);
      setEndDate(undefined);
      setIncludeWeekends(false);
      setIsAlwaysAvailable(false);
    }
  };

  return (
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
            onClick={handleAddPeriodClick}
            disabled={!startDate || !endDate}
            className="ml-auto mt-4"
          >
            <Plus size={16} className="mr-2" />
            Añadir Periodo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewAvailabilityPeriod;
