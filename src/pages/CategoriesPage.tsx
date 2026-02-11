import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePublicSiteCategories } from "@/application/hooks/usePublicSiteCategories";
import { compositionRoot } from "@/compositionRoot";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useSeo } from "@/hooks/useSeo";

const CategoriesPage = () => {
    useScrollToTop();
    useSeo({
        type: "static",
        title: "Categorías · Appquilar",
        description: "Explora todas las categorías disponibles en Appquilar.",
    });

    const { allCategories, isLoading } = usePublicSiteCategories();
    const [imageUrlsById, setImageUrlsById] = useState<Record<string, string>>({});

    const categories = useMemo(() => {
        return [...allCategories].sort((a, b) => a.name.localeCompare(b.name));
    }, [allCategories]);

    useEffect(() => {
        let alive = true;

        const loadImages = async () => {
            if (isLoading || categories.length === 0) return;

            const candidates = categories
                .map((category) => ({
                    id: category.id,
                    mediaId: category.featuredImageId ?? category.landscapeImageId ?? null,
                }))
                .filter((item) => !!item.mediaId) as Array<{ id: string; mediaId: string }>;

            const missing = candidates.filter(({ id }) => !imageUrlsById[id]);
            if (missing.length === 0) return;

            try {
                const entries = await Promise.all(
                    missing.map(async ({ id, mediaId }) => {
                        const blob = await compositionRoot.mediaService.getImage(mediaId, "ORIGINAL");
                        const url = URL.createObjectURL(blob);
                        return [id, url] as const;
                    })
                );

                if (!alive) return;

                setImageUrlsById((previous) => {
                    const next = { ...previous };
                    for (const [id, url] of entries) {
                        next[id] = url;
                    }
                    return next;
                });
            } catch {
                // Keep visual fallback when image loading fails.
            }
        };

        void loadImages();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories, isLoading]);

    useEffect(() => {
        return () => {
            Object.values(imageUrlsById).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imageUrlsById]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-semibold tracking-tight">
                            Todas las categorías
                        </h1>
                    </div>

                    {isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Cargando categorías...
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((category, index) => (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.slug}`}
                                    className="group relative overflow-hidden rounded-xl aspect-[4/3] border border-border/60 bg-muted hover:border-primary/30 transition-all duration-300"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    <div className="absolute inset-0">
                                        {imageUrlsById[category.id] ? (
                                            <img
                                                src={imageUrlsById[category.id]}
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted animate-pulse" />
                                        )}
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <h2 className="text-xl font-medium text-white font-display">
                                            {category.name}
                                        </h2>
                                        {category.description ? (
                                            <p className="text-sm text-white/80 mt-1 line-clamp-2">
                                                {category.description}
                                            </p>
                                        ) : null}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No hay categorías disponibles.
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CategoriesPage;
