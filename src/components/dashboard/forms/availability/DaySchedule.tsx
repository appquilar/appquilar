
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import TimeRangeSelector from './TimeRangeSelector';
import { TimeRange, WeekdayId } from './types';

interface DayScheduleProps {
  dayId: WeekdayId;
  dayLabel: string;
  timeRanges: TimeRange[];
  onAddTimeRange: (day: WeekdayId) => void;
  onRemoveTimeRange: (day: WeekdayId, rangeId: string) => void;
  onUpdateTimeRange: (day: WeekdayId, rangeId: string, field: 'startTime' | 'endTime', value: string) => void;
}

const DaySchedule = ({ 
  dayId, 
  dayLabel, 
  timeRanges, 
  onAddTimeRange, 
  onRemoveTimeRange,
  onUpdateTimeRange 
}: DayScheduleProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base">{dayLabel}</FormLabel>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => onAddTimeRange(dayId)}
        >
          <Plus className="h-4 w-4 mr-1" /> Añadir horario
        </Button>
      </div>
      
      {timeRanges.map((range) => (
        <TimeRangeSelector
          key={range.id}
          range={range}
          showRemoveButton={timeRanges.length > 1}
          onUpdate={(field, value) => onUpdateTimeRange(dayId, range.id, field, value)}
          onRemove={() => onRemoveTimeRange(dayId, range.id)}
        />
      ))}
      
      <Separator className="my-2" />
    </div>
  );
};

export default DaySchedule;
