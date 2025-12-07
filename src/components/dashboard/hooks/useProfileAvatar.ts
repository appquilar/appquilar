import {useEffect, useState} from 'react';
import {RepositoryFactory} from '@/infrastructure/repositories/RepositoryFactory';

/**
 * Hook to fetch the profile avatar blob using the profileImageId
 */
export function useProfileAvatar(profileImageId: string | null | undefined) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Get the repository via Factory (now guaranteed to exist)
    const mediaRepository = RepositoryFactory.getMediaRepository();

    useEffect(() => {
        if (!profileImageId) {
            setAvatarUrl(null);
            return;
        }

        let isActive = true;
        setLoading(true);

        const fetchImage = async () => {
            try {
                // Fetch the thumbnail using the ID
                const blob = await mediaRepository.downloadImage(profileImageId, 'THUMBNAIL');

                if (isActive) {
                    const objectUrl = URL.createObjectURL(blob);
                    setAvatarUrl(objectUrl);
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
            if (avatarUrl) {
                URL.revokeObjectURL(avatarUrl);
            }
        };
    }, [profileImageId]);

    return { avatarUrl, loading };
}