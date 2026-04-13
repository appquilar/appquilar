import { useCallback } from "react";

import { mediaService } from "@/compositionRoot";
import { Uuid } from "@/domain/valueObject/uuidv4";

type ReplaceImageOptions = {
    currentId?: string | null;
    file: File;
};

export const useMediaActions = () => {
    const uploadImage = useCallback(async (file: File, imageId?: string): Promise<string> => {
        const nextImageId = imageId ?? Uuid.generate().toString();
        await mediaService.uploadImage(file, nextImageId);
        return nextImageId;
    }, []);

    const deleteImage = useCallback(async (imageId: string): Promise<void> => {
        await mediaService.deleteImage(imageId);
    }, []);

    const replaceImage = useCallback(
        async ({ currentId, file }: ReplaceImageOptions): Promise<string> => {
            const nextImageId = await uploadImage(file);

            if (currentId && currentId !== nextImageId) {
                try {
                    await deleteImage(currentId);
                } catch (error) {
                    console.warn("Could not delete previous image:", error);
                }
            }

            return nextImageId;
        },
        [deleteImage, uploadImage]
    );

    return {
        uploadImage,
        deleteImage,
        replaceImage,
    };
};
