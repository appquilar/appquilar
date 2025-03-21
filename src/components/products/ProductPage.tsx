
import React, { useState, useEffect } from 'react';
import { Product, AvailabilityPeriod } from './ProductCard';
import CompanyInfo from './CompanyInfo';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import RentalSummary from './RentalSummary';
import AvailabilityCalendar from './AvailabilityCalendar';
import { CATEGORIES } from '../category/CategoryData';

interface ProductPageProps {
  productId: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call to fetch product
    setTimeout(() => {
      // Search for the product in all categories
      const foundProduct = Object.values(CATEGORIES)
        .flatMap(category => category.products)
        .find(prod => prod.id === productId);
      
      if (foundProduct) {
        // Add mock availability periods if not present
        if (!foundProduct.availability) {
          const today = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(today.getMonth() + 1);
          
          const defaultAvailability: AvailabilityPeriod[] = [
            {
              id: 'period-1',
              startDate: today.toISOString().split('T')[0],
              endDate: nextMonth.toISOString().split('T')[0],
              status: 'available',
              includeWeekends: true
            }
          ];
          
          foundProduct.availability = defaultAvailability;
        }
        
        setProduct(foundProduct);
      }
      
      setIsLoading(false);
    }, 500);
  }, [productId]);

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product Image Gallery - 6 columns on large screens */}
        <div className="lg:col-span-6">
          <ProductImageGallery imageUrl={product.imageUrl} name={product.name} />
        </div>
        
        {/* Product Info - 6 columns on large screens */}
        <div className="lg:col-span-6 space-y-8">
          <ProductInfo product={product} />
          
          <AvailabilityCalendar 
            availabilityPeriods={product.availability || []}
            onSelectDateRange={handleDateRangeSelect}
          />
          
          <RentalSummary 
            product={product}
            startDate={selectedStartDate}
            endDate={selectedEndDate}
          />
        </div>
      </div>
      
      {/* Company Info - full width */}
      <div className="mt-12">
        <CompanyInfo company={product.company} />
      </div>
    </div>
  );
};

export default ProductPage;
