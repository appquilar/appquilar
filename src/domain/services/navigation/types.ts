
import { ReactNode } from 'react';
import { UserRole } from '@/domain/models/UserRole';
import { LucideIcon } from 'lucide-react';

/**
 * Individual navigation item in the sidebar
 */
export interface NavItem {
  id: string;
  href: string;
  title: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

/**
 * Navigation section grouping related items
 */
export interface NavSection {
  id: string;
  title: string | null; // null means no title
  requiredRole: UserRole;
  items: NavItem[];
}

