
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Phone, Star, Heart, Share, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from './ProductCard';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ChatModal from '../chat/ChatModal';
import { SeoService } from '@/infrastructure/services/SeoService';

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
  reviewCount: 124
};

/**
 * Página de detalle del producto
 */
const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();
  
  // Referencias para el slider
  const sliderRef = useRef<HTMLDivElement>(null);
  
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

  // Manejar clic en botón de contacto
  const handleContact = () => {
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para contactar con el propietario.", {
        action: {
          label: "Iniciar sesión",
          onClick: () => {
            // Aquí podrías abrir el modal de autenticación
          }
        }
      });
      return;
    }
    
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
                      alt={`${product.name} - Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Flechas de navegación */}
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
              
              {/* Indicadores de paginación */}
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
            </div>
            
            {/* Miniaturas */}
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
          </div>
          
          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium">
                  {product.category.name}
                </span>
                <div className="ml-auto flex items-center">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < Math.round(product.rating) 
                          ? 'fill-amber-500 text-amber-500' 
                          : 'fill-muted text-muted'
                        } 
                      />
                    ))}
                  </div>
                  <span className="text-sm ml-2">
                    {product.rating.toFixed(1)} ({product.reviewCount} opiniones)
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-display font-semibold tracking-tight mb-3">
                {product.name}
              </h1>
              
              <div className="flex space-x-4 mb-6">
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart size={16} />
                  <span className="sr-only sm:not-sr-only">Guardar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share size={16} />
                  <span className="sr-only sm:not-sr-only">Compartir</span>
                </Button>
              </div>
              
              <p className="text-muted-foreground">
                {product.description}
              </p>
            </div>
            
            {/* Precios de alquiler */}
            <div>
              <h3 className="text-lg font-medium mb-3">Precios de Alquiler</h3>
              <Tabs defaultValue="daily" onValueChange={(value) => setSelectedPeriod(value as any)}>
                <TabsList className="w-full grid grid-cols-4">
                  {product.price.hourly && (
                    <TabsTrigger value="hourly">Por hora</TabsTrigger>
                  )}
                  <TabsTrigger value="daily">Por día</TabsTrigger>
                  {product.price.weekly && (
                    <TabsTrigger value="weekly">Por semana</TabsTrigger>
                  )}
                  {product.price.monthly && (
                    <TabsTrigger value="monthly">Por mes</TabsTrigger>
                  )}
                </TabsList>
                
                {product.price.hourly && (
                  <TabsContent value="hourly" className="pt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">{product.price.hourly.toFixed(2)}€</span>
                      <span className="text-muted-foreground ml-2">/ hora</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ideal para proyectos cortos o tareas rápidas.
                    </p>
                  </TabsContent>
                )}
                
                <TabsContent value="daily" className="pt-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-semibold">{product.price.daily.toFixed(2)}€</span>
                    <span className="text-muted-foreground ml-2">/ día</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Perfecto para proyectos de un día o eventos.
                  </p>
                </TabsContent>
                
                {product.price.weekly && (
                  <TabsContent value="weekly" className="pt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">{product.price.weekly.toFixed(2)}€</span>
                      <span className="text-muted-foreground ml-2">/ semana</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ideal para proyectos extendidos, ahorra comparado con tarifas diarias.
                    </p>
                  </TabsContent>
                )}
                
                {product.price.monthly && (
                  <TabsContent value="monthly" className="pt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-semibold">{product.price.monthly.toFixed(2)}€</span>
                      <span className="text-muted-foreground ml-2">/ mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mejor valor para proyectos a largo plazo o uso regular.
                    </p>
                  </TabsContent>
                )}
              </Tabs>
            </div>
            
            {/* Información de la empresa */}
            <div className="bg-secondary rounded-lg p-4">
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3">
                Proporcionado por
              </h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mr-3">
                  {product.company.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{product.company.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>Madrid, España</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4">
                <Button 
                  className="w-full mb-2 gap-2" 
                  onClick={handleContact}
                >
                  <Phone size={16} />
                  Contactar para Alquilar
                </Button>
              </div>
            </div>
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
