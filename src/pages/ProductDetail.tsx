
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductPage from '@/components/products/ProductPage';
import { AuthProvider } from '@/context/AuthContext';

const ProductDetail = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ProductPage />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default ProductDetail;
