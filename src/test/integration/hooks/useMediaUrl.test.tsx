import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaUrl } from "@/application/hooks/useMediaUrl";

const getImageMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
    compositionRoot: {
        mediaService: {
            getImage: (...args: unknown[]) => getImageMock(...args),
        },
    },
}));

describe("useMediaUrl", () => {
    beforeEach(() => {
        getImageMock.mockReset();
        vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:generated-image");
        vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("does nothing when disabled", () => {
        const { result } = renderHook(() =>
            useMediaUrl("image-1", "MEDIUM", { enabled: false })
        );

        expect(result.current).toEqual({
            url: null,
            isLoading: false,
            error: null,
        });
        expect(getImageMock).not.toHaveBeenCalled();
    });

    it("clears the image state when no media id is provided", async () => {
        getImageMock.mockResolvedValue(new Blob(["image"], { type: "image/png" }));

        const { result, rerender } = renderHook(
            ({ mediaId }) => useMediaUrl(mediaId, "MEDIUM"),
            {
                initialProps: { mediaId: "image-1" as string | null },
            }
        );

        await waitFor(() => {
            expect(result.current.url).toBe("blob:generated-image");
        });

        rerender({ mediaId: null });

        await waitFor(() => {
            expect(result.current).toEqual({
                url: null,
                isLoading: false,
                error: null,
            });
        });
    });

    it("downloads the image, exposes an object URL and revokes it on cleanup", async () => {
        const blob = new Blob(["image"], { type: "image/png" });
        getImageMock.mockResolvedValue(blob);

        const { result, unmount } = renderHook(() =>
            useMediaUrl("image-1", "THUMBNAIL")
        );

        await waitFor(() => {
            expect(result.current).toEqual({
                url: "blob:generated-image",
                isLoading: false,
                error: null,
            });
        });

        expect(getImageMock).toHaveBeenCalledWith("image-1", "THUMBNAIL");

        unmount();

        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:generated-image");
    });

    it("reports a friendly error when the media download fails", async () => {
        getImageMock.mockRejectedValue(new Error("network failure"));

        const { result } = renderHook(() =>
            useMediaUrl("image-1", "LARGE")
        );

        await waitFor(() => {
            expect(result.current).toEqual({
                url: null,
                isLoading: false,
                error: "No se pudo cargar la imagen.",
            });
        });
    });
});
