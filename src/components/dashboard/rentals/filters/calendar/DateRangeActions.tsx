
import React from 'react';
import { Button } from '@/components/ui/button';

interface DateRangeActionsProps {
  onClear: () => void;
  onApply: () => void;
}

const DateRangeActions = ({ onClear, onApply }: DateRangeActionsProps) => {
  return (
    <div className="flex justify-between pt-2 border-t">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClear}
      >
        Limpiar
      </Button>
      
      <Button
        size="sm"
        onClick={onApply}
      >
        Aplicar
      </Button>
    </div>
  );
};

export default DateRangeActions;
