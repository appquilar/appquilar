import {useEffect, useState} from 'react';
import {RepositoryFactory} from '@/infrastructure/repositories/RepositoryFactory';

/**
 * Hook to fetch the profile avatar blob using the profilePictureId
 */
export function useProfilePicture(profilePictureId: string | null | undefined) {
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Get the repository via Factory (now guaranteed to exist)
    const mediaRepository = RepositoryFactory.getMediaRepository();

    useEffect(() => {
        if (!profilePictureId) {
            setProfilePictureUrl(null);
            return;
        }

        let isActive = true;
        setLoading(true);

        const fetchImage = async () => {
            try {
                // Fetch the thumbnail using the ID
                const blob = await mediaRepository.downloadImage(profilePictureId, 'THUMBNAIL');

                if (isActive) {
                    const objectUrl = URL.createObjectURL(blob);
                    setProfilePictureUrl(objectUrl);
                }
            } catch (err) {
                console.error("Failed to load profile image", err);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isActive = false;
            if (profilePictureUrl) {
                URL.revokeObjectURL(profilePictureUrl);
            }
        };
    }, [profilePictureId]);

    return { profilePicture: profilePictureUrl, loading };
}