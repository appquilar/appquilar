
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRentalForm } from "@/application/hooks/useRentalForm";
import { useProductSelection } from "@/application/hooks/useProductSelection";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import ProductInfoFields from "@/components/dashboard/rentals/form/ProductInfoFields";
import CustomerInfoFields from "@/components/dashboard/rentals/form/CustomerInfoFields";
import RentalDetailsFields from "@/components/dashboard/rentals/form/RentalDetailsFields";
import FormActions from "@/components/dashboard/rentals/form/FormActions";
import { RentalFormValues } from "@/domain/models/RentalForm";
import { Conversation } from "@/core/domain/Message";

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: Conversation;
}

/**
 * Modal component for creating a new rental directly from conversation
 */
const RentalFormModal: React.FC<RentalFormModalProps> = ({
  isOpen,
  onClose,
  conversation
}) => {
  const isMobile = useIsMobile();
  const { form, isSubmitting, onSubmit } = useRentalForm();
  const { 
    productSearch, 
    setProductSearch, 
    selectedProduct,
    filteredProducts, 
    isLoading: isLoadingProducts, 
    handleProductSelect 
  } = useProductSelection(form);

  // Pre-fill product from the selected conversation
  React.useEffect(() => {
    if (form) {
      // If we have a product in the conversation, attempt to select it
      if (conversation?.productId) {
        setProductSearch(conversation.productName || "");
        const matchingProduct = filteredProducts.find(p => p.id === conversation.productId);
        if (matchingProduct) {
          handleProductSelect(matchingProduct);
        }
      }
    }
  }, [form, conversation, filteredProducts, setProductSearch, handleProductSelect]);

  // Handle form submission
  const handleFormSubmit = async (data: RentalFormValues) => {
    await onSubmit(data);
    onClose();
  };

  // Render appropriate modal type based on screen size
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[90%]">
          <DrawerHeader>
            <DrawerTitle>Crear Alquiler</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-16 overflow-y-auto">
            <RentalFormContent 
              form={form}
              isSubmitting={isSubmitting}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              selectedProduct={selectedProduct}
              filteredProducts={filteredProducts}
              isLoadingProducts={isLoadingProducts}
              handleProductSelect={handleProductSelect}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Alquiler</DialogTitle>
        </DialogHeader>
        <RentalFormContent 
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedProduct={selectedProduct}
          filteredProducts={filteredProducts}
          isLoadingProducts={isLoadingProducts}
          handleProductSelect={handleProductSelect}
        />
      </DialogContent>
    </Dialog>
  );
};

// Extracted form content to avoid duplication
interface RentalFormContentProps {
  form: any;
  isSubmitting: boolean;
  onSubmit: (data: RentalFormValues) => Promise<void>;
  onCancel: () => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  selectedProduct: any;
  filteredProducts: any[];
  isLoadingProducts: boolean;
  handleProductSelect: (product: any) => void;
}

const RentalFormContent: React.FC<RentalFormContentProps> = ({
  form,
  isSubmitting,
  onSubmit,
  onCancel,
  productSearch,
  setProductSearch,
  selectedProduct,
  filteredProducts,
  isLoadingProducts,
  handleProductSelect
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <ProductInfoFields
          form={form}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedProduct={selectedProduct}
          filteredProducts={filteredProducts}
          isLoading={isLoadingProducts}
          handleProductSelect={handleProductSelect}
        />

        <Separator className="my-4" />
        
        <CustomerInfoFields />

        <Separator className="my-4" />

        <RentalDetailsFields form={form} />

        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
};

export default RentalFormModal;
