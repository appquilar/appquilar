import {
  Accessibility,
  Anchor,
  Aperture,
  Armchair,
  Baby,
  Backpack,
  Bike,
  Briefcase,
  Building2,
  Camera,
  Car,
  Cat,
  Dog,
  Drill,
  Droplets,
  Dumbbell,
  Fan,
  Fish,
  Footprints,
  Gamepad2,
  Gem,
  GlassWater,
  Hammer,
  HeartPulse,
  Home,
  Image,
  Laptop,
  Leaf,
  Lightbulb,
  Mic,
  Monitor,
  Music,
  Package,
  PartyPopper,
  PawPrint,
  Printer,
  Ruler,
  Shield,
  Shirt,
  Smartphone,
  Snowflake,
  Sparkles,
  Speaker,
  Tablet,
  Tent,
  Trees,
  Truck,
  Umbrella,
  UtensilsCrossed,
  Video,
  Volleyball,
  Volume2,
  WandSparkles,
  Warehouse,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CATEGORY_ICON_NAMES } from "@/components/categories/categoryIconNames";

const CATEGORY_ICON_NAME_SET = new Set<string>(CATEGORY_ICON_NAMES);
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Accessibility,
  Anchor,
  Aperture,
  Armchair,
  Baby,
  Backpack,
  Bike,
  Briefcase,
  Building2,
  Camera,
  Car,
  Cat,
  Dog,
  Drill,
  Droplets,
  Dumbbell,
  Fan,
  Fish,
  Footprints,
  Gamepad2,
  Gem,
  GlassWater,
  Hammer,
  HeartPulse,
  Home,
  Image,
  Laptop,
  Leaf,
  Lightbulb,
  Mic,
  Monitor,
  Music,
  Package,
  PartyPopper,
  PawPrint,
  Printer,
  Ruler,
  Shield,
  Shirt,
  Smartphone,
  Snowflake,
  Sparkles,
  Speaker,
  Tablet,
  Tent,
  Trees,
  Truck,
  Umbrella,
  UtensilsCrossed,
  Video,
  Volleyball,
  Volume2,
  WandSparkles,
  Warehouse,
  Waves,
  Wrench,
};

const getCategoryLucideIcon = (iconName?: string | null): LucideIcon | null => {
  if (!iconName || !CATEGORY_ICON_NAME_SET.has(iconName)) {
    return null;
  }

  return CATEGORY_ICON_MAP[iconName] ?? null;
};

type CategoryIconProps = {
  iconName?: string | null;
  containerClassName?: string;
  iconClassName?: string;
};

const CategoryIcon = ({
  iconName,
  containerClassName,
  iconClassName,
}: CategoryIconProps) => {
  const IconComponent = getCategoryLucideIcon(iconName);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground",
        containerClassName
      )}
    >
      {IconComponent ? <IconComponent className={cn("h-5 w-5", iconClassName)} /> : null}
    </span>
  );
};

export default CategoryIcon;
