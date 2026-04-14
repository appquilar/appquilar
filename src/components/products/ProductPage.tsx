import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductLocationMap from "./ProductLocationMap";
import ContactModal from "./ContactModal";

import { useAuth } from "@/context/AuthContext";
import { useProductBySlug } from "@/application/hooks/useProducts";
import { useProductRentability } from "@/application/hooks/useProductInventory";
import { useSeo } from "@/hooks/useSeo";
import { RentalCostBreakdown } from "@/domain/repositories/ProductRepository";
import { useTrackProductView } from "@/application/hooks/useTrackProductView";
import type { Product } from "@/domain/models/Product";
import PublicBreadcrumbs from "@/components/common/PublicBreadcrumbs";
import {
    PUBLIC_PATHS,
    buildAbsolutePublicUrl,
    buildCategoryPath,
    buildProductPath,
} from "@/domain/config/publicRoutes";

type ProductPageVm = {
    id: string;
    internalId: string;
    name: string;
    slug: string;
    description: string;
    quantity: number;
    isRentalEnabled: boolean;
    inventorySummary: Product["inventorySummary"];
    company: { id: string; name: string; slug: string };
    category: { id: string; name: string; slug: string };
    price: Product["price"];
    imageIds: string[];
    rating: number;
    reviewCount: number;
    publicationStatus: Product["publicationStatus"];
    location?: {
        city: string;
        state: string;
        coordinates?: [number, number];
        circle?: { latitude: number; longitude: number }[];
    };
    providerLocationLabel?: string;
};

const getBaseTierDailyPrice = (
    tiers: Array<{ pricePerDay: number }> | undefined,
    fallback: number
): number => {
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
    const [leadStartDate, setLeadStartDate] = useState("");
    const [leadEndDate, setLeadEndDate] = useState("");
    const [leadCalculation, setLeadCalculation] = useState<RentalCostBreakdown | null>(null);

    const query = useProductBySlug(slug ?? null);

    const product = useMemo<ProductPageVm | null>(() => {
        const raw = query.data;
        if (!raw) {
            return null;
        }

        const ownerAddress = raw.ownerData?.address;
        const ownerGeo = raw.ownerData?.geoLocation;
        const ownerName = [raw.ownerData?.name, raw.ownerData?.lastName]
            .filter((value): value is string => Boolean(value && value.trim().length > 0))
            .join(" ")
            .trim();
        const locationParts = [
            ownerAddress?.city,
            ownerAddress?.state,
            ownerAddress?.country,
        ].filter((value): value is string => Boolean(value && value.trim().length > 0));
        const hasOwnerCoordinates = typeof ownerGeo?.latitude === "number" && typeof ownerGeo?.longitude === "number";

        return {
            id: raw.id,
            internalId: raw.internalId,
            name: raw.name,
            slug: raw.slug,
            description: raw.description,
            quantity: raw.quantity,
            isRentalEnabled: raw.isRentalEnabled,
            inventorySummary: raw.inventorySummary ?? null,
            company: {
                id: raw.ownerData?.ownerId ?? "",
                name: ownerName || "Proveedor",
                slug: raw.ownerData?.slug ?? "",
            },
            category: raw.category,
            price: {
                daily: getBaseTierDailyPrice(raw.price?.tiers, raw.price?.daily ?? 0),
                deposit: raw.price?.deposit,
                tiers: raw.price?.tiers ?? [],
            },
            imageIds: raw.image_ids ?? [],
            rating: raw.rating,
            reviewCount: raw.reviewCount,
            publicationStatus: raw.publicationStatus,
            location: {
                city: ownerAddress?.city || "Ubicación desconocida",
                state: ownerAddress?.state || ownerAddress?.country || "",
                coordinates: hasOwnerCoordinates
                    ? [ownerGeo!.longitude, ownerGeo!.latitude]
                    : undefined,
                circle: raw.circle ?? ownerGeo?.circle,
            },
            providerLocationLabel: locationParts.join(", "),
        };
    }, [query.data]);

    const rentability = useProductRentability(query.data ?? null);

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
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

            setLeadStartDate(toInput(today));
            setLeadEndDate(toInput(tomorrow));
        }
    }, [leadEndDate, leadStartDate, product]);

    const galleryImages = useMemo(() => {
        if (!product?.imageIds?.length) {
            return [];
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        return product.imageIds.map((id) => `${baseUrl}/api/media/images/${id}/LARGE`);
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
        const availability = rentability.isRentableNow
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock";

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
                            availability,
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
    }, [breadcrumbItems, galleryImages, product, query.isError, rentability.isRentableNow]);

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
