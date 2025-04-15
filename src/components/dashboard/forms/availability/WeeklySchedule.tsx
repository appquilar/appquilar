
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DaySchedule from './DaySchedule';
import { TimeRange, WeekdayId, daysOfWeek, DaySchedules } from './types';

interface WeeklyScheduleProps {
  selectedDays: Record<WeekdayId, boolean>;
  timeRanges: DaySchedules;
  onToggleDaySelection: (day: WeekdayId, checked: boolean) => void;
  onAddTimeRange: (day: WeekdayId) => void;
  onRemoveTimeRange: (day: WeekdayId, rangeId: string) => void;
  onUpdateTimeRange: (day: WeekdayId, rangeId: string, field: 'startTime' | 'endTime', value: string) => void;
}

const WeeklySchedule = ({
  selectedDays,
  timeRanges,
  onToggleDaySelection,
  onAddTimeRange,
  onRemoveTimeRange,
  onUpdateTimeRange
}: WeeklyScheduleProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <FormLabel className="text-base">Días de la semana disponibles</FormLabel>
          <FormDescription>
            Selecciona los días de la semana en que este producto está disponible
          </FormDescription>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {daysOfWeek.map(day => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox 
                id={day.id} 
                checked={selectedDays[day.id]} 
                onCheckedChange={(checked) => onToggleDaySelection(day.id, !!checked)}
              />
              <Label htmlFor={day.id}>{day.label}</Label>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        {daysOfWeek.map(day => (
          <div 
            key={`timeranges-${day.id}`} 
            className={!selectedDays[day.id] ? 'hidden' : ''}
          >
            <DaySchedule
              dayId={day.id}
              dayLabel={day.label}
              timeRanges={timeRanges[day.id]}
              onAddTimeRange={onAddTimeRange}
              onRemoveTimeRange={onRemoveTimeRange}
              onUpdateTimeRange={onUpdateTimeRange}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklySchedule;
