
import { Link } from 'react-router-dom';
import ProductCard, { Product } from '../products/ProductCard';

// Placeholder products - will be fetched from backend in production
const PRODUCTS: Product[] = [
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
  }
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Discover</span>
            <h2 className="text-3xl font-display font-semibold tracking-tight">Featured Tools</h2>
          </div>
          <Link 
            to="/products" 
            className="text-sm font-medium hover:underline"
          >
            View all products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
