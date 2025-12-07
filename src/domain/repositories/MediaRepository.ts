export type ImageSize = 'ORIGINAL' | 'LARGE' | 'MEDIUM' | 'THUMBNAIL';

export interface MediaRepository {
    /**
     * Uploads an image file with a pre-generated ID.
     * @param file The file to upload
     * @param imageId The UUID generated in the FE
     */
    uploadImage(file: File, imageId: string): Promise<void>;

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