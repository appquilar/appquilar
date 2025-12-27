// src/components/products/ProductCard.tsx

import React, { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { useMediaUrl } from "@/application/hooks/useMediaUrl";

export interface ProductPrice {
    daily: number;
    deposit?: number;
}

export interface ProductCompany {
    id: string;
    name: string;
    slug: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Product {
    id: string;
    internalId?: string;
    name: string;
    slug: string;

    // Puede venir vacío en dashboard (porque se usa media por id)
    imageUrl?: string;
    thumbnailUrl?: string;

    description: string;

    // En dashboard tu list item puede traer "images" como array de ids (image_ids del BE)
    images?: string[];

    price: ProductPrice;
    company?: ProductCompany;
    category?: ProductCategory;

    rating?: number;
    reviewCount?: number;
}

interface ProductCardProps {
    product: Product;
    onEdit?: (productId: string) => void;
    onDelete?: (productId: string) => void;
}

const PLACEHOLDER = "/placeholder.svg";

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
    // 1) intentamos primero thumbnailUrl/imageUrl si existe
    const raw = (product.thumbnailUrl || product.imageUrl || "").trim();

    // 2) si no hay URL, intentamos tirar del primer imageId (media)
    const firstImageId = useMemo(() => {
        const ids = product.images ?? [];
        return ids.length > 0 ? ids[0] : null;
    }, [product.images]);

    const { url: mediaThumbUrl } = useMediaUrl(firstImageId, "THUMBNAIL", { enabled: !raw });

    const imgSrc = raw.length > 0 ? raw : mediaThumbUrl ?? PLACEHOLDER;

    return (
        <Card className="overflow-hidden hover:shadow-sm transition-shadow">
            <div className="aspect-[4/3] relative bg-muted">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {product.internalId && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {product.internalId}
                    </div>
                )}
            </div>

            <CardHeader className="py-3">
                <CardTitle className="text-base font-medium truncate">{product.name}</CardTitle>
            </CardHeader>

            <CardContent className="py-2">
                <p className="text-xs text-muted-foreground mb-2">
                    {product.category?.name ? `${product.category.name} • ` : ""}
                    {product.price?.daily ?? 0}€/día
                    {product.price?.deposit != null ? ` • ${product.price.deposit}€ fianza` : ""}
                </p>
                <p className="text-sm line-clamp-2">{product.description}</p>
            </CardContent>

            <CardFooter className="pt-2 pb-4 flex flex-col gap-2">
                <Link to={`/product/${product.slug}`} className="w-full">
                    <Button variant="default" size="sm" className="gap-1 w-full">
                        Ver producto
                    </Button>
                </Link>

                {(onEdit || onDelete) && (
                    <div className="flex gap-2 w-full">
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 flex-1"
                                onClick={() => onEdit(product.id)}
                            >
                                <Edit size={14} />
                                Editar
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onDelete(product.id)}
                            >
                                <Trash size={14} />
                                Eliminar
                            </Button>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};

export default ProductCard;
