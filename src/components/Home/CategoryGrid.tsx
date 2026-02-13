import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { usePublicSiteCategories } from "@/application/hooks/usePublicSiteCategories";
import { compositionRoot } from "@/compositionRoot";

interface FeaturedCategoryVM {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    count?: number;
}

const FALLBACK: FeaturedCategoryVM[] = [
    {
        id: '1',
        name: 'Eléctricas',
        slug: 'power-tools',
        imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
        count: 42,
    },
    {
        id: '2',
        name: 'Manuales',
        slug: 'hand-tools',
        imageUrl: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302',
        count: 38,
    },
    {
        id: '3',
        name: 'Jardín',
        slug: 'gardening',
        imageUrl: 'https://images.unsplash.com/photo-1469041797191-50ace28483c3',
        count: 24,
    },
];

/**
 * Componente de cuadrícula de categorías para la página de inicio
 */
const CategoryGrid = () => {
    const { featuredCategories, isLoading } = usePublicSiteCategories();
    const [imageUrlsById, setImageUrlsById] = useState<Record<string, string>>({});

    const featuredVM = useMemo<FeaturedCategoryVM[]>(() => {
        if (!isLoading && featuredCategories.length > 0) {
            return featuredCategories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                imageUrl: imageUrlsById[c.id] ?? "", // se rellena tras descargar
            }));
        }

        return FALLBACK;
    }, [featuredCategories, imageUrlsById, isLoading]);

    // descargar imágenes (featuredImageId o landscapeImageId)
    useEffect(() => {
        let alive = true;

        const loadImages = async () => {
            if (isLoading) return;
            if (featuredCategories.length === 0) return;

            const candidates = featuredCategories
                .map((c) => ({
                    id: c.id,
                    mediaId: c.featuredImageId ?? c.landscapeImageId ?? null,
                }))
                .filter((x) => !!x.mediaId) as Array<{ id: string; mediaId: string }>;

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

                setImageUrlsById((prev) => {
                    const next = { ...prev };
                    for (const [id, url] of entries) next[id] = url;
                    return next;
                });
            } catch {
                // si falla, dejamos fallback visual (o quedará vacío)
            }
        };

        void loadImages();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [featuredCategories, isLoading]);

    // cleanup URLs
    useEffect(() => {
        return () => {
            Object.values(imageUrlsById).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imageUrlsById]);

    // Precarga (cuando ya tengas urls)
    useEffect(() => {
        featuredVM.forEach((category) => {
            if (!category.imageUrl) return;
            const img = new Image();
            img.src = category.imageUrl;
        });
    }, [featuredVM]);

    return (
        <section className="py-16 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                        Categorías destacadas
                    </div>
                    <h2 className="mt-4 text-3xl font-display font-semibold tracking-tight">
                        Explora por categorías
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Encuentra rápido lo que necesitas según el tipo de producto.
                    </p>
                </div>

                <div className="mt-5 flex justify-center">
                    <Link
                        to="/categories"
                        className="inline-flex items-center rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        Ver todas las categorías
                    </Link>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredVM.map((category, index) => (
                        <Link
                            key={category.id}
                            to={`/category/${category.slug}`}
                            className="group relative overflow-hidden rounded-xl aspect-[4/3] transition-all duration-350 hover-glow"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Imagen de categoría */}
                            <div className="absolute inset-0 bg-muted">
                                {category.imageUrl ? (
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-450 ease-spring group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted animate-pulse" />
                                )}
                            </div>

                            {/* Superposición de gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 transition-opacity duration-350 group-hover:opacity-90"></div>

                            {/* Contenido */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h3 className="text-xl font-medium text-white font-display">{category.name}</h3>
                                {typeof category.count === "number" ? (
                                    <p className="text-sm text-white/80 mt-1">{category.count} items</p>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
