
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const AVAILABLE_ICONS = [
  { name: 'tools', path: '/icons/tools.svg' },
  { name: 'electronics', path: '/icons/electronics.svg' },
  { name: 'garden', path: '/icons/garden.svg' },
  { name: 'music', path: '/icons/music.svg' },
  { name: 'sports', path: '/icons/sports.svg' },
  // Add more icons as needed
];

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (iconPath: string | null) => void;
}

const IconPicker = ({ selectedIcon, onSelectIcon }: IconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center border rounded-md px-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar icono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>
      
      <ScrollArea className="h-[200px] border rounded-md p-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((icon) => (
            <button
              key={icon.path}
              onClick={() => onSelectIcon(icon.path)}
              className={cn(
                "p-2 rounded hover:bg-accent flex items-center justify-center",
                selectedIcon === icon.path && "bg-accent"
              )}
            >
              <img src={icon.path} alt={icon.name} className="w-6 h-6" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default IconPicker;
