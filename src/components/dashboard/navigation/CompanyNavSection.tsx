
import { NavLink } from './types';
import NavItem from './NavItem';

interface CompanyNavSectionProps {
  links: NavLink[];
  title: string;
  isActive: (href: string, exact?: boolean) => boolean;
  onTabChange: (href: string) => void;
}

/**
 * Componente para una sección de navegación con título
 */
const CompanyNavSection = ({ links, title, isActive, onTabChange }: CompanyNavSectionProps) => {
  return (
    <>
      <li className="mt-8 mb-3 px-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      </li>
      {links.map((link) => (
        <NavItem
          key={link.href}
          link={link}
          isActive={isActive(link.href, link.exact)}
          onClick={onTabChange}
        />
      ))}
    </>
  );
};

export default CompanyNavSection;
