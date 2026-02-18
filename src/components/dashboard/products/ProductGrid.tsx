import React from "react";
import { Link } from "react-router-dom";
// FIX: Importar desde el directorio local (Dashboard ProductCard) en lugar del genérico
import ProductCard from "./ProductCard";
import type { Product } from "@/domain/models/Product";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin } from "lucide-react";

interface ProductGridProps {
    products: Product[];
    onEdit?: (productId: string) => void;
    onPublish?: (productId: string) => void;
    publicationLimitCtaLabel?: string | null;
    isPublicationLimitReached?: boolean;
    onPublicationLimitCta?: () => void;
    isProcessingPublicationLimitCta?: boolean;
    onDelete?: (productId: string, productName: string) => void;
    onAdd?: () => void;
    isAddDisabled?: boolean;
    shouldShowMissingAddressMessage?: boolean;
}

const ProductGrid = ({
    products,
    onEdit,
    onPublish,
    publicationLimitCtaLabel = null,
    isPublicationLimitReached = false,
    onPublicationLimitCta,
    isProcessingPublicationLimitCta = false,
    onDelete,
    onAdd,
    isAddDisabled = false,
    shouldShowMissingAddressMessage = false,
}: ProductGridProps) => {
    if (products.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center space-y-4">
                <h3 className="text-lg font-semibold">No hay productos para mostrar</h3>
                <p className="text-sm text-muted-foreground">
                    Prueba a cambiar los filtros o añade un producto nuevo.
                </p>

                {shouldShowMissingAddressMessage && (
                    <Alert variant="warning" className="text-left">
                        <MapPin className="h-4 w-4" />
                        <AlertTitle>Necesitas una dirección para crear productos</AlertTitle>
                        <AlertDescription>
                            Completa tu dirección de perfil para poder crear tu primer producto.{' '}
                            <Link to="/dashboard/config?tab=address" className="underline font-medium">
                                Ir a Configuración de dirección
                            </Link>
                            .
                        </AlertDescription>
                    </Alert>
                )}

                {onAdd && (
                    <div className="pt-2">
                        <Button type="button" onClick={onAdd} disabled={isAddDisabled}>
                            Nuevo
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={onEdit ? () => onEdit(product.id) : undefined}
                    onPublish={onPublish ? () => onPublish(product.id) : undefined}
                    publicationLimitCtaLabel={publicationLimitCtaLabel}
                    isPublicationLimitReached={isPublicationLimitReached}
                    onPublicationLimitCta={onPublicationLimitCta}
                    isProcessingPublicationLimitCta={isProcessingPublicationLimitCta}
                    onDelete={onDelete ? () => onDelete(product.id, product.name) : undefined}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
