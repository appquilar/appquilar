import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Search, Square } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/category/ProductGrid";
import LoadingState from "@/components/category/LoadingState";

import type { Product as DomainProduct } from "@/domain/models/Product";
import type { Category } from "@/domain/models/Category";
import { usePublicProductSearchWithCategories } from "@/application/hooks/usePublicProductSearch";
import { usePublicSiteCategories } from "@/application/hooks/usePublicSiteCategories";
import { useSeo } from "@/hooks/useSeo";

const EMPTY_PRODUCTS: DomainProduct[] = [];
const EMPTY_CATEGORY_IDS: string[] = [];
const DISTANCE_OPTIONS = [
    { value: "any", label: "Cualquier distancia" },
    { value: "5", label: "Dentro de 5 km" },
    { value: "10", label: "Dentro de 10 km" },
    { value: "20", label: "Dentro de 20 km" },
    { value: "50", label: "Dentro de 50 km" },
    { value: "100", label: "Dentro de 100 km" },
] as const;

type CategoryTreeNode = Category & {
    children: CategoryTreeNode[];
};

type CheckboxState = {
    checked: boolean;
    indeterminate: boolean;
};

const getDailyPrice = (product: DomainProduct): number => {
  const tiers = product.price?.tiers ?? [];
  return tiers[0]?.pricePerDay ?? 0;
};

