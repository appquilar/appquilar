import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import SecondHandInfo from "./SecondHandInfo";
import ProductLocationMap from "./ProductLocationMap";
import ContactModal from "./ContactModal";

import { useAuth } from "@/context/AuthContext";
import { useProductBySlug } from "@/application/hooks/useProducts";
import { useSeo } from "@/hooks/useSeo";
import { RentalCostBreakdown } from "@/domain/repositories/ProductRepository";

// ViewModel simplificado para la vista
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
        city: string;
        state: string;
        coordinates?: [number, number];
        circle?: { latitude: number; longitude: number }[];
    };
    providerLocationLabel?: string;
};

const getBaseTierDailyPrice = (tiers: Array<{ pricePerDay?: number }> | undefined, fallback: number): number => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return fallback;
    }

    const firstTierPrice = Number(tiers[0]?.pricePerDay ?? 0);
    return Number.isFinite(firstTierPrice) ? firstTierPrice : fallback;
};

const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const { isLoggedIn } = useAuth();

    const [activeTab, setActiveTab] = useState<"rental" | "secondhand">("rental");
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [leadStartDate, setLeadStartDate] = useState('');
    const [leadEndDate, setLeadEndDate] = useState('');
    const [leadCalculation, setLeadCalculation] = useState<RentalCostBreakdown | null>(null);

    const query = useProductBySlug(slug ?? null);

    const product: ProductPageVm | null = useMemo(() => {
        const raw: any = query.data;
        if (!raw) return null;

        const imageIds: string[] = Array.isArray(raw.image_ids)
            ? raw.image_ids
            : Array.isArray(raw.imageIds)
                ? raw.imageIds
                : Array.isArray(raw.images)
                    ? raw.images.map((x: any) => x?.id).filter(Boolean)
                    : [];

        const ownerAddress = raw.ownerData?.address;
        const ownerGeo = raw.ownerData?.geoLocation;
        const ownerName = [raw.ownerData?.name, raw.ownerData?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
        const ownerCircle = Array.isArray(ownerGeo?.circle) ? ownerGeo.circle : undefined;
        const hasOwnerCoordinates =
            typeof ownerGeo?.latitude === "number" &&
            typeof ownerGeo?.longitude === "number";
        const locationParts = [
            ownerAddress?.city,
            ownerAddress?.state,
            ownerAddress?.country,
        ].filter(Boolean);

        const location = {
            city: ownerAddress?.city || "Ubicación desconocida",
            state: ownerAddress?.state || ownerAddress?.country || "",
            coordinates: hasOwnerCoordinates
                ? ([ownerGeo.longitude, ownerGeo.latitude] as [number, number])
                : undefined,
            circle: ownerCircle,
        };

        return {
            id: raw.id ?? "",
            name: raw.name ?? "",
            slug: raw.slug ?? "",
            description: raw.description ?? "",
            isRentable: raw.isRentable ?? true,
            isForSale: raw.isForSale ?? false,
            company: {
                id: raw.ownerData?.ownerId ?? raw.companyId ?? "",
                name: ownerName || raw.companyName || "—",
                slug: raw.ownerData?.slug ?? raw.companySlug ?? "",
            },
            category: raw.category ?? { id: raw.categoryId ?? "", name: raw.categoryName ?? "—", slug: raw.categorySlug ?? "" },
            price: {
                daily: getBaseTierDailyPrice(raw.price?.tiers, raw.price?.daily ?? 0),
                deposit: raw.price?.deposit,
                tiers: raw.price?.tiers || []
            },
            imageIds,
            rating: raw.rating || 0,
            reviewCount: raw.reviewCount || 0,
            publicationStatus: raw.publication_status?.status || raw.publicationStatus || 'draft',
            location: location,
            providerLocationLabel: locationParts.join(", "),
        };
    }, [query.data]); // Eliminada dependencia de currentUser para el cálculo del producto

    // SEO Hook - Objeto seguro para evitar crashes
    useSeo(
        product
            ? { type: "product", name: product.name, slug: product.slug }
            : { type: "home" }
    );

    useEffect(() => {
        if (product?.isForSale && !product?.isRentable) {
            setActiveTab("secondhand");
        } else {
            setActiveTab("rental");
        }
    }, [product?.isForSale, product?.isRentable]);

    useEffect(() => {
        if (!product) {
            return;
        }

        if (!leadStartDate || !leadEndDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const toInput = (date: Date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };
            setLeadStartDate(toInput(today));
            setLeadEndDate(toInput(tomorrow));
        }
    }, [product, leadStartDate, leadEndDate]);

    // Construir URLs de imágenes
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
                            city={product.location?.city || "Ubicación desconocida"}
                            state={product.location?.state || ""}
                            coordinates={product.location?.coordinates}
                            polygon={product.location?.circle}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <ProductInfo
                        product={product as any}
                        onContact={handleContactRequest}
                        isLoggedIn={isLoggedIn}
                        leadStartDate={leadStartDate}
                        leadEndDate={leadEndDate}
                        onLeadStartDateChange={setLeadStartDate}
                        onLeadEndDateChange={setLeadEndDate}
                        onLeadCalculationChange={setLeadCalculation}
                    />

                    {product.isForSale && (
                        <SecondHandInfo product={product as any} onContactClick={handleContactRequest} />
                    )}
                </div>
            </div>

            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                productId={product.id}
                productName={product.name}
                ownerName={product.company.name}
                initialStartDate={leadStartDate}
                initialEndDate={leadEndDate}
                initialCalculation={leadCalculation}
            />
        </div>
    );
};

export default ProductPage;
