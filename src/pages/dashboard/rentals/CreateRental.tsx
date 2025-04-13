
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useRentalForm } from '@/application/hooks/useRentalForm';
import { useProductSelection } from '@/application/hooks/useProductSelection';
import CreateRentalHeader from '@/components/dashboard/rentals/CreateRentalHeader';
import ProductInfoFields from '@/components/dashboard/rentals/form/ProductInfoFields';
import CustomerInfoFields from '@/components/dashboard/rentals/form/CustomerInfoFields';
import RentalDetailsFields from '@/components/dashboard/rentals/form/RentalDetailsFields';
import FormActions from '@/components/dashboard/rentals/form/FormActions';
import { useIsMobile } from '@/hooks/use-mobile';

const CreateRental = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { form, isSubmitting, onSubmit } = useRentalForm();
  const { 
    productSearch, 
    setProductSearch, 
    selectedProduct,
    filteredProducts, 
    isLoading, 
    handleProductSelect 
  } = useProductSelection(form);

  return (
    <div className={`container mx-auto ${isMobile ? 'px-3 pb-20' : 'px-4 py-6'}`}>
      <CreateRentalHeader />

      <div className="bg-card rounded-lg border p-3 sm:p-6">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5">
            <ProductInfoFields
              form={form}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              selectedProduct={selectedProduct}
              filteredProducts={filteredProducts}
              isLoading={isLoading}
              handleProductSelect={handleProductSelect}
            />

            <Separator className="my-4" />
            
            <CustomerInfoFields form={form} />

            <Separator className="my-4" />

            <RentalDetailsFields form={form} />

            <FormActions 
              isSubmitting={isSubmitting} 
              onCancel={() => navigate('/dashboard/rentals')} 
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateRental;
