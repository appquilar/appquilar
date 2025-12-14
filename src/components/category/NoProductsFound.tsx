
import React from 'react';

interface NoProductsFoundProps {
  searchQuery: string;
  categoryName: string;
}

const NoProductsFound = ({ searchQuery, categoryName }: NoProductsFoundProps) => {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-medium mb-2">No hay productos</h3>
      <p className="text-muted-foreground">
        {searchQuery 
          ? `No hay productos de la categoría "${searchQuery}"`
          : `Ahora mismo no tenemos productos de la categoría ${categoryName}`
        }
      </p>
    </div>
  );
};

export default NoProductsFound;
