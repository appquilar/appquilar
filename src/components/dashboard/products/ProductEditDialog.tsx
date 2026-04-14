
import { Product } from '@/domain/models/Product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductEditForm from '../ProductEditForm';
import { useAuth } from '@/context/AuthContext';

interface ProductEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  isAddMode?: boolean;
}

const ProductEditDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedProduct, 
  onSave, 
  onCancel,
  isAddMode = false
}: ProductEditDialogProps) => {
  const { currentUser } = useAuth();
  const inventoryOwnerType: 'company' | 'user' = currentUser?.companyContext?.companyId ? 'company' : 'user';

  if (!selectedProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAddMode ? 'Añadir Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
        </DialogHeader>
        
        <ProductEditForm 
          product={selectedProduct}
          onSave={onSave}
          onCancel={onCancel}
          inventoryOwnerType={inventoryOwnerType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
