
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from './ProductCard';
import { SeoService } from '@/infrastructure/services/SeoService';
import { useAuth } from '@/context/AuthContext';
import ChatModal from '../chat/ChatModal';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import AvailabilityCalendar from './AvailabilityCalendar';
import RentalSummary from './RentalSummary';

// Datos de ejemplo del producto - en producción se obtendrían del backend
const SAMPLE_PRODUCT: Product = {
  id: '1',
  name: 'Taladro Profesional 20V',
  slug: 'professional-hammer-drill-20v',
  imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
  thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
  description: 'Taladro percutor de alta potencia perfecto para trabajos en concreto y mampostería. Incluye función de velocidad variable, reversa y empuñadura ergonómica. Incluye batería, cargador y estuche de transporte.',
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
    name: 'Herramientas Eléctricas',
    slug: 'power-tools'
  },
  rating: 4.8,
  reviewCount: 124,
  availability: [
    {
      id: 'period-1',
      startDate: '2023-10-01',
      endDate: '2023-10-15',
      status: 'available'
    },
    {
      id: 'period-2',
      startDate: '2023-10-20',
      endDate: '2023-10-30',
      status: 'available'
    },
    {
      id: 'period-3',
      startDate: '2023-11-05',
      endDate: '2023-11-15',
      status: 'rented'
    }
  ]
};

/**
 * Página de detalle del producto
 */
const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const { isLoggedIn, user } = useAuth();
  
  // Galería de imágenes - en una app real, esto vendría de los datos del producto
  const images = [
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
  ];

  // Configurar SEO
  useEffect(() => {
    const setupSeo = async () => {
      if (product) {
        const seoService = SeoService.getInstance();
        const seoInfo = await seoService.getProductSeoInfo(
          product.slug,
          product.name,
          product.company.name,
          product.category.name,
          product.price.daily
        );
        
        // Actualizar meta tags - en una app real esto se haría con un componente SEO
        document.title = seoInfo.title;
        
        // Aquí podrías actualizar otros meta tags si tuvieras acceso directo al head del documento
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', seoInfo.description);
        }
      }
    };
    
    setupSeo();
  }, [product]);

  // Obtener datos del producto
  useEffect(() => {
    // Simulando una llamada a la API
    setLoading(true);
    // En una app real, obtendríamos el producto desde el backend
    setTimeout(() => {
      // Para la demo, usamos el producto de ejemplo
      setProduct(SAMPLE_PRODUCT);
      setLoading(false);
    }, 500);
  }, [slug]);

  // Handler for date range selection
  const handleDateRangeSelected = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    
    // You could calculate rental cost based on selected period here
    console.log(`Selected rental period: ${startDate.toDateString()} to ${endDate.toDateString()}`);
  };

  // Manejar clic en botón de contacto
  const handleContact = () => {
    setChatModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4">
        <h1 className="text-2xl font-medium mb-4">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 animate-fade-in">
      {/* Botón de volver */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="group mb-6 pl-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes del producto */}
          <ProductImageGallery images={images} productName={product.name} />
          
          {/* Información del producto */}
          <ProductInfo 
            product={product} 
            onContact={handleContact} 
            isLoggedIn={isLoggedIn} 
          />
        </div>
      </div>

      {/* Availability calendar and rental summary */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Disponibilidad</h2>
            {product?.availability && (
              <AvailabilityCalendar 
                availabilityPeriods={product.availability}
                onSelectDateRange={handleDateRangeSelected}
              />
            )}
          </div>
          
          <div>
            {/* Rental summary component */}
            <RentalSummary 
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              product={product}
              onContactClick={handleContact}
            />
          </div>
        </div>
      </div>

      {/* Modal de chat */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        productId={product.id}
        companyId={product.company.id}
        productName={product.name}
      />
    </div>
  );
};

export default ProductPage;
