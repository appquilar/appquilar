import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CategoryIcon from '@/components/categories/CategoryIcon';
import { CATEGORY_ICON_NAMES } from '@/components/categories/categoryIconNames';

type IconPickerProps = {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string | null) => void;
};

const IconPicker = ({ selectedIcon, onSelectIcon }: IconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = CATEGORY_ICON_NAMES.filter(iconName =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const prettifyIconName = (iconName: string) =>
    iconName.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

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

        {selectedIcon ? (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-3">
              <CategoryIcon
                iconName={selectedIcon}
                containerClassName="h-10 w-10 rounded-md bg-background text-foreground shadow-sm"
                iconClassName="h-5 w-5"
              />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Icono seleccionado
                </span>
                <span className="text-sm font-medium">{prettifyIconName(selectedIcon)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectIcon(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Quitar icono
            </button>
          </div>
        ) : null}
        
        <ScrollArea className="h-[200px] border rounded-md p-2">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => (
              <Tooltip key={iconName}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectIcon(iconName)}
                    className={cn(
                      "p-2 rounded border border-transparent hover:bg-accent flex items-center justify-center transition-colors",
                      selectedIcon === iconName && "border-primary bg-accent"
                    )}
                  >
                    <CategoryIcon
                      iconName={iconName}
                      containerClassName="h-10 w-10 rounded-md bg-transparent"
                      iconClassName="h-6 w-6"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{prettifyIconName(iconName)}</p>
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
