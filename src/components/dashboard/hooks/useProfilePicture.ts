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
            setProfilePictureUrl(null);
            return;
        }

        let isActive = true;
        setLoading(true);

        const fetchImage = async () => {
            try {
                // Descargamos el THUMBNAIL usando MediaService
                const blob = await mediaService.getImage(profilePictureId, "THUMBNAIL");

                if (!isActive) return;

                const objectUrl = URL.createObjectURL(blob);
                setProfilePictureUrl(objectUrl);
            } catch (err) {
                console.error("Failed to load profile image", err);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchImage();

        return () => {
            isActive = false;
            if (profilePictureUrl) {
                URL.revokeObjectURL(profilePictureUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profilePictureId]);

    return { profilePicture: profilePictureUrl, loading };
}
