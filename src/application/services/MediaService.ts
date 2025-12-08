import {ImageSize, MediaRepository} from "@/domain/repositories/MediaRepository.ts";
import {Uuid} from "@/domain/valueObject/uuidv4.ts";
import {mediaRepository} from "@/compositionRoot.ts";

export class MediaService {
    constructor(
        private readonly mediaRepository: MediaRepository
    ) {
    }

    async uploadMedia(file: File, id: Uuid): Promise<void> {
        await mediaRepository.uploadImage(file, id.toString());
    }

    async deleteMedia(id: Uuid): Promise<void> {
        await mediaRepository.deleteImage(id.toString());
    }

    async getMediaByIdAndSize(id: Uuid, size: ImageSize): Promise<Blob> {
        return await mediaRepository.downloadImage(id.toString(), size);
    }
}