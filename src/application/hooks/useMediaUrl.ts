import { useEffect, useState } from "react";
import type { ImageSize } from "@/domain/repositories/MediaRepository";
import { compositionRoot } from "@/compositionRoot";

type Options = {
    enabled?: boolean;
};

/**
 * Convierte un mediaId en una URL usable por <img src="...">.
 * - Crea ObjectURL y lo revoca al cambiar/unmount.
 */
export const useMediaUrl = (
    mediaId: string | null | undefined,
    size: ImageSize,
    options: Options = {}
) => {
    const { enabled = true } = options;

    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        let objectUrl: string | null = null;

        const run = async () => {
            if (!enabled) return;

            if (!mediaId) {
                setUrl(null);
                setError(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const blob = await compositionRoot.mediaService.getImage(mediaId, size);
                objectUrl = URL.createObjectURL(blob);

                if (!alive) return;
                setUrl(objectUrl);
            } catch (e) {
                if (!alive) return;
                setUrl(null);
                setError("No se pudo cargar la imagen.");
            } finally {
                if (!alive) return;
                setIsLoading(false);
            }
        };

        run();

        return () => {
            alive = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [mediaId, size, enabled]);

    return { url, isLoading, error };
};
