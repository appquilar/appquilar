
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchField = ({ value, onChange, className = '' }: SearchFieldProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Buscar por cliente, producto..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-10"
      />
    </div>
  );
};

export default SearchField;
