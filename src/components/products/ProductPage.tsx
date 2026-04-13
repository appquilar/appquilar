import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductLocationMap from "./ProductLocationMap";
import ContactModal from "./ContactModal";

import { useAuth } from "@/context/AuthContext";
import { useProductBySlug } from "@/application/hooks/useProducts";
import { useSeo } from "@/hooks/useSeo";
import { RentalCostBreakdown } from "@/domain/repositories/ProductRepository";
import { useTrackProductView } from "@/application/hooks/useTrackProductView";
import PublicBreadcrumbs from "@/components/common/PublicBreadcrumbs";
import {
    PUBLIC_PATHS,
    buildAbsolutePublicUrl,
    buildCategoryPath,
    buildProductPath,
} from "@/domain/config/publicRoutes";

// ViewModel simplificado para la vista
type ProductPageVm = {
    id: string;
    internalId?: string;
    name: string;
    slug: string;
    description: string;
    company: { id: string; name: string; slug: string };
    category: { id: string; name: string; slug: string };
    price: { daily: number; deposit?: number; tiers?: Array<{ daysFrom: number; daysTo?: number; pricePerDay: number }> };
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

type RawProductImage = {
    id?: string | null;
};

type RawProductOwnerAddress = {
    city?: string | null;
    state?: string | null;
    country?: string | null;
};

type RawProductOwnerGeoLocation = {
    latitude?: number | null;
    longitude?: number | null;
    circle?: Array<{ latitude: number; longitude: number }> | null;
};

type RawProductOwner = {
    ownerId?: string | null;
    name?: string | null;
    lastName?: string | null;
    slug?: string | null;
    address?: RawProductOwnerAddress | null;
    geoLocation?: RawProductOwnerGeoLocation | null;
};

type RawProductCategory = {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
};

type RawProductPriceTier = {
    daysFrom: number;
    daysTo?: number;
    pricePerDay?: number;
};

type RawProductPrice = {
    daily?: number;
    deposit?: number;
    tiers?: RawProductPriceTier[];
};

type RawProductPublicationStatus = {
    status?: string | null;
};

type RawProductData = {
    id?: string | null;
    internalId?: string | null;
    internal_id?: string | null;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    ownerData?: RawProductOwner | null;
    companyId?: string | null;
    companyName?: string | null;
    companySlug?: string | null;
    category?: RawProductCategory | null;
    categoryId?: string | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    price?: RawProductPrice | null;
    image_ids?: string[] | null;
    imageIds?: string[] | null;
    images?: RawProductImage[] | null;
    rating?: number | null;
    reviewCount?: number | null;
    publication_status?: RawProductPublicationStatus | null;
    publicationStatus?: string | null;
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

    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [leadStartDate, setLeadStartDate] = useState('');
    const [leadEndDate, setLeadEndDate] = useState('');
    const [leadCalculation, setLeadCalculation] = useState<RentalCostBreakdown | null>(null);

    const query = useProductBySlug(slug ?? null);

    const product: ProductPageVm | null = useMemo(() => {
        const raw = query.data as RawProductData | null;
        if (!raw) return null;

        const imageIds: string[] = Array.isArray(raw.image_ids)
            ? raw.image_ids
            : Array.isArray(raw.imageIds)
                ? raw.imageIds
                : Array.isArray(raw.images)
                    ? raw.images
                        .map((image) => image?.id)
                        .filter((imageId): imageId is string => typeof imageId === "string" && imageId.length > 0)
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
            internalId: raw.internalId ?? raw.internal_id ?? "",
            name: raw.name ?? "",
            slug: raw.slug ?? "",
            description: raw.description ?? "",
            company: {
                id: raw.ownerData?.ownerId ?? raw.companyId ?? "",
                name: ownerName || raw.companyName || "—",
                slug: raw.ownerData?.slug ?? raw.companySlug ?? "",
            },
            category: {
                id: raw.category?.id ?? raw.categoryId ?? "",
                name: raw.category?.name ?? raw.categoryName ?? "—",
                slug: raw.category?.slug ?? raw.categorySlug ?? "",
            },
            price: {
                daily: getBaseTierDailyPrice(raw.price?.tiers, raw.price?.daily ?? 0),
                deposit: raw.price?.deposit,
                tiers: Array.isArray(raw.price?.tiers)
                    ? raw.price.tiers.map((tier) => ({
                        daysFrom: tier.daysFrom,
                        daysTo: tier.daysTo,
                        pricePerDay: tier.pricePerDay ?? 0,
                    }))
                    : []
            },
            imageIds,
            rating: raw.rating || 0,
            reviewCount: raw.reviewCount || 0,
            publicationStatus: raw.publication_status?.status || raw.publicationStatus || 'draft',
            location: location,
            providerLocationLabel: locationParts.join(", "),
        };
    }, [query.data]); // Eliminada dependencia de currentUser para el cálculo del producto

    useTrackProductView(product?.id ?? null);

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

    const breadcrumbItems = useMemo(() => {
        const items: Array<{ label: string; to?: string }> = [{ label: "Inicio", to: "/" }];

        if (product?.category?.name) {
            items.push({ label: "Categorías", to: PUBLIC_PATHS.categories });
            items.push({
                label: product.category.name,
                to: product.category.slug ? buildCategoryPath(product.category.slug) : undefined,
            });
        }

        if (product?.name) {
            items.push({ label: product.name });
        }

        return items;
    }, [product]);

    const seoConfig = useMemo(() => {
        if (query.isError || !product) {
            return {
                title: "Producto no encontrado | Appquilar",
                description: "El producto que buscas no existe o ya no está disponible.",
                canonicalUrl: buildAbsolutePublicUrl(product?.slug ? buildProductPath(product.slug) : "/"),
                robots: "noindex,follow" as const,
            };
        }

        const canonicalPath = buildProductPath(product.slug);
        const dailyPrice = product.price.daily > 0 ? `${product.price.daily} EUR al dia` : "precio a consultar";
        const description = product.providerLocationLabel
            ? `${product.name} disponible en alquiler en ${product.providerLocationLabel}. ${dailyPrice}.`
            : `${product.name} disponible en alquiler en Appquilar. ${dailyPrice}.`;

        return {
            title: `${product.name} | Appquilar`,
            description,
            canonicalUrl: buildAbsolutePublicUrl(canonicalPath),
            ogType: "product",
            jsonLd: [
                {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: breadcrumbItems.map((item, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: item.label,
                        item: buildAbsolutePublicUrl(item.to ?? canonicalPath),
                    })),
                },
                {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: product.name,
                    description,
                    category: product.category?.name,
                    sku: product.internalId || product.id,
                    image: galleryImages,
                    offers: product.price.daily > 0
                        ? {
                              "@type": "Offer",
                              priceCurrency: "EUR",
                              price: product.price.daily,
                              availability: "https://schema.org/InStock",
                              url: buildAbsolutePublicUrl(canonicalPath),
                          }
                        : undefined,
                    brand: product.company?.name
                        ? {
                              "@type": "Brand",
                              name: product.company.name,
                          }
                        : undefined,
                },
            ],
        };
    }, [breadcrumbItems, galleryImages, product, query.isError]);

    useSeo(seoConfig);

    const handleContactRequest = () => {
        if (!isLoggedIn) {
            toast.error("Debes iniciar sesión para contactar con el propietario");
            return;
        }
        setContactModalOpen(true);
    };

    if (query.isLoading) {
        return (
            <div className="public-main public-section">
                <div className="public-container py-2">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
                </div>
            </div>
        );
    }

    if (query.isError || !product) {
        return (
            <div className="public-main public-section">
                <div className="public-container py-2">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                    <p>Lo sentimos, el producto que estás buscando no existe o ha sido eliminado.</p>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="public-main px-4 pb-10 sm:px-6 md:px-8">
            <div className="public-container grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
                <div className="lg:col-span-3">
                    <PublicBreadcrumbs items={breadcrumbItems} className="mb-2" />
                </div>
                <div className="lg:col-span-2">
                    <ProductImageGallery
                        images={galleryImages}
                        productName={product.name}
                    />

                    <div className="mt-6">
                        <h2 className="mb-3 text-lg font-semibold">Detalles</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                    </div>

                    <div className="mt-6">
                        <h2 className="mb-3 text-lg font-semibold">Ubicación</h2>
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
                        product={product}
                        onContact={handleContactRequest}
                        isLoggedIn={isLoggedIn}
                        leadStartDate={leadStartDate}
                        leadEndDate={leadEndDate}
                        onLeadStartDateChange={setLeadStartDate}
                        onLeadEndDateChange={setLeadEndDate}
                        onLeadCalculationChange={setLeadCalculation}
                    />

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
