import { describe, expect, it } from "vitest";

import { getPublicMediaUrl } from "@/application/hooks/usePublicMediaUrl";

describe("getPublicMediaUrl", () => {
    it("returns null when no media id is available", () => {
        expect(getPublicMediaUrl(null)).toBeNull();
        expect(getPublicMediaUrl(undefined, "THUMBNAIL")).toBeNull();
    });

    it("builds a public image URL with encoded ids and the requested size", () => {
        expect(getPublicMediaUrl("folder/image 1", "THUMBNAIL")).toBe(
            "http://localhost:8000/api/media/images/folder%2Fimage%201/THUMBNAIL"
        );
        expect(getPublicMediaUrl("image-2")).toBe(
            "http://localhost:8000/api/media/images/image-2/MEDIUM"
        );
    });
});
