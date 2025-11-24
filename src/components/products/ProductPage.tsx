
import React, { useState, useEffect } from 'react';
import { Product } from '@/domain/models/Product';
import CompanyInfo from './CompanyInfo';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import RentalSummary from './RentalSummary';
import SecondHandInfo from './SecondHandInfo';
import ProductLocationMap from './ProductLocationMap';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ProductService } from '@/application/services/ProductService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductPageProps {
  productId?: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'rental' | 'secondhand'>('rental');
  const { isLoggedIn } = useAuth();
  const productService = ProductService.getInstance();

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // If productId is undefined, try to find it in URL
        const id = productId || window.location.pathname.split('/').pop() || '';
        
        const foundProduct = await productService.getProductById(id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Set the initial tab based on product availability
          if (foundProduct.isForSale && !foundProduct.isRentable) {
            setActiveTab('secondhand');
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProduct();
  }, [productId, productService]);

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const handleContactRequest = () => {
    if (!isLoggedIn) {
      toast.error("Debes iniciar sesión para contactar con el propietario", {
        action: {
          label: "Iniciar sesión",
          onClick: () => {
            // Logic to open login modal
          }
        }
      });
      return;
    }

    toast.success("Solicitud de contacto enviada");
    // Additional logic to handle contact request
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <p>Lo sentimos, el producto que estás buscando no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Image Gallery - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ProductImageGallery 
            images={[product.imageUrl, product.thumbnailUrl]}
            productName={product.name} 
          />
          
          {/* Product description section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Detalles</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          {/* Location Map */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
            <ProductLocationMap 
              location="Campohermoso (Almería)" 
              coordinates={[-2.4637, 36.8381]}
            />
          </div>
        </div>
        
        {/* Product Info Sidebar - 1 column on large screens */}
        <div className="lg:col-span-1 space-y-6">
          <ProductInfo 
            product={product}
            onContact={handleContactRequest}
            isLoggedIn={isLoggedIn}
          />
          
          {/* Show tabs only if the product is available for both rental and second hand */}
          {product.isRentable && product.isForSale ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rental' | 'secondhand')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rental">Alquiler</TabsTrigger>
                <TabsTrigger value="secondhand">Compra</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rental" className="space-y-6 pt-4">
                <RentalSummary 
                  product={product}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  onContactClick={handleContactRequest}
                />
              </TabsContent>
              
              <TabsContent value="secondhand" className="space-y-6 pt-4">
                <SecondHandInfo 
                  product={product}
                  onContactClick={handleContactRequest}
                />
              </TabsContent>
            </Tabs>
          ) : product.isRentable ? (
            <div className="space-y-6">
              <RentalSummary 
                product={product}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                onContactClick={handleContactRequest}
              />
            </div>
          ) : product.isForSale ? (
            <SecondHandInfo 
              product={product}
              onContactClick={handleContactRequest}
            />
          ) : null}
        </div>
      </div>
      
      {/* Company Info - full width */}
      <div className="mt-12">
        <CompanyInfo 
          company={product.company}
          onContact={handleContactRequest}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
};

export default ProductPage;
