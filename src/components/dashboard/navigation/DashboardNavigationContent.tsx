import React from "react";
import {useNavigate} from "react-router-dom";
import {useIsMobile} from "@/hooks/use-mobile";
import {DashboardNavigationProps} from "./types";
import UserProfile from "./UserProfile";
import NavSection from "./NavSection";
import UpgradeLink from "./UpgradeLink";
import {useNavigation} from "@/hooks/useNavigation";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {MapPin} from "lucide-react";
import {useAuth} from "@/context/AuthContext";
import {UserRole} from "@/domain/models/UserRole";

/**
 * Contenido principal de la navegación del panel de control
 */
const DashboardNavigationContent = ({
                                        activeTab,
                                        onTabChange,
                                        onNavigate,
                                    }: DashboardNavigationProps) => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const {navSections, canUpgradeToCompany, isActive} = useNavigation();
    const hasAddress = false;

    const {currentUser} = useAuth();
    const roles = currentUser?.roles ?? [];
    const isAdmin = roles.includes(UserRole.ADMIN);

    const handleTabChange = (href: string) => {
        const tabName =
            href === "/dashboard"
                ? "overview"
                : href.split("/").pop() || "overview";

        if (onTabChange) onTabChange(tabName);
        if (onNavigate) onNavigate();
    };

    /**
     * Devuelve true si el usuario puede ver un item.
     *
     * - Sin requiredRoles → cualquiera logado.
     * - Con requiredRoles → el usuario debe tener al menos uno.
     */
    const canSeeItem = (requiredRoles?: UserRole[]): boolean => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        return roles.some((role) => requiredRoles.includes(role));
    };

    const filteredSections = navSections
        .map((section) => {
            const visibleItems = section.items.filter((item) =>
                canSeeItem(item.requiredRoles),
            );

            return {
                ...section,
                items: visibleItems,
            };
        })
        .filter((section) => section.items.length > 0);

    return (
        <div className="flex flex-col h-full">
            {/* Enlaces de navegación */}
            <nav className={`p-2 flex-grow ${isMobile ? "py-4" : ""}`}>
                <ul className="space-y-1">
                    {filteredSections.map((section) => (
                        <NavSection
                            key={section.id}
                            title={section.title}
                            items={section.items}
                            isActive={isActive}
                            onTabChange={handleTabChange}
                        />
                    ))}
                </ul>
            </nav>

            {/* Alerta de dirección vacía */}
            {!hasAddress && (
                <div className="px-2 mb-2">
                    <Alert
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate("/dashboard/config?tab=address")}
                    >
                        <MapPin className="h-4 w-4"/>
                        <AlertDescription className="text-xs">
                            Añade tu dirección en Configuración
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Enlace para actualizar a cuenta de empresa (justo antes del perfil) */}
            {canUpgradeToCompany && (
                <div className="px-2 mb-2">
                    <UpgradeLink/>
                </div>
            )}

            {/* Información del usuario/empresa en la parte inferior */}
            <div className="mt-auto">
                <UserProfile/>
            </div>
        </div>
    );
};

export default DashboardNavigationContent;
