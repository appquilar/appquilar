
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard, { Product } from '@/components/products/ProductCard';
import { AuthProvider } from '@/context/AuthContext';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Sample category data with products
const CATEGORIES = {
  'power-tools': {
    id: '1',
    name: 'Power Tools',
    description: 'Professional-grade power tools for any project. Find drills, saws, sanders, and more.',
    products: [
      {
        id: '1',
        name: 'Professional Hammer Drill 20V',
        slug: 'professional-hammer-drill-20v',
        imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        description: 'Heavy-duty hammer drill perfect for concrete and masonry work. Includes battery, charger, and carrying case.',
        price: {
          hourly: 8,
          daily: 25,
          weekly: 120,
          monthly: 350
        },
        company: {
          id: '1',
          name: 'Pro Tools Inc.',
          slug: 'pro-tools-inc'
        },
        category: {
          id: '1',
          name: 'Power Tools',
          slug: 'power-tools'
        },
        rating: 4.8,
        reviewCount: 124
      },
      {
        id: '2',
        name: 'Table Saw with Stand',
        slug: 'table-saw-with-stand',
        imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
        thumbnailUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
        description: 'Portable table saw with folding stand. Great for job sites and DIY projects.',
        price: {
          daily: 35,
          weekly: 160,
          monthly: 450
        },
        company: {
          id: '1',
          name: 'Pro Tools Inc.',
          slug: 'pro-tools-inc'
        },
        category: {
          id: '1',
          name: 'Power Tools',
          slug: 'power-tools'
        },
        rating: 4.6,
        reviewCount: 89
      },
    ]
  },
  'hand-tools': {
    id: '2',
    name: 'Hand Tools',
    description: 'Quality hand tools for precision work. Find hammers, wrenches, screwdrivers, and more.',
    products: []
  },
  'gardening': {
    id: '3',
    name: 'Gardening',
    description: 'Everything you need for lawn and garden care. Find mowers, trimmers, and landscaping tools.',
    products: [
      {
        id: '3',
        name: 'Landscaping Tool Set',
        slug: 'landscaping-tool-set',
        imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        thumbnailUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        description: 'Complete set of landscaping tools including rake, shovel, pruners, and more.',
        price: {
          daily: 20,
          weekly: 90,
          monthly: 280
        },
        company: {
          id: '2',
          name: 'Garden Pros',
          slug: 'garden-pros'
        },
        category: {
          id: '3',
          name: 'Gardening',
          slug: 'gardening'
        },
        rating: 4.7,
        reviewCount: 54
      },
    ]
  },
  'construction': {
    id: '4',
    name: 'Construction',
    description: 'Heavy-duty equipment for construction projects. Find jackhammers, concrete tools, and more.',
    products: [
      {
        id: '4',
        name: '48" Concrete Bull Float',
        slug: 'concrete-bull-float',
        imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
        description: 'Professional grade concrete bull float for smoothing freshly poured concrete surfaces.',
        price: {
          daily: 28,
          weekly: 120,
          monthly: 340
        },
        company: {
          id: '3',
          name: 'Construction Rentals',
          slug: 'construction-rentals'
        },
        category: {
          id: '4',
          name: 'Construction',
          slug: 'construction'
        },
        rating: 4.9,
        reviewCount: 37
      },
    ]
  },
  'event-equipment': {
    id: '5',
    name: 'Event Equipment',
    description: 'Everything you need for successful events. Find tables, chairs, tents, and more.',
    products: [
      {
        id: '5',
        name: 'Folding Banquet Tables (Set of 4)',
        slug: 'folding-banquet-tables',
        imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
        thumbnailUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
        description: 'Set of 4 rectangular 6-foot folding tables, perfect for events, parties, and gatherings.',
        price: {
          daily: 40,
          weekly: 175,
          monthly: 500
        },
        company: {
          id: '4',
          name: 'Event Essentials',
          slug: 'event-essentials'
        },
        category: {
          id: '5',
          name: 'Event Equipment',
          slug: 'event-equipment'
        },
        rating: 4.5,
        reviewCount: 62
      },
    ]
  },
  'cleaning': {
    id: '6',
    name: 'Cleaning',
    description: 'Professional cleaning equipment for any job. Find carpet cleaners, pressure washers, and more.',
    products: [
      {
        id: '6',
        name: 'Commercial Carpet Cleaner',
        slug: 'commercial-carpet-cleaner',
        imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        description: 'Professional-grade carpet cleaner capable of handling large spaces. Includes cleaning solution.',
        price: {
          daily: 45,
          weekly: 195,
          monthly: 580
        },
        company: {
          id: '5',
          name: 'Clean Machine Rentals',
          slug: 'clean-machine-rentals'
        },
        category: {
          id: '6',
          name: 'Cleaning',
          slug: 'cleaning'
        },
        rating: 4.7,
        reviewCount: 48
      },
    ]
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
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
          <main className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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
            <div className="py-10">
              <h1 className="text-3xl font-display font-semibold">{category.name}</h1>
              <p className="text-muted-foreground mt-2 max-w-3xl">{category.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </form>
              <Button variant="outline" className="gap-2 sm:w-auto w-full">
                <Filter size={16} />
                Filters
              </Button>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No products matching "${searchQuery}" in this category.` 
                    : `There are currently no products in the ${category.name} category.`
                  }
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default CategoryPage;
