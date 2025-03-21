
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onSearch: (e: React.FormEvent) => void;
}

const SearchToolbar = ({ 
  searchQuery, 
  onSearchChange, 
  onAddProduct, 
  onSearch 
}: SearchToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={onSearch} className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </form>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2 sm:w-auto w-full">
          <Filter size={16} />
          Filtros
        </Button>
        <Button onClick={onAddProduct} className="gap-2 sm:w-auto">
          <Plus size={16} />
          Añadir Nuevo
        </Button>
      </div>
    </div>
  );
};

export default SearchToolbar;
