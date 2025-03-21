
import { useState } from 'react';
import { Edit, Filter, Plus, Search, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '../products/ProductCard';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductEditForm from './ProductEditForm';

// Mock products - would come from backend API in production
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Professional Hammer Drill 20V',
    slug: 'professional-hammer-drill-20v',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    description: 'Heavy-duty hammer drill perfect for concrete and masonry work. Includes battery, charger, and carrying case.',
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
      name: 'Power Tools',
      slug: 'power-tools'
    },
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: '2',
    name: 'Table Saw with Stand',
    slug: 'table-saw-with-stand',
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    description: 'Portable table saw with folding stand. Great for job sites and DIY projects.',
    price: {
      daily: 35,
      weekly: 160,
      monthly: 450
    },
    company: {
      id: '1',
      name: 'Pro Tools Inc.',
      slug: 'pro-tools-inc'
    },
    category: {
      id: '1',
      name: 'Power Tools',
      slug: 'power-tools'
    },
    rating: 4.6,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Landscaping Tool Set',
    slug: 'landscaping-tool-set',
    imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    description: 'Complete set of landscaping tools including rake, shovel, pruners, and more.',
    price: {
      daily: 20,
      weekly: 90,
      monthly: 280
    },
    company: {
      id: '2',
      name: 'Garden Pros',
      slug: 'garden-pros'
    },
    category: {
      id: '3',
      name: 'Gardening',
      slug: 'gardening'
    },
    rating: 4.7,
    reviewCount: 54
  },
  {
    id: '4',
    name: '48" Concrete Bull Float',
    slug: 'concrete-bull-float',
    imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    description: 'Professional grade concrete bull float for smoothing freshly poured concrete surfaces.',
    price: {
      daily: 28,
      weekly: 120,
      monthly: 340
    },
    company: {
      id: '3',
      name: 'Construction Rentals',
      slug: 'construction-rentals'
    },
    category: {
      id: '4',
      name: 'Construction',
      slug: 'construction'
    },
    rating: 4.9,
    reviewCount: 37
  },
];

const ProductsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we might call an API endpoint here
  };
  
  const handleAddProduct = () => {
    toast.info("Product creation form would open here");
  };
  
  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSaveProduct = (updatedProduct: Partial<Product>) => {
    if (!selectedProduct) return;
    
    // Update the product in the state
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
      )
    );
    
    // Close the dialog
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleDeleteProduct = (productId: string) => {
    // Remove the product from the state
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success(`Product deleted successfully`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Products Management</h1>
          <p className="text-muted-foreground">Manage your rental inventory.</p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus size={16} />
          Add New Product
        </Button>
      </div>
      
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </form>
        <Button variant="outline" className="gap-2 sm:w-auto w-full">
          <Filter size={16} />
          Filters
        </Button>
      </div>
      
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-sm transition-shadow">
            <div className="aspect-[4/3] relative">
              <img 
                src={product.thumbnailUrl || product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium truncate">
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-xs text-muted-foreground mb-2">
                {product.category.name} • ${product.price.daily}/day
              </p>
              <p className="text-sm line-clamp-2">{product.description}</p>
            </CardContent>
            <CardFooter className="pt-2 pb-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleEditProduct(product.id)}
              >
                <Edit size={14} />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash size={14} />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search or add a new product.</p>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus size={16} />
            Add New Product
          </Button>
        </div>
      )}
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <ProductEditForm 
              product={selectedProduct}
              onSave={handleSaveProduct}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
