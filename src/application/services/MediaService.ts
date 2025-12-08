import type { ImageSize, MediaRepository } from "@/domain/repositories/MediaRepository.ts";
import { Uuid } from "@/domain/valueObject/uuidv4.ts";

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

    /**
     * Sube una imagen usando un ID en string (más cómodo para la mayoría de casos).
     */
    async uploadImage(file: File, imageId: string): Promise<void> {
        await this.mediaRepository.uploadImage(file, imageId);
    }

    /**
     * Elimina una imagen por su ID.
     */
    async deleteImage(imageId: string): Promise<void> {
        await this.mediaRepository.deleteImage(imageId);
    }
}
