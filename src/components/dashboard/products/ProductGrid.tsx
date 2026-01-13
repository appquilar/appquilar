import React from "react";
// FIX: Importar desde el directorio local (Dashboard ProductCard) en lugar del genérico
import ProductCard from "./ProductCard";
import type { Product } from "@/domain/models/Product";

interface ProductGridProps {
    products: Product[];
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
                    product={product}
                    onEdit={onEdit ? () => onEdit(product.id) : undefined}
                    onDelete={onDelete ? () => onDelete(product.id, product.name) : undefined}
                />
            ))}
        </div>
    );
};

export default ProductGrid;