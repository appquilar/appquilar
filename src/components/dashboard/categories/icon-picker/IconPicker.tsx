
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as Bi from 'react-icons/bi';
import * as Fa from 'react-icons/fa';
import * as Hi from 'react-icons/hi';
import * as Md from 'react-icons/md';
import * as Io from 'react-icons/io';
import * as Fi from 'react-icons/fi';

const ICONS_MAP: Record<string, React.ComponentType<any>> = {
  // Tools and Equipment
  "tools": Fa.FaTools,
  "hammer": Fa.FaHammer,
  "wrench": Fa.FaWrench,
  "screwdriver": Fa.FaScrewdriver,
  "drill": Fa.FaDrumSteelpan,
  "toolbox": Fa.FaToolbox,
  "repair": Fa.FaWrench,
  "equipment": Fa.FaTools,

  // Electronics
  "electronics": Md.MdDevices,
  "laptop": Md.MdLaptopMac,
  "smartphone": Md.MdSmartphone,
  "camera": Md.MdCameraAlt,
  "tv": Md.MdTv,
  "computer": Md.MdComputer,
  "tablet": Md.MdTablet,
  "printer": Md.MdPrint,
  "phone": Md.MdPhone,
  "battery": Md.MdBattery90,
  "bluetooth": Md.MdBluetooth,
  "wifi": Md.MdWifi,

  // Garden and Outdoor
  "garden": Fa.FaSeedling,
  "tree": Fa.FaTree,
  "leaf": Fa.FaLeaf,
  "flower": Fa.FaSpa,
  "shovel": Fa.FaSpa,
  "rake": Fa.FaCanadianMapleLeaf,
  "lawnmower": Fa.FaLeaf,
  "watering": Fi.FiCloudRain,
  "plant": Fa.FaSeedling,
  "sun": Fa.FaSun,

  // Music and Audio
  "music": Fa.FaMusic,
  "guitar": Fa.FaGuitar,
  "headphones": Fa.FaHeadphones,
  "microphone": Fa.FaMicrophone,
  "piano": Fa.FaMusic,
  "drum": Fa.FaDrum,
  "speaker": Md.MdSpeaker,
  "volume": Fa.FaVolumeUp,
  "playlist": Fa.FaPlayCircle,
  "record": Fa.FaRecordVinyl,

  // Sports and Recreation
  "sports": Md.MdSportsBasketball,
  "basketball": Md.MdSportsBasketball,
  "football": Md.MdSportsSoccer,
  "baseball": Md.MdSportsBaseball,
  "tennis": Md.MdSportsTennis,
  "volleyball": Md.MdSportsVolleyball,
  "fitness": Md.MdFitnessCenter,
  "running": Fa.FaRunning,
  "swimming": Fa.FaSwimmer,
  "cycling": Fa.FaBiking,

  // Furniture
  "furniture": Md.MdChair,
  "chair": Md.MdChair,
  "table": Fa.FaTable,
  "bed": Md.MdBed,
  "sofa": Md.MdWeekend,
  "desk": Md.MdDesk,
  "cabinet": Md.MdStorage,
  "drawer": Md.MdStorage,
  "floor-lamp": Fa.FaLightbulb, // Changed from "lamp" to "floor-lamp"
  "mirror": Md.MdOutlineMonitor,

  // Clothing and Accessories
  "clothing": Fa.FaTshirt,
  "shirt": Fa.FaTshirt,
  "pants": Fa.FaSocks,
  "dress": Fa.FaUserTie,
  "hat": Fa.FaHatCowboy,
  "shoes": Fa.FaShoePrints,
  "glasses": Fa.FaGlasses,
  "watch": Fa.FaClock,
  "ring": Fa.FaRing,
  "bag": Fa.FaShoppingBag,

  // Kitchen and Appliances
  "kitchen": Fa.FaUtensils,
  "blender": Fa.FaBlender,
  "refrigerator": Fa.FaSnowflake,
  "oven": Md.MdMicrowave,
  "utensils": Fa.FaUtensils,
  "coffee": Fa.FaCoffee,
  "mixer": Fa.FaBlender,
  "dish": Fa.FaUtensils,
  "glass": Fa.FaWineGlass,
  "bottle": Fa.FaWineBottle,

  // Home and Living
  "home": Fa.FaHome,
  "lamp": Fa.FaLightbulb,
  "clock": Fa.FaClock,
  "carpet": Md.MdCarpenter,
  "curtains": Md.MdCurtains,
  "door": Fa.FaDoorOpen,
  "window": Fa.FaWindowMaximize,
  "paint": Fa.FaPaintBrush,
  "book": Fa.FaBook,
  "picture": Fa.FaImage,

  // Party and Events
  "party": Fa.FaGlassCheers,
  "balloons": Fa.FaBirthdayCake,
  "karaoke": Fa.FaMicrophone,
  "lights": Fa.FaLightbulb,
  "speaker-system": Md.MdSpeaker,
  "cake": Fa.FaBirthdayCake,
  "gift": Fa.FaGift,
  "celebration": Fa.FaGlassCheers,
  "confetti": Fa.FaStarAndCrescent,
  "dance": Fa.FaMusic,

  // Technology
  "robot": Fa.FaRobot,
  "code": Fa.FaCode,
  "database": Fa.FaDatabase,
  "server": Fa.FaServer,
  "cloud": Fa.FaCloud,
  "keyboard": Fa.FaKeyboard,
  "mouse": Fa.FaMouse,
  "network": Fa.FaNetworkWired,
  "security": Fa.FaShieldAlt,
  "settings": Fa.FaCog,

  // Transportation
  "car": Fa.FaCar,
  "bicycle": Fa.FaBicycle,
  "bus": Fa.FaBus,
  "train": Fa.FaTrain,
  "plane": Fa.FaPlane,
  "ship": Fa.FaShip,
  "motorcycle": Fa.FaMotorcycle,
  "truck": Fa.FaTruck,
  "helicopter": Fa.FaHelicopter,
  "rocket": Fa.FaRocket,
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
