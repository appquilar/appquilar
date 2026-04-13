import type { ImageSize } from "@/domain/repositories/MediaRepository";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export const getPublicMediaUrl = (
    mediaId: string | null | undefined,
    size: ImageSize = "MEDIUM"
): string | null => {
    if (!mediaId) {
        return null;
    }

    return `${API_BASE_URL}/api/media/images/${encodeURIComponent(mediaId)}/${size}`;
};

