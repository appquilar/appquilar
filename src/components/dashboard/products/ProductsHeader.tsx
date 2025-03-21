
import React from 'react';

const ProductsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display font-semibold">Gestión de Productos</h1>
        <p className="text-muted-foreground">Gestiona tu inventario de alquiler.</p>
      </div>
    </div>
  );
};

export default ProductsHeader;
