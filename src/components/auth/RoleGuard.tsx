import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/domain/models/UserRole";

interface RoleGuardProps {
    children: ReactNode;
    /**
     * Roles necesarios para ver el contenido.
     * - undefined / []  ⇒ cualquier usuario autenticado
     * - [UserRole.ADMIN] ⇒ sólo admins
     */
    requiredRoles?: UserRole[];
}

/**
 * RoleGuard inteligente:
 *
 * - Si NO está logado → redirige SIEMPRE a "/".
 * - Si está logado pero no tiene los roles necesarios:
 *      - Si está dentro de /dashboard → redirige a "/dashboard"
 *      - Si está en una ruta pública   → redirige a "/"
 * - Si tiene los roles correctos → renderiza children.
 *
 * Además:
 * - Mientras isLoading === true no decide nada (evita parpadeos/loops).
 */
const RoleGuard = ({ children, requiredRoles }: RoleGuardProps) => {
    const { isAuthenticated, isLoading, currentUser } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    // 1️⃣ Mientras se resuelve el estado de auth, no tomamos decisiones
    if (isLoading) {
        return null; // o un spinner si quieres
    }

    // 2️⃣ Sin sesión → siempre a la home pública
    if (!isAuthenticated) {
        return <Navigate to="/" replace state={{ from: path }} />;
    }

    // 3️⃣ Sin restricciones de rol → cualquier usuario autenticado puede pasar
    if (!requiredRoles || requiredRoles.length === 0) {
        return <>{children}</>;
    }

    const roles = currentUser?.roles ?? [];
    const hasPermission = roles.some((role) => requiredRoles.includes(role));

    // 4️⃣ Autenticado pero sin permiso suficiente
    if (!hasPermission) {
        const isDashboardRoute = path.startsWith("/dashboard");

        if (isDashboardRoute) {
            // Dentro del dashboard, volvemos al índice del dashboard
            return <Navigate to="/dashboard" replace />;
        }

        // En página pública, volvemos al índice público
        return <Navigate to="/" replace />;
    }

    // 5️⃣ Todo OK → acceso
    return <>{children}</>;
};

export default RoleGuard;
