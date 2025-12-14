import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import CategoryHeader from "@/components/category/CategoryHeader";
import CategorySearch from "@/components/category/CategorySearch";
import ProductGrid from "@/components/category/ProductGrid";
import NoProductsFound from "@/components/category/NoProductsFound";
import LoadingState from "@/components/category/LoadingState";

import type { Product } from "@/components/products/ProductCard";
import type { Category } from "@/domain/models/Category";
import { compositionRoot } from "@/compositionRoot";
import { useSeo } from "@/hooks/useSeo";

const CategoryPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]); // TODO: conectar products reales
    const [notFound, setNotFound] = useState(false);

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

    // Fetch category from BE by slug
    useEffect(() => {
        if (!slug) return;

        let alive = true;

        const run = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const c = await compositionRoot.categoryService.getBySlug(slug);

                if (!alive) return;

                setCategory(c);
                setProducts([]); // TODO: cargar productos por categoría
                setNotFound(false);
            } catch {
                if (!alive) return;

                setCategory(null);
                setProducts([]);
                setNotFound(true);
            } finally {
                if (alive) {
                    setLoading(false);
                }
            }
        };

        void run();

        return () => {
            alive = false;
        };
    }, [slug]);

    // Filter products based on search query (cuando haya products reales funcionará igual)
    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return products;

        return products.filter(
            (product) =>
                product.name.toLowerCase().includes(q) ||
                product.description.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
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
            <div className="min-h-screen flex flex-col">
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
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 animate-fade-in">
                <div className="max-w-7xl mx-auto">
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

                    {filteredProducts.length > 0 ? (
                        <ProductGrid products={filteredProducts} />
                    ) : (
                        <NoProductsFound
                            searchQuery={searchQuery}
                            categoryName={category.name}
                        />
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CategoryPage;
