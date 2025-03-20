
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Category interface
interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  count: number;
}

// Placeholder categories - will be fetched from backend in production
const CATEGORIES: Category[] = [
  { 
    id: '1',
    name: 'Power Tools', 
    slug: 'power-tools',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    count: 42
  },
  { 
    id: '2', 
    name: 'Hand Tools', 
    slug: 'hand-tools',
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    count: 38
  },
  { 
    id: '3', 
    name: 'Gardening', 
    slug: 'gardening',
    imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    count: 24
  },
  { 
    id: '4', 
    name: 'Construction', 
    slug: 'construction',
    imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    count: 31
  },
  { 
    id: '5', 
    name: 'Event Equipment', 
    slug: 'event-equipment',
    imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    count: 29
  },
  { 
    id: '6', 
    name: 'Cleaning', 
    slug: 'cleaning',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    count: 19
  },
];

const CategoryGrid = () => {
  // Preview image loading
  useEffect(() => {
    CATEGORIES.forEach(category => {
      const img = new Image();
      img.src = category.imageUrl;
    });
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Browse</span>
            <h2 className="text-3xl font-display font-semibold tracking-tight">Categories</h2>
          </div>
          <Link 
            to="/categories" 
            className="text-sm font-medium hover:underline"
          >
            View all categories
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category, index) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] transition-all duration-350 hover-glow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Category image */}
              <div className="absolute inset-0 bg-muted">
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-450 ease-spring group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 transition-opacity duration-350 group-hover:opacity-90"></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-medium text-white font-display">{category.name}</h3>
                <p className="text-sm text-white/80 mt-1">{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
