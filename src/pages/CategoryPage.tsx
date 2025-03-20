
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product } from '@/components/products/ProductCard';
import { AuthProvider } from '@/context/AuthContext';
import { CATEGORIES, Category } from '@/components/category/CategoryData';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategorySearch from '@/components/category/CategorySearch';
import ProductGrid from '@/components/category/ProductGrid';
import NoProductsFound from '@/components/category/NoProductsFound';
import LoadingState from '@/components/category/LoadingState';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Fetch category data
  useEffect(() => {
    if (!slug) return;
    
    // Simulate API call
    setLoading(true);
    
    setTimeout(() => {
      const categoryData = CATEGORIES[slug as keyof typeof CATEGORIES];
      if (categoryData) {
        setCategory(categoryData);
        setProducts(categoryData.products);
      } else {
        setCategory(null);
        setProducts([]);
      }
      setLoading(false);
    }, 500);
  }, [slug]);
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <LoadingState />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    );
  }
  
  if (!category) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-medium mb-4">Category not found</h1>
            <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    );
  }
  
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <CategoryHeader name={category.name} description={category.description} />
            
            <CategorySearch 
              searchQuery={searchQuery}
              categoryName={category.name}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
            />
            
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <NoProductsFound 
                searchQuery={searchQuery} 
                categoryName={category.name} 
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default CategoryPage;
