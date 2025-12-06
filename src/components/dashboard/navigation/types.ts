/**
 * Props usadas por los componentes de navegación del dashboard.
 * Es puramente de presentación (no mezcla dominio).
 */
export interface DashboardNavigationProps {
    /**
     * Identificador de la pestaña actualmente activa
     * (por ejemplo: 'overview', 'products', etc.)
     */
    activeTab?: string;

    /**
     * Callback cuando cambia de pestaña (se hace click en un item).
     * Recibe el "tabName" que calcula DashboardNavigationContent.
     */
    onTabChange?: (tab: string) => void;

    /**
     * Callback opcional cuando se navega en móvil (para cerrar el menú lateral).
     */
    onNavigate?: () => void;
}
