import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";

export interface ProductPrice {
    daily: number; // (en tu UI ahora mismo lo estás mostrando directo)
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
    imageUrl?: string;
    thumbnailUrl?: string;
    description: string;
    price: ProductPrice;
    company: ProductCompany;
    category: ProductCategory;
    rating: number;
    reviewCount: number;
}

interface ProductCardProps {
    product: Product;
    onEdit?: (productId: string) => void;
    onDelete?: (productId: string) => void;
}

const PLACEHOLDER = "/placeholder.svg";

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
    const raw = product.thumbnailUrl || product.imageUrl || "";
    const imgSrc = raw.trim().length > 0 ? raw : PLACEHOLDER;

    return (
        <Card className="overflow-hidden rounded-xl border-border/70 hover:shadow-sm transition-shadow">
            <div className="aspect-[5/4] relative bg-muted">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {product.internalId && (
                    <div className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white">
                        {product.internalId}
                    </div>
                )}
            </div>

            <CardHeader className="px-4 pt-3 pb-1">
                <CardTitle className="text-[15px] font-semibold truncate leading-tight">{product.name}</CardTitle>
            </CardHeader>

            <CardContent className="px-4 py-1">
                <p className="mb-1 text-[12px] text-muted-foreground">
                    {product.category?.name ? `${product.category.name} • ` : ""}
                    {product.price.daily}€/día
                    {product.price.deposit != null ? ` • ${product.price.deposit}€ fianza` : ""}
                </p>
                <p className="text-[13px] leading-snug line-clamp-2">{product.description}</p>
            </CardContent>

            <CardFooter className="px-4 pt-3 pb-4 flex flex-col gap-2">
                <Link to={`/product/${product.slug}`} className="w-full">
                    <Button variant="default" size="sm" className="h-9 gap-1 w-full rounded-lg text-sm">
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
