import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "@/pages/ResetPassword";

import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PartnersPage from "@/pages/PartnersPage";

import LegalNoticePage from "@/pages/legal/LegalNoticePage";
import TermsPage from "@/pages/legal/TermsPage";
import CookiesPage from "@/pages/legal/CookiesPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import { queryClient } from "@/compositionRoot.ts";

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

                        {/* Info */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/partners" element={<PartnersPage />} />

                        {/* Legales */}
                        <Route path="/legal/aviso-legal" element={<LegalNoticePage />} />
                        <Route path="/legal/terminos" element={<TermsPage />} />
                        <Route path="/legal/cookies" element={<CookiesPage />} />
                        <Route path="/legal/privacidad" element={<PrivacyPage />} />

                        {/* Ruta de reset de contraseña */}
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* 🔐 Dashboard protegido */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
