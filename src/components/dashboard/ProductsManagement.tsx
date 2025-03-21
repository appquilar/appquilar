
import { useState } from 'react';
import { toast } from 'sonner';
import { Product } from '../products/ProductCard';

// Import refactored components
import ProductGrid from './products/ProductGrid';
import SearchToolbar from './products/SearchToolbar';
import ProductEditDialog from './products/ProductEditDialog';

// Productos de ejemplo - vendrían de una API backend en producción
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Taladro Percutor Profesional 20V',
    slug: 'professional-hammer-drill-20v',
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    description: 'Taladro percutor de alta potencia perfecto para trabajos en concreto y mampostería. Incluye batería, cargador y estuche de transporte.',
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
  },
  {
    id: '2',
    name: 'Sierra de Mesa con Soporte',
    slug: 'table-saw-with-stand',
    imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
    description: 'Sierra de mesa portátil con soporte plegable. Ideal para obras y proyectos DIY.',
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
      name: 'Herramientas Eléctricas',
      slug: 'power-tools'
    },
    rating: 4.6,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Set de Herramientas de Jardinería',
    slug: 'landscaping-tool-set',
    imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
    description: 'Conjunto completo de herramientas de jardinería incluyendo rastrillo, pala, podadoras y más.',
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
      name: 'Jardinería',
      slug: 'gardening'
    },
    rating: 4.7,
    reviewCount: 54
  },
  {
    id: '4',
    name: 'Fratás para Concreto 48"',
    slug: 'concrete-bull-float',
    imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2',
    description: 'Fratás para concreto de grado profesional para alisar superficies de concreto recién vertidas.',
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
      name: 'Construcción',
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
  
  // Filtrar productos basado en la búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // En una app real, podríamos llamar a un endpoint de API aquí
  };
  
  const handleAddProduct = () => {
    toast.info("Aquí se abriría el formulario de creación de producto");
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
    
    // Actualizar el producto en el estado
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
      )
    );
    
    // Cerrar el diálogo
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const handleDeleteProduct = (productId: string) => {
    // Eliminar el producto del estado
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    toast.success(`Producto eliminado correctamente`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de alquiler.</p>
        </div>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <SearchToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddProduct={handleAddProduct}
        onSearch={handleSearch}
      />
      
      {/* Cuadrícula de productos */}
      <ProductGrid 
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onAdd={handleAddProduct}
      />
      
      {/* Diálogo de edición de producto */}
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
