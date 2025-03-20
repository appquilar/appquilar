
import React from 'react';

interface NoProductsFoundProps {
  searchQuery: string;
  categoryName: string;
}

const NoProductsFound = ({ searchQuery, categoryName }: NoProductsFoundProps) => {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-lg">
      <h3 className="text-lg font-medium mb-2">No products found</h3>
      <p className="text-muted-foreground">
        {searchQuery 
          ? `No products matching "${searchQuery}" in this category.` 
          : `There are currently no products in the ${categoryName} category.`
        }
      </p>
    </div>
  );
};

export default NoProductsFound;
