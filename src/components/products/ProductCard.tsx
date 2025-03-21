import { useState } from 'react';
import { Link } from 'react-router-dom';

// Product interface
export interface Product {
  id: string;
  internalId?: string;
  name: string;
  slug: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  price: {
    hourly?: number;
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  company: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  rating?: number;
  reviewCount: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link 
      to={`/product/${product.slug}`}
      className="group flex flex-col bg-background border border-border rounded-lg overflow-hidden transition-all duration-350 hover:shadow-md hover-lift"
      style={{ 
        opacity: 0,
        animation: 'fade-in 0.5s ease-out forwards',
        animationDelay: `${index * 75}ms`
      }}
    >
      {/* Product image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={product.thumbnailUrl || product.imageUrl} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-spring group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center mb-2">
          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium">
            {product.category.name}
          </span>
          <div className="ml-auto flex items-center">
            <span className="text-xs font-medium text-amber-500">★ {product.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
          </div>
        </div>
        
        <h3 className="text-base font-medium mb-1 line-clamp-1 transition-colors duration-250 group-hover:text-primary">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <span className="text-sm text-muted-foreground">From</span>
              <p className="text-base font-semibold tracking-tight">
                ${product.price.daily.toFixed(2)}<span className="text-xs text-muted-foreground font-normal"> / day</span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{product.company.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
