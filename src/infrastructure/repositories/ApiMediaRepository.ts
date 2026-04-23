import {ImageSize, MediaRepository} from "@/domain/repositories/MediaRepository";
import {ApiClient} from "@/infrastructure/http/ApiClient";
import {AuthSession, toAuthorizationHeader} from "@/domain/models/AuthSession";

interface UploadImageResponseDto {
    success: boolean;
    data?: {
        image_id?: string;
    };
}

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

    async uploadImage(file: File): Promise<string> {
        const headers = await this.authHeaders();
        const formData = new FormData();

        formData.append("file", file);

        const response = await this.apiClient.post<UploadImageResponseDto>(
            "/api/media/images/upload",
            formData,
            { headers }
        );

        const imageId = response.data?.image_id;
        if (!imageId) {
            throw new Error("Image upload response did not contain image_id");
        }

        return imageId;
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
