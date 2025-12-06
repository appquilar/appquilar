import type {ReactNode} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";
import {Loader2} from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute
 *
 * Envuelve rutas que requieren sesión iniciada.
 * Usa el estado de AuthContext (que a su vez se basa en /me)
 * para decidir si mostrar el contenido o redirigir.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { currentUser, isLoading } = useAuth();
    const location = useLocation();

    // Mientras AuthContext está cargando (llamando a /me), no sabemos aún si hay sesión.
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Comprobando tu sesión...</span>
                </div>
            </div>
        );
    }

    // Si no hay usuario, no hay sesión válida -> redirigimos fuera del dashboard.
    if (!currentUser) {
        return (
            <Navigate
                to="/"
                replace
                state={{ from: location.pathname + location.search }}
            />
        );
    }

    // Sesión válida -> mostramos la ruta protegida.
    return <>{children}</>;
};

export default ProtectedRoute;
