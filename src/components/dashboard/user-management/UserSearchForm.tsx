
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserSearchFormProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserSearchForm = ({ searchQuery, onSearchChange, onSubmit }: UserSearchFormProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={onSubmit} className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-9"
        />
      </form>
    </div>
  );
};

export default UserSearchForm;
