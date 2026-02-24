import { Link } from 'react-router-dom';
import type { BlogPost } from '@/domain/models/BlogPost';
import BlogMediaImage from '@/components/blog/BlogMediaImage';

interface BlogPublicCardProps {
    post: BlogPost;
}

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

const BlogPublicCard = ({ post }: BlogPublicCardProps) => {
    const coverImageId = post.heroImageId || post.headerImageId;
    const publishedLabel = formatDate(post.publishedAt);

    return (
        <article className="mb-5 break-inside-avoid rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
            <Link to={`/blog/${post.slug}`} className="block">
                <BlogMediaImage
                    mediaId={coverImageId}
                    alt={post.title}
                    className="h-44 rounded-t-xl"
                    size="LARGE"
                    fallbackText="Sin imagen"
                />
            </Link>

            <div className="space-y-2.5 p-4">
                {publishedLabel && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {publishedLabel}
                    </p>
                )}

                {post.category && (
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {post.category.name}
                    </p>
                )}

                <Link to={`/blog/${post.slug}`} className="block">
                    <h2 className="text-lg font-semibold leading-tight hover:text-primary">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-sm text-muted-foreground">{post.excerpt}</p>

                <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                    Leer artículo
                </Link>
            </div>
        </article>
    );
};

export default BlogPublicCard;
