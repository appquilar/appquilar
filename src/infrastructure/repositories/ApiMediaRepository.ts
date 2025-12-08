import {MediaRepository, ImageSize} from "@/domain/repositories/MediaRepository";
import {ApiClient} from "@/infrastructure/http/ApiClient";
import {AuthSession, toAuthorizationHeader} from "@/domain/models/AuthSession";

export class ApiMediaRepository implements MediaRepository {
    private readonly apiClient: ApiClient;
    private readonly getSession: () => AuthSession | null;

    constructor(
        apiClient: ApiClient,
        getSession: () => AuthSession | null
    ) {
        this.apiClient = apiClient;
        this.getSession = getSession;
    }

    private async authHeaders(): Promise<Record<string, string>> {
        const session = this.getSession();
        const authHeader = toAuthorizationHeader(session);

        if (!authHeader) {
            return {};
        }

        return {
            Authorization: authHeader,
        };
    }

    async uploadImage(file: File, imageId: string): Promise<void> {
        const headers = await this.authHeaders();
        const formData = new FormData();

        formData.append("file", file);
        // We send the generated ID to satisfy the "image.upload.image_id.not_blank" validation
        formData.append("image_id", imageId);

        await this.apiClient.post(
            "/api/media/images/upload",
            formData,
            { headers }
        );
    }

    async deleteImage(imageId: string): Promise<void> {
        const headers = await this.authHeaders();

        await this.apiClient.delete(
            `/api/media/images/${imageId}`,
            undefined,
            { headers }
        );
    }

    async downloadImage(id: string, size: ImageSize = 'THUMBNAIL'): Promise<Blob> {
        const headers = await this.authHeaders();

        return this.apiClient.get<Blob>(
            `/api/media/images/${id}/${size}`,
            {
                headers,
                format: 'blob'
            }
        );
    }
}