
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarNavigation from './calendar/CalendarNavigation';
import CalendarDisplay from './calendar/CalendarDisplay';
import DateRangeInputs from './calendar/DateRangeInputs';
import DateRangeActions from './calendar/DateRangeActions';

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Navigation for months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(current => addMonths(current, direction === 'prev' ? -1 : 1));
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
  };

  // Handle month change
  const handleMonthChange = (month: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(month);
    setViewDate(newDate);
  };
  
  // Handle date range selection
  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    if (range?.from) {
      onStartDateChange(range.from);
    } else {
      onStartDateChange(undefined);
    }
    if (range?.to) {
      onEndDateChange(range.to);
    } else {
      onEndDateChange(undefined);
    }
    if (range?.from && !range?.to) {
      setSelectingDate('end');
    } else {
      setSelectingDate('start');
    }
  };

  // Handle clear
  const handleClear = () => {
    onStartDateChange(undefined);
    onEndDateChange(undefined);
    setSelectingDate('start');
  };

  // Handle apply (close popover)
  const handleApply = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Rango de fechas</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`${isMobile ? 'w-[calc(100vw-16px)] max-h-[80vh] overflow-y-auto max-w-none left-0 right-0 mx-auto' : 'min-w-[320px] w-auto'} p-0`} 
        align={isMobile ? "center" : "start"}
        side={isMobile ? "bottom" : undefined}
        sideOffset={isMobile ? 5 : 10}
      >
        <div className="p-3 space-y-3">
          {/* Date inputs for start and end date */}
          <DateRangeInputs 
            startDate={startDate}
            endDate={endDate}
            selectingDate={selectingDate}
            onSelectDate={setSelectingDate}
          />
          
          {/* Calendar navigation with month/year selector */}
          <CalendarNavigation 
            viewDate={viewDate}
            onNavigateMonth={navigateMonth}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
          
          {/* Calendar display */}
          <CalendarDisplay 
            startDate={startDate}
            endDate={endDate}
            viewDate={viewDate}
            onDateSelect={handleDateSelect}
            onMonthChange={setViewDate}
          />
          
          {/* Action buttons */}
          <DateRangeActions 
            onClear={handleClear}
            onApply={handleApply}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
