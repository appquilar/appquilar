
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

/**
 * Cliente de consulta para React Query con configuración predeterminada
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

/**
 * Componente principal de la aplicación que configura proveedores y rutas
 */
const App = () => {
  // Add route-based title updates for SEO
  useEffect(() => {
    const updateMetaTags = () => {
      const path = window.location.pathname;
      
      // Default meta information
      let title = "appquilar - Alquiler de herramientas y equipamiento";
      let description = "Plataforma para alquiler de herramientas y equipamiento. Conecta con empresas locales para cubrir tus necesidades.";
      
      // Update based on route
      if (path.includes('/dashboard')) {
        title = "Panel de Control | appquilar";
        description = "Gestiona tus alquileres, productos y cuenta de usuario.";
      } else if (path.includes('/category/')) {
        const category = path.split('/').pop() || '';
        const formattedCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        title = `${formattedCategory} | Alquiler en appquilar`;
        description = `Explora nuestra selección de ${formattedCategory.toLowerCase()} disponibles para alquilar. Encuentra las mejores opciones.`;
      } else if (path.includes('/product/')) {
        title = "Detalles de Producto | appquilar";
        description = "Consulta los detalles, disponibilidad y precios de este producto en alquiler.";
      }
      
      // Update document title and description
      document.title = title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    };
    
    // Update on initial load
    updateMetaTags();
    
    // Listen for route changes
    const observer = new MutationObserver(updateMetaTags);
    observer.observe(document, { subtree: true, childList: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              {/* AÑADE TODAS LAS RUTAS PERSONALIZADAS ENCIMA DE LA RUTA CATCH-ALL "*" */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
