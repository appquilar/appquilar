import {useLocation} from "react-router-dom";
import {Calendar, Home, MessageCircle, Package, Settings, Users, Grid2X2Plus, Building2} from "lucide-react";
import type {NavSection} from "@/domain/services/navigation/types";
import {UserRole} from "@/domain/models/UserRole";
import { useAuth } from "@/context/AuthContext";
import { useUnreadRentMessagesCount } from "@/application/hooks/useRentalMessages";
import { useOwnedProductsCount } from "@/application/hooks/useProducts";

export const useNavigation = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const { totalUnread } = useUnreadRentMessagesCount();
    const ownerId = currentUser?.companyId || currentUser?.id;
    const ownerType = currentUser?.companyId ? "company" : "user";
    const ownedProductsCountQuery = useOwnedProductsCount({
        ownerId,
        ownerType,
    });

    const roles = currentUser?.roles ?? [];
    const isAdmin = roles.includes(UserRole.ADMIN);
    const isRegularUser = roles.includes(UserRole.REGULAR_USER);
    const isCompanyMember = Boolean(currentUser?.companyId);
    const hasProductsToShow = (ownedProductsCountQuery.data ?? 0) > 0;
    const shouldShowRentalsItem = hasProductsToShow;

    const canUpgradeToCompany = isRegularUser && !isAdmin && !isCompanyMember;

    const navSections: NavSection[] = [
        {
            id: "main",
            title: "General",
            items: [
                {
                    id: "overview",
                    title: "Resumen",
                    href: "/dashboard",
                    icon: Home,
                    exact: true,
                    // sin requiredRoles => visible para cualquiera logado
                },
                {
                    id: "products",
                    title: "Productos",
                    href: "/dashboard/products",
                    icon: Package,
                },
                ...(shouldShowRentalsItem
                    ? [{
                        id: "rentals",
                        title: "Alquileres",
                        href: "/dashboard/rentals",
                        icon: Calendar,
                    }]
                    : []),
                {
                    id: "messages",
                    title: "Mensajes",
                    href: "/dashboard/messages",
                    icon: MessageCircle,
                    badge: totalUnread > 0 ? String(totalUnread) : undefined,
                },
            ],
        },
        {
            id: "admin",
            title: "Administración",
            items: [
                {
                    id: "users",
                    title: "Usuarios",
                    href: "/dashboard/users",
                    icon: Users,
                    requiredRoles: [UserRole.ADMIN],
                },
                {
                    id: "categories",
                    title: "Categorías",
                    href: "/dashboard/categories",
                    icon: Grid2X2Plus,
                    requiredRoles: [UserRole.ADMIN],
                },
            ],
        },
        {
            id: "settings",
            title: "Configuración",
            items: [
                {
                    id: "config",
                    title: "Configuración",
                    href: "/dashboard/config",
                    icon: Settings,
                },
                {
                    id: "sites",
                    title: "Sitio",
                    href: "/dashboard/sites",
                    icon: Building2,
                    requiredRoles: [UserRole.ADMIN],
                },
            ],
        },
    ];

    const isActive = (href: string, exact = false): boolean => {
        if (exact) {
            return location.pathname === href;
        }

        return (
            location.pathname === href ||
            location.pathname.startsWith(`${href}/`)
        );
    };

    return {
        navSections,
        canUpgradeToCompany,
        isActive,
    };
};
