import type { UserRole } from "@/domain/models/UserRole";

/**
 * Item de navegación del dashboard.
 *
 * Importante: esto es dominio → nada de React ni imports de lucide aquí.
 * La capa de presentación decide cómo usar `icon`.
 */
export interface NavItem {
    id: string;
    title: string;
    href: string;
    icon?: unknown;
    exact?: boolean;
    badge?: string;

    /**
     * Roles necesarios para ver este item en el sidebar.
     *
     * - undefined o []  → visible para cualquier usuario autenticado
     * - [UserRole.ADMIN] → sólo admins
     */
    requiredRoles?: UserRole[];
}

/**
 * Sección del sidebar que agrupa varios NavItem.
 */
export interface NavSection {
    id: string;
    title: string | null;
    items: NavItem[];
}
