import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaActions } from "@/application/hooks/useMediaActions";

const uploadImageMock = vi.fn();
const deleteImageMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
    mediaService: {
        uploadImage: (...args: unknown[]) => uploadImageMock(...args),
        deleteImage: (...args: unknown[]) => deleteImageMock(...args),
    },
}));

describe("useMediaActions", () => {
    beforeEach(() => {
        uploadImageMock.mockReset();
        deleteImageMock.mockReset();
    });

    it("uploads, deletes and replaces images through the media service", async () => {
        const file = new File(["binary"], "image.png", { type: "image/png" });
        uploadImageMock.mockResolvedValue("new-image-id");
        deleteImageMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useMediaActions());

        await expect(result.current.uploadImage(file)).resolves.toBe("new-image-id");

        await act(async () => {
            await result.current.deleteImage("old-image-id");
        });

        await expect(
            result.current.replaceImage({
                currentId: "old-image-id",
                file,
            })
        ).resolves.toBe("new-image-id");

        expect(uploadImageMock).toHaveBeenNthCalledWith(1, file);
        expect(deleteImageMock).toHaveBeenCalledWith("old-image-id");
        expect(uploadImageMock).toHaveBeenNthCalledWith(2, file);
    });
});
