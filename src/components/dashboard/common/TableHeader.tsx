
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface TableHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  addButtonText?: string;
  onSearch: (e: React.FormEvent) => void;
}

const TableHeader = ({
  title,
  searchQuery,
  onSearchChange,
  onAddNew,
  addButtonText = 'Añadir Nuevo',
  onSearch
}: TableHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={onAddNew} className="gap-2 w-full sm:w-auto">
          <Plus size={16} />
          {addButtonText}
        </Button>
      </div>
      
      <form onSubmit={onSearch} className="dashboard-filter-panel">
        <div className="relative w-full max-w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar por nombre...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>
    </div>
  );
};

export default TableHeader;