const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
    const byId = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const category of categories) {
        byId.set(category.id, { ...category, children: [] });
    }

    for (const node of byId.values()) {
        if (node.parentId && byId.has(node.parentId)) {
            byId.get(node.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    const sortNodes = (nodes: CategoryTreeNode[]) => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        for (const node of nodes) {
            sortNodes(node.children);
        }
    };

    sortNodes(roots);
    return roots;
};

const getLeafIds = (node: CategoryTreeNode): string[] => {
    if (node.children.length === 0) return [node.id];
    return node.children.flatMap(getLeafIds);
};

const getNodeCheckboxState = (
    node: CategoryTreeNode,
    selectedIds: Set<string>
): CheckboxState => {
    if (node.children.length === 0) {
        return {
            checked: selectedIds.has(node.id),
            indeterminate: false,
        };
    }

    const leafIds = getLeafIds(node);
    const selectedLeaves = leafIds.filter((id) => selectedIds.has(id)).length;
    const allLeavesSelected = selectedLeaves === leafIds.length && leafIds.length > 0;

    return {
        checked: selectedIds.has(node.id) || allLeavesSelected,
        indeterminate: !allLeavesSelected && selectedLeaves > 0,
    };
};

const SearchPage = () => {
    const [params, setParams] = useSearchParams();
    const queryFromUrl = (params.get("q") ?? "").trim();
    const categoriesFromUrl = useMemo(() => {
        const raw = params.get("categories");
        if (!raw) return EMPTY_CATEGORY_IDS;
        return raw
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }, [params]);
    const radiusFromUrl = useMemo(() => {
        const raw = params.get("radius");
        if (!raw) return "any";
        if (DISTANCE_OPTIONS.some((option) => option.value === raw)) return raw;
        return "any";
    }, [params]);
    const latitudeFromUrl = useMemo(() => {
        const raw = params.get("latitude");
        if (!raw) return undefined;
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
    }, [params]);
    const longitudeFromUrl = useMemo(() => {
        const raw = params.get("longitude");
        if (!raw) return undefined;
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
    }, [params]);

    const [inputValue, setInputValue] = useState(queryFromUrl);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(categoriesFromUrl);
    const [selectedRadius, setSelectedRadius] = useState(radiusFromUrl);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const { allCategories } = usePublicSiteCategories();

    useEffect(() => {
        setInputValue(queryFromUrl);
    }, [queryFromUrl]);

    useEffect(() => {
        setSelectedCategoryIds(categoriesFromUrl);
    }, [categoriesFromUrl]);
    useEffect(() => {
        setSelectedRadius(radiusFromUrl);
    }, [radiusFromUrl]);

    const { data, isLoading, isFetching } = usePublicProductSearchWithCategories(
        queryFromUrl,
        categoriesFromUrl,
        {
            latitude: latitudeFromUrl,
            longitude: longitudeFromUrl,
            radiusKm: radiusFromUrl === "any" ? undefined : Number.parseInt(radiusFromUrl, 10),
        }
    );
    const categoryTree = useMemo(() => buildCategoryTree(allCategories), [allCategories]);
    const selectedCategorySet = useMemo(
        () => new Set(selectedCategoryIds),
        [selectedCategoryIds]
    );
    const domainProducts = data?.products ?? EMPTY_PRODUCTS;

    const products = useMemo(() => {
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
                id: product.category?.id ?? "",
                name: product.category?.name ?? "",
                slug: product.category?.slug ?? "",
            },
            rating: product.rating ?? 0,
            reviewCount: product.reviewCount ?? 0,
        }));
    }, [domainProducts]);

    useSeo({
        type: "static",
        title: queryFromUrl
            ? `Buscar "${queryFromUrl}" · Appquilar`
            : "Buscar productos · Appquilar",
        description: "Busca productos en Appquilar.",
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        applyFilters();
    };

    const toggleCategoryTreeNode = (node: CategoryTreeNode) => {
        const state = getNodeCheckboxState(node, selectedCategorySet);
        const leafIds = getLeafIds(node);

        setSelectedCategoryIds((previous) => {
            const next = new Set(previous);
            if (state.checked || state.indeterminate) {
                next.delete(node.id);
                for (const id of leafIds) next.delete(id);
            } else {
                next.add(node.id);
                for (const id of leafIds) next.add(id);
            }
            return Array.from(next);
        });
    };

    const applyFilters = () => {
        void applyFiltersAsync();
    };

    const requestUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
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
                () => reject(new Error("No se pudo obtener tu ubicación.")),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        });
    };

    const applyFiltersAsync = async () => {
        const nextQuery = inputValue.trim();
        const nextCategories = selectedCategoryIds;
        const nextRadius = selectedRadius;
        const nextParams = new URLSearchParams();
        let nextLatitude = latitudeFromUrl;
        let nextLongitude = longitudeFromUrl;

        setLocationError(null);

        if (nextRadius !== "any") {
            if (nextLatitude === undefined || nextLongitude === undefined) {
                try {
                    setIsLocating(true);
                    const location = await requestUserLocation();
                    nextLatitude = location.latitude;
                    nextLongitude = location.longitude;
                } catch (error) {
                    setLocationError(
                        error instanceof Error
                            ? error.message
                            : "No se pudo obtener tu ubicación."
                    );
                    return;
                } finally {
                    setIsLocating(false);
                }
            }
        } else {
            nextLatitude = undefined;
            nextLongitude = undefined;
        }

        if (nextQuery.length > 0) {
            nextParams.set("q", nextQuery);
        }

        if (nextCategories.length > 0) {
            nextParams.set("categories", nextCategories.join(","));
        }

        if (
            nextRadius !== "any" &&
            nextLatitude !== undefined &&
            nextLongitude !== undefined
        ) {
            nextParams.set("radius", nextRadius);
            nextParams.set("latitude", String(nextLatitude));
            nextParams.set("longitude", String(nextLongitude));
        }

        setParams(nextParams);
    };

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />
            <main className="public-main public-section flex-1">
                <div className="public-container grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr] xl:grid-cols-[270px_1fr]">
                    <aside className="h-fit rounded-xl border border-border/70 bg-card p-4 lg:sticky lg:top-36">
                        <button
                            type="button"
                            onClick={applyFilters}
                            disabled={isLocating}
                            className="mb-4 h-9 w-full rounded-lg border border-border bg-transparent text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLocating ? "Obteniendo ubicación..." : "Aplicar filtros"}
                        </button>

                        <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Filtros</h2>
                        <p className="mb-4 text-sm text-muted-foreground">Refina tu búsqueda</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Distancia
                            </label>
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
                        </div>

                        <h3 className="text-sm font-medium mb-2">Categorías</h3>
                        {locationError && (
                            <p className="mb-3 text-xs text-destructive">{locationError}</p>
                        )}

                        <div className="space-y-2 max-h-[45vh] sm:max-h-[60vh] overflow-y-auto pr-1">
                            {categoryTree.map((node) => {
                                const renderNode = (
                                    currentNode: CategoryTreeNode,
                                    depth: number
                                ): JSX.Element => {
                                    const state = getNodeCheckboxState(
                                        currentNode,
                                        selectedCategorySet
                                    );

                                    return (
                                        <div key={currentNode.id}>
                                            <button
                                                type="button"
                                                onClick={() => toggleCategoryTreeNode(currentNode)}
                                                className="w-full flex items-center gap-2 text-left py-1.5 text-sm hover:bg-muted/40 rounded"
                                                style={{ paddingLeft: `${depth * 14}px` }}
                                            >
                                                <span
                                                    className={`h-4 w-4 rounded border flex items-center justify-center ${
                                                        state.checked || state.indeterminate
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border"
                                                    }`}
                                                >
                                                    {state.checked ? (
                                                        <Check size={12} />
                                                    ) : state.indeterminate ? (
                                                        <Square size={8} fill="currentColor" />
                                                    ) : null}
                                                </span>
                                                <span className="truncate">{currentNode.name}</span>
                                            </button>

                                            {currentNode.children.length > 0 && (
                                                <div className="space-y-0.5">
                                                    {currentNode.children.map((child) =>
                                                        renderNode(child, depth + 1)
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                };

                                return renderNode(node, 0);
                            })}
                        </div>
                    </aside>

                    <section className="lg:pl-1">
                        <h1 className="mb-5 text-2xl md:text-3xl font-semibold">Buscar productos</h1>

                        <form onSubmit={handleSubmit} className="mb-6">
                            <div className="relative w-full">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    size={17}
                                />
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Buscar herramientas, equipos o categorías..."
                                    className="h-11 w-full rounded-xl border border-border/80 bg-background pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </form>

                        {isFetching && (
                            <div className="mb-4 text-sm text-muted-foreground">
                                Actualizando resultados...
                            </div>
                        )}

                        {isLoading && !data ? (
                            <LoadingState />
                        ) : products.length > 0 ? (
                            <ProductGrid products={products} />
                        ) : (
                            <div className="rounded-xl bg-muted/30 py-16 text-center">
                                <h3 className="text-lg font-medium mb-2">No hay resultados</h3>
                                <p className="text-muted-foreground">
                                    {queryFromUrl
                                        ? `No encontramos productos para "${queryFromUrl}".`
                                        : "Ahora mismo no hay productos publicados."}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SearchPage;
