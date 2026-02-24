import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import CategoryHeader from "@/components/category/CategoryHeader";
import CategorySearch from "@/components/category/CategorySearch";
import ProductGrid from "@/components/category/ProductGrid";
import NoProductsFound from "@/components/category/NoProductsFound";
import LoadingState from "@/components/category/LoadingState";

import type { Product as DomainProduct } from "@/domain/models/Product";
import { useCategoryWithProductsByText } from "@/application/hooks/useCategoryWithProducts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSeo } from "@/hooks/useSeo";

const EMPTY_DOMAIN_PRODUCTS: DomainProduct[] = [];
const DISTANCE_OPTIONS = [
    { value: "any", label: "Cualquier distancia" },
    { value: "5", label: "Dentro de 5 km" },
    { value: "10", label: "Dentro de 10 km" },
    { value: "20", label: "Dentro de 20 km" },
    { value: "50", label: "Dentro de 50 km" },
    { value: "100", label: "Dentro de 100 km" },
] as const;

const getDailyPrice = (product: DomainProduct): number => {
    const tiers = product.price?.tiers ?? [];
    return tiers[0]?.pricePerDay ?? 0;
};

const CategoryPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRadius, setSelectedRadius] = useState<string>("any");
    const [appliedRadius, setAppliedRadius] = useState<string>("any");
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 500);

    const geoFilters =
        appliedRadius !== "any" && userLocation
            ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  radiusKm: Number.parseInt(appliedRadius, 10),
              }
            : {};

    const { data, isLoading, isFetching } = useCategoryWithProductsByText(
        slug,
        debouncedSearchQuery,
        geoFilters
    );
    const category = data?.category ?? null;
    const domainProducts = data?.products ?? EMPTY_DOMAIN_PRODUCTS;
    const notFound = !isLoading && !category;

    // ✅ SEO: una sola fuente de verdad (prioridad: notFound > category > fallback)
    const seoContext = useMemo(() => {
        if (notFound) {
            return {
                type: "static" as const,
                title: "Categoría no encontrada · Appquilar",
                description: "La categoría que buscas no existe o no está disponible.",
            };
        }

        if (category && slug) {
            return {
                type: "category" as const,
                name: category.name,
                slug,
            };
        }

        return {
            type: "static" as const,
            title: "Categoría · Appquilar",
            description: "Explora productos en alquiler por categoría.",
        };
    }, [notFound, category, slug]);

    useSeo(seoContext);

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const searchProducts = useMemo(() => {
        return domainProducts.map((product) => ({
            id: product.id,
            internalId: product.internalId,
            name: product.name,
            slug: product.slug,
            imageUrl: product.imageUrl,
            thumbnailUrl: product.thumbnailUrl,
            description: product.description ?? "",
            price: {
                daily: getDailyPrice(product),
                deposit: product.price?.deposit,
            },
            company: {
                id: product.ownerData?.ownerId ?? "",
                name: product.ownerData?.name ?? "",
                slug: "",
            },
            category: {
                id: category?.id ?? "",
                name: category?.name ?? "",
                slug: category?.slug ?? "",
            },
            rating: product.rating ?? 0,
            reviewCount: product.reviewCount ?? 0,
        }));
    }, [category?.id, category?.name, category?.slug, domainProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const requestUserLocation = async (): Promise<{
        latitude: number;
        longitude: number;
    }> => {
        if (!("geolocation" in navigator)) {
            throw new Error("El navegador no soporta geolocalización.");
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) =>
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }),
                () =>
                    reject(
                        new Error(
                            "No se pudo obtener tu ubicación para filtrar por distancia."
                        )
                    ),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        });
    };

    const applyFilters = async () => {
        setLocationError(null);

        if (selectedRadius === "any") {
            setAppliedRadius("any");
            return;
        }

        let location = userLocation;

        if (!location) {
            try {
                setIsLocating(true);
                location = await requestUserLocation();
                setUserLocation(location);
            } catch (error) {
                setLocationError(
                    error instanceof Error
                        ? error.message
                        : "No se pudo obtener tu ubicación para filtrar por distancia."
                );
                return;
            } finally {
                setIsLocating(false);
            }
        }

        setAppliedRadius(selectedRadius);
    };

    if (isLoading && !data) {
        return (
            <div className="public-marketplace min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <LoadingState />
                </main>
                <Footer />
            </div>
        );
    }

    if (notFound || !category) {
        return (
            <div className="public-marketplace min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-medium mb-4">Category not found</h1>
                    <p className="text-muted-foreground">
                        The category you're looking for doesn't exist.
                    </p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />
            <main className="public-main public-section flex-1 animate-fade-in">
                <div className="public-container grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr] xl:grid-cols-[270px_1fr]">
                    <aside className="h-fit rounded-xl border border-border/70 bg-card p-4 lg:sticky lg:top-36">
                        <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Filtros</h2>
                        <p className="mb-4 text-sm text-muted-foreground">Refina tu búsqueda</p>

                        <button
                            type="button"
                            onClick={() => void applyFilters()}
                            disabled={isLocating}
                            className="mb-4 h-9 w-full rounded-lg border border-border bg-transparent text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLocating ? "Obteniendo ubicación..." : "Aplicar filtros"}
                        </button>

                        <label className="block text-sm font-medium mb-1">Distancia</label>
                        <select
                            value={selectedRadius}
                            onChange={(event) => setSelectedRadius(event.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {DISTANCE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {isLocating && (
                            <div className="mt-3 text-sm text-muted-foreground">
                                Obteniendo ubicación para filtrar distancia...
                            </div>
                        )}

                        {locationError && (
                            <div className="mt-3 text-sm text-destructive">{locationError}</div>
                        )}
                    </aside>

                    <section className="lg:pl-1">
                        <CategoryHeader
                            name={category.name}
                            description={category.description ?? ""}
                        />

                        <CategorySearch
                            searchQuery={searchQuery}
                            categoryName={category.name}
                            onSearchChange={setSearchQuery}
                            onSearch={handleSearch}
                        />

                        {isFetching && (
                            <div className="mb-4 text-sm text-muted-foreground">
                                Actualizando resultados...
                            </div>
                        )}

                        {searchProducts.length > 0 ? (
                            <ProductGrid products={searchProducts} />
                        ) : (
                            <NoProductsFound
                                searchQuery={searchQuery}
                                categoryName={category.name}
                            />
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CategoryPage;
