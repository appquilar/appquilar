import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "@/pages/ResetPassword";

import {AuthProvider} from "./context/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import {queryClient} from "@/compositionRoot.ts";

/**
 * Cliente de consulta para React Query con configuración predeterminada
 */

/**
 * Componente principal de la aplicación que configura proveedores y rutas
 */
const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* 🔒 ÚNICO AuthProvider global */}
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />

                        {/* Ruta de reset de contraseña (pública, pero con token/email en URL) */}
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* 🔐 Dashboard protegido por sesión válida (/me) */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* AÑADE TODAS LAS RUTAS PERSONALIZADAS ENCIMA DE LA RUTA CATCH-ALL "*" */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
