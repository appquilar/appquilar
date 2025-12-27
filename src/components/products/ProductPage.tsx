// src/components/products/ProductPage.tsx  (ajusta ruta si está en otra carpeta)

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import CompanyInfo from "./CompanyInfo";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import SecondHandInfo from "./SecondHandInfo";
import ProductLocationMap from "./ProductLocationMap";
import ContactModal from "./ContactModal";

import { useAuth } from "@/context/AuthContext";
import { useProductBySlug } from "@/application/hooks/useProducts";
import { mediaService } from "@/compositionRoot";

// ⚠️ Tu ProductPage estaba tipado con Product (modelo viejo).
// Para no pelear con los 2 Product distintos que tienes en el repo,
// aquí creamos un VM mínimo que tu UI necesita.
type ProductPageVm = {
    id: string;
    name: string;
    slug: string;
    description: string;
    isRentable: boolean;
    isForSale: boolean;
    company: { id: string; name: string; slug: string };
    category: { id: string; name: string; slug: string };
    price: { daily: number; deposit?: number };
    imageIds: string[];
};

function useFirstProductImageUrl(imageIds: string[], size: "THUMBNAIL" | "MEDIUM" | "LARGE" | "ORIGINAL" = "LARGE") {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const first = imageIds?.[0];
        if (!first) {
            setUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            return;
        }

        let isActive = true;
        let nextObjectUrl: string | null = null;

        const run = async () => {
            try {
                const blob = await mediaService.getImage(first, size);
                nextObjectUrl = URL.createObjectURL(blob);

                if (!isActive) {
                    URL.revokeObjectURL(nextObjectUrl);
                    nextObjectUrl = null;
                    return;
                }

                setUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return nextObjectUrl;
                });
            } catch (e) {
                console.error(e);
                setUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                });
            }
        };

        void run();

        return () => {
            isActive = false;
            if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
        };
    }, [imageIds, size]);

    return url;
}

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { isLoggedIn } = useAuth();

    const [activeTab, setActiveTab] = useState<"rental" | "secondhand">("rental");
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const query = useProductBySlug(slug ?? null);

    // Mapeo defensivo a VM (para evitar el choque de tipos Product vs ProductFormData)
    const product: ProductPageVm | null = useMemo(() => {
        const raw: any = query.data;
        if (!raw) return null;

        // Si `getBySlug` te devuelve ProductFormData:
        // - companyId / categoryId están pero no name/slug => aquí los pondrías cuando los tengas en BE.
        // Si `getBySlug` ya devuelve un Product "rico", esto también funciona.
        const imageIds: string[] = Array.isArray(raw.image_ids)
            ? raw.image_ids
            : Array.isArray(raw.imageIds)
                ? raw.imageIds
                : Array.isArray(raw.images)
                    ? raw.images.map((x: any) => x?.id).filter(Boolean)
                    : [];

        return {
            id: raw.id ?? "",
            name: raw.name ?? "",
            slug: raw.slug ?? "",
            description: raw.description ?? "",
            isRentable: raw.isRentable ?? true,
            isForSale: raw.isForSale ?? false,
            company: raw.company ?? { id: raw.companyId ?? "", name: raw.companyName ?? "—", slug: raw.companySlug ?? "" },
            category: raw.category ?? { id: raw.categoryId ?? "", name: raw.categoryName ?? "—", slug: raw.categorySlug ?? "" },
            price: {
                daily: raw.price?.daily ?? 0,
                deposit: raw.price?.deposit,
            },
            imageIds,
        };
    }, [query.data]);

    const heroImageUrl = useFirstProductImageUrl(product?.imageIds ?? [], "LARGE");
    const thumbImageUrl = useFirstProductImageUrl(product?.imageIds ?? [], "THUMBNAIL");

    useEffect(() => {
        if (product?.isForSale && !product?.isRentable) {
            setActiveTab("secondhand");
        } else {
            setActiveTab("rental");
        }
    }, [product?.isForSale, product?.isRentable]);

    const handleContactRequest = () => {
        if (!isLoggedIn) {
            toast.error("Debes iniciar sesión para contactar con el propietario");
            return;
        }
        setContactModalOpen(true);
    };

    if (query.isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            </div>
        );
    }

    if (query.isError || !product) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <p>Lo sentimos, el producto que estás buscando no existe o ha sido eliminado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-24 pb-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ProductImageGallery
                        images={[heroImageUrl, thumbImageUrl].filter(Boolean) as string[]}
                        productName={product.name}
                    />

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                        <p className="text-muted-foreground">{product.description}</p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                        <ProductLocationMap location="Campohermoso (Almería)" coordinates={[-2.4637, 36.8381]} />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <ProductInfo product={product as any} onContact={handleContactRequest} isLoggedIn={isLoggedIn} />

                    {product.isForSale && (
                        <SecondHandInfo product={product as any} onContactClick={handleContactRequest} />
                    )}
                </div>
            </div>

            <div className="mt-12">
                <CompanyInfo company={product.company} onContact={handleContactRequest} isLoggedIn={isLoggedIn} />
            </div>

            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                productName={product.name}
                ownerName={product.company.name}
            />
        </div>
    );
};

export default ProductPage;
