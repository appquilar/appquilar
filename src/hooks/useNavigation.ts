import {useLocation} from "react-router-dom";
import {Calendar, Home, MessageCircle, Package, Settings, Users, Grid2X2Plus, Building2, Newspaper} from "lucide-react";
import type {NavSection} from "@/domain/services/navigation/types";
import {UserRole} from "@/domain/models/UserRole";
import { useAuth } from "@/context/AuthContext";
import { useUnreadRentMessagesCount } from "@/application/hooks/useRentalMessages";
import { useOwnedProductsCount } from "@/application/hooks/useProducts";
import { useOwnerRentalsCount } from "@/application/hooks/useRentals";

export const useNavigation = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const { totalUnread } = useUnreadRentMessagesCount();
    const ownerId = currentUser?.companyId || currentUser?.id;
    const ownerType = currentUser?.companyId ? "company" : "user";
    const ownedPublishedProductsCountQuery = useOwnedProductsCount({
        ownerId,
        ownerType,
        filters: {
            publicationStatus: "published",
        },
    });
    const ownerRentalsCountQuery = useOwnerRentalsCount({ ownerId });

    const roles = currentUser?.roles ?? [];
    const isAdmin = roles.includes(UserRole.ADMIN);
    const isRegularUser = roles.includes(UserRole.REGULAR_USER);
    const isCompanyMember = Boolean(currentUser?.companyId);
    const isCompanyOwner = currentUser?.isCompanyOwner === true;
    const companyId = currentUser?.companyId ?? null;
    const hasPublishedProductsToRent = (ownedPublishedProductsCountQuery.data ?? 0) > 0;
    const hasRentalsAsOwner = (ownerRentalsCountQuery.data ?? 0) > 0;
    const shouldShowRentalsItem = hasPublishedProductsToRent || hasRentalsAsOwner;

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
        ...(isCompanyMember && companyId
            ? [{
                id: "company",
                title: "Empresa",
                items: [
                    {
                        id: "company-edit",
                        title: "Mi empresa",
                        href: `/dashboard/companies/${companyId}`,
                        icon: Building2,
                        exact: true,
                    },
                    ...(isCompanyOwner
                        ? [{
                            id: "company-users",
                            title: "Usuarios empresa",
                            href: `/dashboard/companies/${companyId}/users`,
                            icon: Users,
                        }]
                        : []),
                ],
            }]
            : []),
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
                {
                    id: "blog",
                    title: "Blog",
                    href: "/dashboard/blog",
                    icon: Newspaper,
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
