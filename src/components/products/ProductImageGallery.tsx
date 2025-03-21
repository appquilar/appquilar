
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Manejar la navegación del slider
  const slideToIndex = (index: number) => {
    if (!sliderRef.current) return;
    
    if (index < 0) {
      setCurrentImageIndex(images.length - 1);
    } else if (index >= images.length) {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Imagen principal con slider */}
      <div 
        ref={sliderRef}
        className="relative aspect-[4/3] overflow-hidden bg-muted rounded-xl"
      >
        <div 
          className="flex transition-transform duration-500 ease-spring h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img 
                src={image} 
                alt={`${productName} - Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Flechas de navegación */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={() => slideToIndex(currentImageIndex - 1)}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={() => slideToIndex(currentImageIndex + 1)}
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={18} />
            </Button>
          </>
        )}
        
        {/* Indicadores de paginación */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => slideToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImageIndex === index 
                    ? 'bg-white w-3' 
                    : 'bg-white/50'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => slideToIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                currentImageIndex === index 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              <img 
                src={image} 
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
