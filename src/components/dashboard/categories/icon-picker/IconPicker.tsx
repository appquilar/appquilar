
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as Bi from 'react-icons/bi';
import * as Fa from 'react-icons/fa';
import * as Hi from 'react-icons/hi';
import * as Md from 'react-icons/md';
import * as Io from 'react-icons/io';
import * as Fi from 'react-icons/fi';

// Combine icons from different sets
const ICONS_MAP: Record<string, React.ComponentType<any>> = {
  // Tools and Equipment
  "tools": Fa.FaTools,
  "hammer": Fa.FaHammer,
  "wrench": Fa.FaWrench,
  "screwdriver": Md.MdBuildCircle,
  "drill": Md.MdHome,
  
  // Electronics
  "electronics": Md.MdDevices,
  "laptop": Md.MdLaptop,
  "smartphone": Md.MdSmartphone,
  "camera": Md.MdCameraAlt,
  "tv": Md.MdTv,
  "battery": Md.MdBattery90,
  
  // Garden and Outdoor
  "garden": Fa.FaSeedling,
  "tree": Fa.FaTree,
  "leaf": Fa.FaLeaf,
  "flower": Fa.FaSpa,
  "shovel": Fa.FaShoePrints,
  "watering": Md.MdWaterDrop,
  
  // Music and Audio
  "music": Fa.FaMusic,
  "guitar": Fa.FaGuitar,
  "headphones": Fa.FaHeadphones,
  "microphone": Fa.FaMicrophone,
  "piano": Fa.FaMusic,
  "drum": Fa.FaDrum,
  
  // Sports and Recreation
  "sports": Md.MdSportsBasketball,
  "basketball": Md.MdSportsBasketball,
  "football": Md.MdSportsSoccer,
  "baseball": Md.MdSportsBaseball,
  "tennis": Md.MdSportsTennis,
  "volleyball": Md.MdSportsVolleyball,
  
  // Furniture
  "furniture": Md.MdChair,
  "chair": Md.MdChair,
  "table": Fa.FaTable,
  "bed": Md.MdBed,
  "sofa": Md.MdWeekend,
  "lamp": Md.MdLightbulb,
  
  // Clothing and Accessories
  "clothing": Fa.FaTshirt,
  "shirt": Fa.FaTshirt,
  "pants": Fa.FaSocks,
  "dress": Fa.FaUserTie,
  "hat": Fa.FaHatCowboy,
  "shoes": Fa.FaShoePrints,
  
  // Kitchen and Appliances
  "kitchen": Fa.FaUtensils,
  "blender": Fa.FaBlender,
  "refrigerator": Fa.FaSnowflake,
  "oven": Md.MdMicrowave,
  "utensils": Fa.FaUtensils,
  "coffee": Fa.FaCoffee,
  
  // Misc
  "box": Fa.FaBox,
  "car": Fa.FaCar,
  "bike": Fa.FaBicycle,
  "book": Fa.FaBook,
  "paint": Fa.FaPaintBrush,
  "camera-movie": Md.MdMovieCreation
};

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string | null) => void;
}

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
