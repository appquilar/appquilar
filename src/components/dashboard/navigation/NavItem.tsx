import {Link} from 'react-router-dom';
import {NavItem as NavItemType} from '@/domain/services/navigation/types';
import UnreadMessagesBadge from "./UnreadMessagesBadge";

interface NavItemProps {
  link: NavItemType;
  isActive: boolean;
  onClick: (href: string) => void;
}

/**
 * Componente para cada elemento de navegación
 */
const NavItem = ({ link, isActive, onClick }: NavItemProps) => {
  const Icon = link.icon;
  
  return (
    <li key={link.href}>
      <Link
        to={link.href}
        className={`group/nav-item flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
          isActive
            ? 'border-[#F19D70]/40 bg-[#F19D70]/12 text-[#0F172A] shadow-sm'
            : 'border-transparent text-muted-foreground hover:border-slate-200/80 hover:bg-white/70 hover:text-[#0F172A]'
        }`}
        onClick={() => onClick(link.href)}
      >
        <div className="flex items-center min-w-0">
          <span className={`mr-3 transition-colors ${isActive ? 'text-[#F19D70]' : 'text-slate-400 group-hover/nav-item:text-[#F19D70]'}`}>
            <Icon size={18} />
          </span>
          <span className="truncate">{link.title}</span>
        </div>
        {link.id === "messages" && <UnreadMessagesBadge />}
        {link.id !== "messages" && link.badge && (
          <span className="bg-[#F19D70]/20 text-[#C86A35] text-xs font-medium px-2 py-0.5 rounded-md">
            {link.badge}
          </span>
        )}
      </Link>
    </li>
  );
};

export default NavItem;
