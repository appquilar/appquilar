import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogMediaImage from '@/components/blog/BlogMediaImage';
import { Button } from '@/components/ui/button';
import SafeHtml from '@/components/shared/SafeHtml';
import { usePublicBlogPost } from '@/application/hooks/useBlog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSeo } from '@/hooks/useSeo';
import PublicBreadcrumbs from '@/components/common/PublicBreadcrumbs';
import { PUBLIC_PATHS, buildAbsolutePublicUrl, buildBlogPostPath } from '@/domain/config/publicRoutes';

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
    const canonicalPath = post ? buildBlogPostPath(post.slug) : PUBLIC_PATHS.blog;

    useSeo(
        post
            ? {
                  title: `${post.title} | Blog Appquilar`,
                  description: post.googlePreview?.description || post.excerpt || "Artículo del blog de Appquilar.",
                  canonicalUrl: buildAbsolutePublicUrl(canonicalPath),
                  keywords: post.keywords ?? [],
                  ogType: "article",
                  jsonLd: [
                      {
                          "@context": "https://schema.org",
                          "@type": "Article",
                          headline: post.title,
                          description: post.googlePreview?.description || post.excerpt,
                          datePublished: post.publishedAt,
                          author: {
                              "@type": "Organization",
                              name: "Appquilar",
                          },
                          publisher: {
                              "@type": "Organization",
                              name: "Appquilar",
                              logo: {
                                  "@type": "ImageObject",
                                  url: buildAbsolutePublicUrl("/appquilar-combined-orange.png"),
                              },
                          },
                          mainEntityOfPage: buildAbsolutePublicUrl(canonicalPath),
                      },
                      {
                          "@context": "https://schema.org",
                          "@type": "BreadcrumbList",
                          itemListElement: [
                              { "@type": "ListItem", position: 1, name: "Inicio", item: buildAbsolutePublicUrl("/") },
                              { "@type": "ListItem", position: 2, name: "Blog", item: buildAbsolutePublicUrl(PUBLIC_PATHS.blog) },
                              { "@type": "ListItem", position: 3, name: post.title, item: buildAbsolutePublicUrl(canonicalPath) },
                          ],
                      },
                  ],
              }
            : isLoading
              ? {
                    title: "Artículo del blog | Appquilar",
                    description: "Contenido y guias sobre alquiler, herramientas y marketplace en Appquilar.",
                    canonicalUrl: buildAbsolutePublicUrl(slug ? buildBlogPostPath(slug) : PUBLIC_PATHS.blog),
                }
            : {
                  title: "Artículo no encontrado | Blog Appquilar",
                  description: "El artículo que buscas no existe o ya no está disponible.",
                  canonicalUrl: buildAbsolutePublicUrl(PUBLIC_PATHS.blog),
                  robots: "noindex,follow",
              }
    );

    const publishedLabel = useMemo(() => formatDate(post?.publishedAt ?? null), [post?.publishedAt]);

    if (!slugPath) {
        return <Navigate to={PUBLIC_PATHS.blog} replace />;
    }

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <Link to={PUBLIC_PATHS.blog} className="inline-flex">
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
                                <PublicBreadcrumbs
                                    items={[
                                        { label: "Inicio", to: "/" },
                                        { label: "Blog", to: PUBLIC_PATHS.blog },
                                        { label: post.title },
                                    ]}
                                />
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

                            <SafeHtml
                                html={post.body}
                                className="prose prose-neutral max-w-none"
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
