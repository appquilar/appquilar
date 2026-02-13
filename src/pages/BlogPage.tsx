import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { usePublicBlogPosts } from '@/application/hooks/useBlog';
import BlogPublicCard from '@/components/blog/BlogPublicCard';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSeo } from '@/hooks/useSeo';

const BlogPage = () => {
    useScrollToTop();
    useSeo({
        title: 'Blog · Appquilar',
        description: 'Noticias, consejos y novedades sobre alquiler en Appquilar.',
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

    const { data, isLoading, isError } = usePublicBlogPosts({
        page,
        perPage: 10,
    });

    const posts = data?.data ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / 10));

    const title = useMemo(() => {
        if (total === 0) return 'Blog';
        return `Blog (${total})`;
    }, [total]);

    const setPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParams);
        if (nextPage <= 1) {
            params.delete('page');
        } else {
            params.set('page', String(nextPage));
        }

        setSearchParams(params);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-24 sm:px-6 md:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground">
                            Artículos y novedades del marketplace.
                        </p>
                    </div>

                    {isLoading && (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-80 animate-pulse rounded-lg bg-muted" />
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                            No se pudieron cargar los artículos.
                        </div>
                    )}

                    {!isLoading && !isError && posts.length === 0 && (
                        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                            Todavía no hay publicaciones visibles.
                        </div>
                    )}

                    {!isLoading && !isError && posts.length > 0 && (
                        <>
                            <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
                                {posts.map((post) => (
                                    <BlogPublicCard key={post.postId} post={post} />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1}
                                    className="w-full sm:w-auto"
                                >
                                    Anterior
                                </Button>

                                <p className="text-sm text-muted-foreground text-center">
                                    Página {page} de {totalPages}
                                </p>

                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="w-full sm:w-auto"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
