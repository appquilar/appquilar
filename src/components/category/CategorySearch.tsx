
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CategorySearchProps {
  searchQuery: string;
  categoryName: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const CategorySearch = ({ 
  searchQuery, 
  categoryName, 
  onSearchChange, 
  onSearch 
}: CategorySearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <form onSubmit={onSearch} className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Search ${categoryName.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </form>
      <Button variant="outline" className="gap-2 sm:w-auto w-full">
        <Filter size={16} />
        Filters
      </Button>
    </div>
  );
};

export default CategorySearch;
