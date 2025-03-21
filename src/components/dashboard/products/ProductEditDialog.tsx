
import { Product } from '@/components/products/ProductCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductEditForm from '../ProductEditForm';

interface ProductEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductEditDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedProduct, 
  onSave, 
  onCancel 
}: ProductEditDialogProps) => {
  if (!selectedProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        
        <ProductEditForm 
          product={selectedProduct}
          onSave={onSave}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
