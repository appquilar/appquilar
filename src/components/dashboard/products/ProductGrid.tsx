// src/components/dashboard/products/ProductGrid.tsx

import React from "react";
import ProductCard from "@/components/products/ProductCard";
import type { ProductFormData } from "@/domain/models/Product";

type DashboardProduct = ProductFormData & { id: string };

interface ProductGridProps {
    products: DashboardProduct[];
    onEdit?: (productId: string) => void;
    onDelete?: (productId: string, productName: string) => void;
    onAdd?: () => void;
}

const ProductGrid = ({ products, onEdit, onDelete }: ProductGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product as any}
                    onEdit={onEdit ? () => onEdit(product.id) : undefined}
                    onDelete={onDelete ? () => onDelete(product.id, product.name) : undefined}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
