
import React from 'react';
import { Input } from '@/components/ui/input';

interface RentalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RentalIdField = ({ value, onChange, className = '' }: RentalIdFieldProps) => {
  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder="ID de alquiler"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full"
      />
    </div>
  );
};

export default RentalIdField;
