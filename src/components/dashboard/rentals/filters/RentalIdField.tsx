
import React from 'react';
import { Input } from '@/components/ui/input';

interface RentalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const RentalIdField = ({ value, onChange }: RentalIdFieldProps) => {
  return (
    <div className="relative">
      <Input
        placeholder="ID de alquiler"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32 h-10"
      />
    </div>
  );
};

export default RentalIdField;
