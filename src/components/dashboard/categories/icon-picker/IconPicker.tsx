
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ICONS_MAP } from '@/domain/constants/iconMapping';
import { IconPickerProps } from '@/domain/types/icon';

const IconPicker = ({ selectedIcon, onSelectIcon }: IconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = Object.keys(ICONS_MAP).filter(iconName =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = ICONS_MAP[iconName];
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Buscar icono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        
        <ScrollArea className="h-[200px] border rounded-md p-2">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => (
              <Tooltip key={iconName}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectIcon(iconName)}
                    className={cn(
                      "p-2 rounded hover:bg-accent flex items-center justify-center",
                      selectedIcon === iconName && "bg-accent"
                    )}
                  >
                    {renderIcon(iconName)}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{iconName.replace('-', ' ')}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default IconPicker;
