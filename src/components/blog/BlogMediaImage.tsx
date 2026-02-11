import { useMediaUrl } from '@/application/hooks/useMediaUrl';
import type { ImageSize } from '@/domain/repositories/MediaRepository';
import { cn } from '@/lib/utils';

interface BlogMediaImageProps {
    mediaId?: string | null;
    alt: string;
    className?: string;
    imageClassName?: string;
    size?: ImageSize;
    fallbackText?: string;
}

const BlogMediaImage = ({
    mediaId,
    alt,
    className,
    imageClassName,
    size = 'MEDIUM',
    fallbackText = 'Sin imagen',
}: BlogMediaImageProps) => {
    const { url } = useMediaUrl(mediaId, size, { enabled: Boolean(mediaId) });

    if (!url) {
        return (
            <div className={cn('bg-muted flex items-center justify-center text-sm text-muted-foreground', className)}>
                {fallbackText}
            </div>
        );
    }

    return (
        <div className={cn('overflow-hidden', className)}>
            <img
                src={url}
                alt={alt}
                className={cn('h-full w-full object-cover', imageClassName)}
                loading="lazy"
            />
        </div>
    );
};

export default BlogMediaImage;
