
import React from 'react';
import { Button } from '@/components/ui/button';

interface DateRangeActionsProps {
  onClear: () => void;
  onApply: () => void;
}

const DateRangeActions = ({ onClear, onApply }: DateRangeActionsProps) => {
  return (
    <div className="flex justify-between pt-3 border-t mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClear}
        className="w-[120px]"
      >
        Limpiar
      </Button>
      
      <Button
        size="sm"
        onClick={onApply}
        className="w-[120px]"
      >
        Aplicar
      </Button>
    </div>
  );
};

export default DateRangeActions;
