import { useEffect, useState } from "react";
import { mediaService } from "@/compositionRoot";
import type { ImageSize } from "@/domain/repositories/MediaRepository";

/**
 * Descarga una imagen por id y size usando MediaService y devuelve un object URL.
 * Limpia correctamente URLs anteriores para evitar memory leaks.
 */
export function useProductImage(imageId: string | null | undefined, size: ImageSize = "THUMBNAIL") {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!imageId) {
            setUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            return;
        }

        let isActive = true;
        let nextObjectUrl: string | null = null;

        setLoading(true);

        const fetchImage = async () => {
            try {
                const blob = await mediaService.getImage(imageId, size);
                nextObjectUrl = URL.createObjectURL(blob);

                if (!isActive) {
                    URL.revokeObjectURL(nextObjectUrl);
                    nextObjectUrl = null;
                    return;
                }

                setUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return nextObjectUrl;
                });
            } catch (err) {
                console.error("Failed to load product image", err);
                setUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                });
            } finally {
                if (isActive) setLoading(false);
            }
        };

        void fetchImage();

        return () => {
            isActive = false;
            if (nextObjectUrl) {
                URL.revokeObjectURL(nextObjectUrl);
                nextObjectUrl = null;
            }
        };
    }, [imageId, size]);

    return { url, loading };
}
