import { useState } from 'react';
import { mediaService } from '@/compositionRoot';
import { Uuid } from '@/domain/valueObject/uuidv4';

export const useBlogImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File): Promise<string> => {
        setIsUploading(true);

        try {
            const imageId = Uuid.generate().toString();
            await mediaService.uploadImage(file, imageId);

            return imageId;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        isUploading,
        uploadImage,
    };
};
