import {NavItem as NavItemType} from '@/domain/services/navigation/types';
import NavItem from './NavItem';

interface NavSectionProps {
  title: string | null;
  items: NavItemType[];
  isActive: (href: string, exact?: boolean) => boolean;
  onTabChange: (href: string) => void;
}

/**
 * Componente para una sección de navegación con o sin título
 */
const NavSection = ({ title, items, isActive, onTabChange }: NavSectionProps) => {
  return (
    <>
      {/* Render section title if provided */}
      {title && (
        <li className="mt-6 mb-2 px-4">
          <p className="text-[0.68rem] font-semibold text-slate-500/80 uppercase tracking-[0.2em]">
            {title}
          </p>
        </li>
      )}
      
      {/* Render all items in this section */}
      {items.map((item) => (
        <NavItem
          key={item.href}
          link={item}
          isActive={isActive(item.href, item.exact)}
          onClick={onTabChange}
        />
      ))}
    </>
  );
};

export default NavSection;
