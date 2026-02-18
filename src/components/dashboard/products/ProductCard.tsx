import React, { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ExternalLink, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useMediaUrl } from "@/application/hooks/useMediaUrl";
import { Badge } from "@/components/ui/badge";
import type { Product, PublicationStatusType } from "@/domain/models/Product";

interface ProductCardProps {
    product: Product;
    onEdit?: () => void;
    onPublish?: () => void;
    publicationLimitCtaLabel?: string | null;
    isPublicationLimitReached?: boolean;
    onPublicationLimitCta?: () => void;
    isProcessingPublicationLimitCta?: boolean;
    onDelete?: () => void;
}

const PLACEHOLDER = "/placeholder.svg";
type ProductWithLegacyImages = Product & {
    images?: Array<string | { id?: string | null }>;
};

const ProductCard = ({
    product,
    onEdit,
    onPublish,
    publicationLimitCtaLabel = null,
    isPublicationLimitReached = false,
    onPublicationLimitCta,
    isProcessingPublicationLimitCta = false,
    onDelete,
}: ProductCardProps) => {
    const raw = (product.thumbnailUrl || product.imageUrl || "").trim();

    const firstImageId = useMemo(() => {
        const legacyImages = (product as ProductWithLegacyImages).images ?? [];
        const legacyImageIds = legacyImages
            .map((image) => {
                if (typeof image === "string") {
                    return image;
                }

                return image?.id ?? null;
            })
            .filter((id): id is string => typeof id === "string" && id.length > 0);

        const imageIds = product.image_ids && product.image_ids.length > 0
            ? product.image_ids
            : legacyImageIds;

        return imageIds[0] ?? null;
    }, [product]);

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
    const firstTierPrice = useMemo(() => {
        const tiers = Array.isArray(product.price?.tiers) ? product.price.tiers : [];
        if (tiers.length === 0) return 0;

        const sortedTiers = [...tiers].sort((a, b) => a.daysFrom - b.daysFrom);
        return sortedTiers[0]?.pricePerDay ?? 0;
    }, [product.price?.tiers]);
    const formattedBasePrice = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: firstTierPrice % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(firstTierPrice);
    const formattedDeposit = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: product.price?.deposit && product.price.deposit % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2,
    }).format(product.price?.deposit ?? 0);
    const canPublish = product.publicationStatus === "draft";
    const canArchive = product.publicationStatus !== "archived";
    const isPublishBlockedByPlan = canPublish && isPublicationLimitReached;
    const showPublishButton = canPublish && Boolean(onPublish) && !isPublishBlockedByPlan;
    const showUpgradeButton = canPublish
        && Boolean(onPublicationLimitCta)
        && Boolean(publicationLimitCtaLabel)
        && isPublishBlockedByPlan;
    const showLimitReachedButton = canPublish && isPublishBlockedByPlan && !showUpgradeButton;
    const hasSecondaryActions = showPublishButton || showUpgradeButton || showLimitReachedButton || (canArchive && Boolean(onDelete));

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
                        Desde {formattedBasePrice}€/día
                    </span>
                    {product.price?.deposit != null && (
                        <span>• {formattedDeposit}€ fianza</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description || "Sin descripción"}
                </p>
            </CardContent>

            <CardFooter className="!p-3 bg-muted/20 border-t border-border/50">
                <div className="w-full space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs gap-1.5"
                            onClick={onEdit}
                            disabled={!onEdit}
                            title="Editar producto"
                        >
                            <Edit size={14} />
                            Editar
                        </Button>
                        <Link
                            to={`/product/${product.slug || product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Button variant="default" size="sm" className="h-9 w-full text-xs gap-1.5">
                                Ver producto
                                <ExternalLink size={13} className="opacity-80" />
                            </Button>
                        </Link>
                    </div>

                    {hasSecondaryActions && (
                        <div className={`grid gap-2 ${canPublish && onPublish && canArchive && onDelete ? "grid-cols-2" : "grid-cols-1"}`}>
                            {showPublishButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    onClick={onPublish}
                                    title="Publicar para que el producto sea visible"
                                >
                                    <Rocket size={14} />
                                    Publicar (hacer visible)
                                </Button>
                            )}
                            {showUpgradeButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs gap-1.5 border-[#F19D70]/60 text-[#D9743F] hover:bg-[#F19D70]/10"
                                    onClick={onPublicationLimitCta}
                                    disabled={isProcessingPublicationLimitCta}
                                    title="Has alcanzado el límite de productos activos"
                                >
                                    <Rocket size={14} />
                                    {isProcessingPublicationLimitCta ? "Redirigiendo..." : publicationLimitCtaLabel}
                                </Button>
                            )}
                            {showLimitReachedButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs gap-1.5 border-slate-300 text-slate-500"
                                    disabled
                                    title="Has alcanzado el límite de productos activos para tu plan"
                                >
                                    <Rocket size={14} />
                                    Límite alcanzado
                                </Button>
                            )}
                            {canArchive && onDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={onDelete}
                                    title="Archivar para ocultar este producto del catálogo"
                                >
                                    <Trash size={14} />
                                    Archivar (ocultar)
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;
