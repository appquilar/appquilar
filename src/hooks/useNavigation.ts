import {useLocation} from "react-router-dom";
import {Calendar, Home, MessageCircle, Package, Settings, Users, Grid2X2Plus, Building2} from "lucide-react";
import type {NavSection} from "@/domain/services/navigation/types";
import {UserRole} from "@/domain/models/UserRole";

export const useNavigation = () => {
    const location = useLocation();

    // TODO: lógica real cuando conectes con company/planes
    const canUpgradeToCompany = true;

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
                {
                    id: "rentals",
                    title: "Alquileres",
                    href: "/dashboard/rentals",
                    icon: Calendar,
                },
                {
                    id: "messages",
                    title: "Mensajes",
                    href: "/dashboard/messages",
                    icon: MessageCircle,
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
