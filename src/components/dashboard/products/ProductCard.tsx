import React, { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useMediaUrl } from "@/application/hooks/useMediaUrl";
import { Badge } from "@/components/ui/badge";
import type { Product, PublicationStatusType } from "@/domain/models/Product";

interface ProductCardProps {
    product: Product;
    onEdit?: (productId: string) => void;
    onDelete?: (productId: string) => void;
}

const PLACEHOLDER = "/placeholder.svg";

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
    const raw = (product.thumbnailUrl || product.imageUrl || "").trim();

    const firstImageId = useMemo(() => {
        const ids = product.image_ids || (product as any).images || [];
        return ids.length > 0 ? ids[0] : null;
    }, [product.image_ids, (product as any).images]);

    const { url: mediaThumbUrl } = useMediaUrl(firstImageId, "THUMBNAIL", { enabled: !raw });
    const imgSrc = raw.length > 0 ? raw : mediaThumbUrl ?? PLACEHOLDER;

    const getStatusConfig = (status: PublicationStatusType = 'draft') => {
        const baseClasses = "border backdrop-blur-md shadow-sm font-medium";
        switch (status) {
            case 'published':
                return {
                    label: 'Publicado',
                    className: `${baseClasses} bg-emerald-100/90 text-emerald-700 border-emerald-200/50`
                };
            case 'archived':
                return {
                    label: 'Archivado',
                    className: `${baseClasses} bg-slate-100/90 text-slate-600 border-slate-200/50`
                };
            case 'draft':
            default:
                return {
                    label: 'Borrador',
                    className: `${baseClasses} bg-amber-100/90 text-amber-700 border-amber-200/50`
                };
        }
    };

    const statusConfig = getStatusConfig(product.publicationStatus);

    return (
        <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group border-border/60">
            <div className="aspect-[4/3] relative bg-muted">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute top-2 left-2 z-10">
                    <Badge variant="outline" className={`${statusConfig.className} px-2 py-0.5 text-[11px]`}>
                        {statusConfig.label}
                    </Badge>
                </div>
                {product.internalId && (
                    <div className="absolute top-2 right-2 z-10">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full shadow-sm font-mono">
                            {product.internalId}
                        </span>
                    </div>
                )}
            </div>

            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-semibold truncate leading-tight" title={product.name}>
                    {product.name}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 pb-3">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 flex-wrap">
                    {product.category?.name && (
                        <span className="bg-secondary/50 px-1.5 py-0.5 rounded text-secondary-foreground">
                            {product.category.name}
                        </span>
                    )}
                    <span className="font-medium text-foreground">
                        {product.price?.daily ?? 0}€/día
                    </span>
                    {product.price?.deposit != null && (
                        <span>• {product.price.deposit}€ fianza</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description || "Sin descripción"}
                </p>
            </CardContent>

            <CardFooter className="p-3 bg-muted/20 flex gap-2 border-t border-border/50">
                <Link
                    to={`/product/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                    <Button variant="default" size="sm" className="w-full h-8 text-xs gap-1">
                        Ver
                        <ExternalLink size={12} className="opacity-70" />
                    </Button>
                </Link>

                {(onEdit || onDelete) && (
                    <>
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onEdit(product.id)}
                                title="Editar"
                            >
                                <Edit size={14} />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(product.id)}
                                title="Eliminar"
                            >
                                <Trash size={14} />
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default ProductCard;