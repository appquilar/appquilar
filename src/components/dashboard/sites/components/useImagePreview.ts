import { useEffect, useState } from "react";
import { compositionRoot } from "@/compositionRoot";
import type { ImageSize } from "@/domain/repositories/MediaRepository";

export const useImagePreview = (imageId: string | null, size: ImageSize = "THUMBNAIL") => {
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;

        const run = async () => {
            if (!imageId) {
                setUrl(null);
                return;
            }

            setIsLoading(true);

            try {
                const blob = await compositionRoot.mediaService.getImage(imageId, size);
                objectUrl = URL.createObjectURL(blob);
                setUrl(objectUrl);
            } catch (e) {
                console.error(e);
                setUrl(null);
            } finally {
                setIsLoading(false);
            }
        };

        run();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageId, size]);

    return { url, isLoading };
};
