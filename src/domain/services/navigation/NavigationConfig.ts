import { UserRole } from "@/domain/models/UserRole";
import type { NavItem, NavSection } from "@/domain/services/navigation/types";

export interface DashboardNavigationContext {
    companyId: string | null;
    shouldShowRentalsItem: boolean;
    showCompanyManagement: boolean;
    canManageCompanyUsers: boolean;
}

const createOverviewSection = (): NavSection => ({
    id: "overview",
    title: null,
    items: [
        {
            id: "overview",
            title: "Resumen",
            href: "/dashboard",
            iconKey: "home",
            exact: true,
        },
    ],
});

const createOperationItems = (shouldShowRentalsItem: boolean): NavItem[] => {
    const items: NavItem[] = [
        {
            id: "products",
            title: "Productos",
            href: "/dashboard/products",
            iconKey: "package",
        },
    ];

    if (shouldShowRentalsItem) {
        items.push({
            id: "rentals",
            title: "Alquileres",
            href: "/dashboard/rentals",
            iconKey: "calendar",
        });
    }

    items.push({
        id: "messages",
        title: "Mensajes",
        href: "/dashboard/messages",
        iconKey: "message-circle",
    });

    return items;
};

const createCatalogItems = (): NavItem[] => [
    {
        id: "categories",
        title: "Categorías",
        href: "/dashboard/categories",
        iconKey: "grid-2x2-plus",
        requiredRoles: [UserRole.ADMIN],
    },
    {
        id: "blog",
        title: "Blog",
        href: "/dashboard/blog",
        iconKey: "newspaper",
        requiredRoles: [UserRole.ADMIN],
    },
    {
        id: "sites",
        title: "Sitio",
        href: "/dashboard/sites",
        iconKey: "building-2",
        requiredRoles: [UserRole.ADMIN],
    },
];

const createManagementItems = ({
    companyId,
    showCompanyManagement,
    canManageCompanyUsers,
}: Pick<DashboardNavigationContext, "companyId" | "showCompanyManagement" | "canManageCompanyUsers">): NavItem[] => {
    if (showCompanyManagement && companyId) {
        const items: NavItem[] = [
            {
                id: "company-edit",
                title: "Empresa",
                href: `/dashboard/companies/${companyId}`,
                iconKey: "building-2",
                exact: true,
            },
        ];

        if (canManageCompanyUsers) {
            items.push({
                id: "company-users",
                title: "Usuarios",
                href: `/dashboard/companies/${companyId}/users`,
                iconKey: "users",
            });
        }

        return items;
    }

    return [
        {
            id: "companies",
            title: "Empresas",
            href: "/dashboard/companies",
            iconKey: "building-2",
            requiredRoles: [UserRole.ADMIN],
        },
        {
            id: "users",
            title: "Usuarios",
            href: "/dashboard/users",
            iconKey: "users",
            requiredRoles: [UserRole.ADMIN],
        },
    ];
};

const createBusinessItems = (): NavItem[] => [
    {
        id: "payment-plans",
        title: "Planes de pago",
        href: "/dashboard/payment-plans",
        iconKey: "credit-card",
        requiredRoles: [UserRole.ADMIN],
    },
    {
        id: "platform-analytics",
        title: "Analítica plataforma",
        href: "/dashboard/platform-analytics",
        iconKey: "bar-chart-3",
        requiredRoles: [UserRole.ADMIN],
    },
];

const createSettingsItems = (): NavItem[] => [
    {
        id: "config",
        title: "Configuración",
        href: "/dashboard/config",
        iconKey: "settings",
    },
];

export const buildDashboardNavigationSections = ({
    companyId,
    shouldShowRentalsItem,
    showCompanyManagement,
    canManageCompanyUsers,
}: DashboardNavigationContext): NavSection[] => [
    createOverviewSection(),
    {
        id: "operation",
        title: "OPERACIÓN",
        items: createOperationItems(shouldShowRentalsItem),
    },
    {
        id: "content-catalog",
        title: "CONTENIDO Y CATÁLOGO",
        items: createCatalogItems(),
    },
    {
        id: "management",
        title: "GESTIÓN",
        items: createManagementItems({
            companyId,
            showCompanyManagement,
            canManageCompanyUsers,
        }),
    },
    {
        id: "business",
        title: "NEGOCIO",
        items: createBusinessItems(),
    },
    {
        id: "settings",
        title: "AJUSTES",
        items: createSettingsItems(),
    },
];
