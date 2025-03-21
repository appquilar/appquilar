import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '../products/ProductCard';

// Import refactored components
import ProductGrid from './products/ProductGrid';
import SearchToolbar from './products/SearchToolbar';
import ProductEditDialog from './products/ProductEditDialog';

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
      </div>
      
      {/* Search and filter toolbar */}
      <SearchToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddProduct={handleAddProduct}
        onSearch={handleSearch}
      />
      
      {/* Products grid */}
      <ProductGrid 
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAdd={handleAddProduct}
      />
      
      {/* Edit Product Dialog */}
      <ProductEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedProduct={selectedProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default ProductsManagement;
