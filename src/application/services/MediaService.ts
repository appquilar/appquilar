import type { ImageSize, MediaRepository } from "@/domain/repositories/MediaRepository.ts";

export class MediaService {
    constructor(
        private readonly mediaRepository: MediaRepository
    ) {}

    /**
     * Nuevo método de alto nivel para UI/hooks:
     * descarga una imagen por id y tamaño.
     */
    async getImage(imageId: string, size: ImageSize = "THUMBNAIL"): Promise<Blob> {
        return this.mediaRepository.downloadImage(imageId, size);
    }

    async uploadImage(file: File): Promise<string> {
        return this.mediaRepository.uploadImage(file);
    }

    /**
     * Elimina una imagen por su ID.
     */
    async deleteImage(imageId: string): Promise<void> {
        await this.mediaRepository.deleteImage(imageId);
    }
}
