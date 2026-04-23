import { useCallback } from "react";

import { mediaService } from "@/compositionRoot";

type ReplaceImageOptions = {
    currentId?: string | null;
    file: File;
};

export const useMediaActions = () => {
    const uploadImage = useCallback(async (file: File): Promise<string> => {
        return mediaService.uploadImage(file);
    }, []);

    const deleteImage = useCallback(async (imageId: string): Promise<void> => {
        await mediaService.deleteImage(imageId);
    }, []);

    const replaceImage = useCallback(
        async ({ file }: ReplaceImageOptions): Promise<string> => {
            return uploadImage(file);
        },
        [uploadImage]
    );

    return {
        uploadImage,
        deleteImage,
        replaceImage,
    };
};
