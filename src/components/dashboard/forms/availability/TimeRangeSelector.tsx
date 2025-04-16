
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { TimeRange } from './types';

interface TimeRangeSelectorProps {
  range: TimeRange;
  showRemoveButton: boolean;
  onUpdate: (field: 'startTime' | 'endTime', value: string) => void;
  onRemove: () => void;
}

const TimeRangeSelector = ({ range, showRemoveButton, onUpdate, onRemove }: TimeRangeSelectorProps) => {
  // Ensure we always have valid values
  const startTime = range.startTime || '08:00';
  const endTime = range.endTime || '18:00';
  
  return (
    <div className="flex items-center space-x-2">
      <div className="grid grid-cols-2 gap-2 flex-grow">
        <div>
          <Label htmlFor={`${range.id}-start`}>Hora inicio</Label>
          <Input 
            type="time" 
            id={`${range.id}-start`}
            value={startTime}
            onChange={(e) => onUpdate('startTime', e.target.value || '08:00')}
          />
        </div>
        <div>
          <Label htmlFor={`${range.id}-end`}>Hora fin</Label>
          <Input 
            type="time" 
            id={`${range.id}-end`}
            value={endTime}
            onChange={(e) => onUpdate('endTime', e.target.value || '18:00')}
          />
        </div>
      </div>
      {showRemoveButton && (
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="mt-5"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
};

export default TimeRangeSelector;
