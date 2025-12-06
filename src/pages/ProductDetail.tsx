import {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductPage from '@/components/products/ProductPage';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ProductPage productId={slug} />
        </main>
        <Footer />
      </div>
  );
};

export default ProductDetail;
