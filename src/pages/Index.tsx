
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/Home/Hero';
import CategoryGrid from '@/components/Home/CategoryGrid';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import { AuthProvider } from '@/context/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * Página principal de la aplicación
 */
const Index = () => {
  // Hook personalizado para volver al inicio de la página
  useScrollToTop();

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <CategoryGrid />
          <FeaturedProducts />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default Index;
