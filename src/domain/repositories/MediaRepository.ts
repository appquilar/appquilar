export type ImageSize = 'ORIGINAL' | 'LARGE' | 'MEDIUM' | 'THUMBNAIL';

export interface MediaRepository {
    /**
     * Uploads an image file and returns the backend-generated image ID.
     */
    uploadImage(file: File): Promise<string>;

    /**
     * Deletes an image by its ID.
     */
    deleteImage(imageId: string): Promise<void>;

    /**
     * Downloads an image as a Blob.
     * @param id The image UUID
     * @param size The requested size (default THUMBNAIL)
     */
    downloadImage(id: string, size?: ImageSize): Promise<Blob>;
}
