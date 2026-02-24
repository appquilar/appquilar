import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogMediaImage from '@/components/blog/BlogMediaImage';
import { Button } from '@/components/ui/button';
import { usePublicBlogPost } from '@/application/hooks/useBlog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSeo } from '@/hooks/useSeo';

const formatDate = (value: string | null) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(parsed);
};

const BlogPostPage = () => {
    useScrollToTop();

    const { '*': slugPath } = useParams();
    const slug = slugPath ?? '';
    const { data: post, isLoading, isError } = usePublicBlogPost(slug);

    const seoTitle = post?.title ? `${post.title} · Blog Appquilar` : 'Blog · Appquilar';
    const seoDescription = post?.googlePreview?.description || 'Blog de Appquilar';

    useSeo({
        title: seoTitle,
        description: seoDescription,
        keywords: post?.keywords ?? [],
    });

    const publishedLabel = useMemo(() => formatDate(post?.publishedAt ?? null), [post?.publishedAt]);

    if (!slugPath) {
        return <Navigate to="/blog" replace />;
    }

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <Link to="/blog" className="inline-flex">
                        <Button variant="ghost" size="sm">Volver al blog</Button>
                    </Link>

                    {isLoading && (
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-72 animate-pulse rounded-lg bg-muted" />
                            <div className="h-36 animate-pulse rounded bg-muted" />
                        </div>
                    )}

                    {isError && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                            Error al cargar el artículo.
                        </div>
                    )}

                    {!isLoading && !isError && !post && (
                        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                            El artículo no existe o no es público.
                        </div>
                    )}

                    {!isLoading && !isError && post && (
                        <article className="space-y-6">
                            <header className="space-y-3">
                                {publishedLabel && (
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {publishedLabel}
                                    </p>
                                )}
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{post.title}</h1>
                                {post.category && (
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        {post.category.name}
                                    </p>
                                )}
                            </header>

                            <BlogMediaImage
                                mediaId={post.heroImageId || post.headerImageId}
                                alt={post.title}
                                className="h-56 sm:h-80 rounded-lg"
                                size="LARGE"
                                fallbackText=""
                            />

                            <section
                                className="prose prose-neutral max-w-none"
                                dangerouslySetInnerHTML={{ __html: post.body ?? '' }}
                            />
                        </article>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
