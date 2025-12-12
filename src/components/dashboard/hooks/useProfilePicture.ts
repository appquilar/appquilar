import { useEffect, useState } from "react";
import { mediaService } from "@/compositionRoot";

/**
 * Hook to fetch the profile avatar blob using the profilePictureId
 * vía MediaService (capa de aplicación).
 */
export function useProfilePicture(profilePictureId: string | null | undefined) {
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!profilePictureId) {
            // Limpia URL anterior si existía
            setProfilePictureUrl((prev) => {
                if (prev) {
                    URL.revokeObjectURL(prev);
                }
                return null;
            });
            return;
        }

        let isActive = true;
        let nextObjectUrl: string | null = null;

        setLoading(true);

        const fetchImage = async () => {
            try {
                // Descargamos el THUMBNAIL usando MediaService
                const blob = await mediaService.getImage(profilePictureId, "THUMBNAIL");

                nextObjectUrl = URL.createObjectURL(blob);

                if (!isActive) {
                    // Si el efecto ya fue limpiado, no dejamos object URLs colgadas.
                    URL.revokeObjectURL(nextObjectUrl);
                    nextObjectUrl = null;
                    return;
                }

                setProfilePictureUrl((prev) => {
                    if (prev) {
                        URL.revokeObjectURL(prev);
                    }
                    return nextObjectUrl;
                });
            } catch (err) {
                console.error("Failed to load profile image", err);
                // si falla, no mostramos imagen (y evitamos fugas)
                setProfilePictureUrl((prev) => {
                    if (prev) {
                        URL.revokeObjectURL(prev);
                    }
                    return null;
                });
            } finally {
                if (isActive) {
                    setLoading(false);
                }
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
    }, [profilePictureId]);

    return { profilePicture: profilePictureUrl, loading };
}
