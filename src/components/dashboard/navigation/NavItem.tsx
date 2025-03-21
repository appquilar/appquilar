
import { Link } from 'react-router-dom';
import { NavLink } from './types';

interface NavItemProps {
  link: NavLink;
  isActive: boolean;
  onClick: (href: string) => void;
}

/**
 * Componente para cada elemento de navegación
 */
const NavItem = ({ link, isActive, onClick }: NavItemProps) => {
  return (
    <li key={link.href}>
      <Link
        to={link.href}
        className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-secondary text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        onClick={() => onClick(link.href)}
      >
        <div className="flex items-center">
          <span className="mr-3">{link.icon}</span>
          <span>{link.title}</span>
        </div>
        {link.badge && (
          <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
            {link.badge}
          </span>
        )}
      </Link>
    </li>
  );
};

export default NavItem;
