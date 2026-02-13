
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full max-w-2xl mx-auto relative bg-background rounded-full overflow-hidden shadow-sm border border-border transition-all duration-350 hover:shadow-md focus-within:shadow-md focus-within:border-primary/50"
    >
      <div className="flex items-center pl-4 sm:pl-5 pr-2 py-2.5 sm:py-3">
        <input
          type="text"
          placeholder="Buscar herramientas, equipos o categorías..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm sm:text-base focus:ring-0"
        />
        <button 
          type="submit" 
          className="p-2 bg-primary text-primary-foreground rounded-full transition-all duration-350 hover:bg-primary/90"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
