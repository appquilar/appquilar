import { useState } from 'react';
import { mediaService } from '@/compositionRoot';

export const useBlogImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File): Promise<string> => {
        setIsUploading(true);

        try {
            return await mediaService.uploadImage(file);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        isUploading,
        uploadImage,
    };
};
