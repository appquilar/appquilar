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
import { useSeo } from "@/hooks/useSeo";

// Simplified VM
type ProductPageVm = {
    id: string;
    name: string;
    slug: string;
    description: string;
    isRentable: boolean;
    isForSale: boolean;
    company: { id: string; name: string; slug: string };
    category: { id: string; name: string; slug: string };
    price: { daily: number; deposit?: number; tiers?: any[] };
    imageIds: string[];
    rating: number;
    reviewCount: number;
    publicationStatus?: string;
    location?: {
        name: string;
        coordinates: [number, number];
        circle?: { latitude: number; longitude: number }[];
    };
};

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    // FIX: AuthContext provides 'currentUser', not 'user'
    const { isLoggedIn, currentUser: user } = useAuth();

    const [activeTab, setActiveTab] = useState<"rental" | "secondhand">("rental");
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const query = useProductBySlug(slug ?? null);

    const product: ProductPageVm | null = useMemo(() => {
        const raw: any = query.data;
        if (!raw) return null;

        const imageIds: string[] = Array.isArray(raw.image_ids)
            ? raw.image_ids
            : Array.isArray(raw.images)
                ? raw.images.map((x: any) => x?.id).filter(Boolean)
                : [];

        // Determine location
        let location = {
            name: "Ubicación desconocida",
            coordinates: [-3.7038, 40.4168] as [number, number], // Default Madrid
            circle: undefined as { latitude: number; longitude: number }[] | undefined
        };

        // If logged in and user is the owner, use their location from /me (includes circle)
        if (user && raw.company?.id === user.id && user.location) {
            location = {
                name: user.address?.city || (user.location as any)?.address || "Tu Ubicación",
                coordinates: [user.location?.longitude || 0, user.location?.latitude || 0],
                circle: user.circle
            };
        }
        else if (raw.location) {
            location = {
                name: raw.location.name || "Ubicación del producto",
                coordinates: [raw.location.longitude, raw.location.latitude],
                circle: undefined
            };
        } else {
            location = {
                name: "Campohermoso (Almería)",
                coordinates: [-2.4637, 36.8381],
                circle: undefined
            };
        }

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
                tiers: raw.price?.tiers || []
            },
            imageIds,
            rating: raw.rating || 0,
            reviewCount: raw.reviewCount || 0,
            publicationStatus: raw.publicationStatus,
            location: location
        };
    }, [query.data, user]);

    // SEO Hook
    useSeo({
        title: product ? `Appquilar | ${product.name}` : "Appquilar",
        description: product?.description?.substring(0, 160) || "",
        ogTitle: product?.name,
        ogImage: product?.imageIds?.[0] ? `${import.meta.env.VITE_API_BASE_URL}/api/media/images/${product.imageIds[0]}/MEDIUM` : undefined
    });

    // Handle Tab switching
    useEffect(() => {
        if (product?.isForSale && !product?.isRentable) {
            setActiveTab("secondhand");
        } else {
            setActiveTab("rental");
        }
    }, [product?.isForSale, product?.isRentable]);

    // FIX: Construct image URLs directly to avoid duplicates and improve performance
    const galleryImages = useMemo(() => {
        if (!product?.imageIds?.length) return [];
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return product.imageIds.map(id => `${baseUrl}/api/media/images/${id}/LARGE`);
    }, [product]);

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
                        images={galleryImages}
                        productName={product.name}
                    />

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                        <ProductLocationMap
                            location={product.location?.name || "Ubicación"}
                            coordinates={product.location?.coordinates}
                            polygon={product.location?.circle}
                        />
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