import { useMemo } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, useWatch } from "react-hook-form";

import { Form } from "@/components/ui/form";
import ProductImagesField from "@/components/dashboard/forms/ProductImagesField";
import type { ProductFormValues } from "@/components/dashboard/forms/productFormSchema";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const uploadImageMock = vi.fn();
const deleteImageMock = vi.fn();
const toastInfoMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

vi.mock("@/application/hooks/useMediaActions", () => ({
    useMediaActions: () => ({
        uploadImage: (...args: unknown[]) => uploadImageMock(...args),
        deleteImage: (...args: unknown[]) => deleteImageMock(...args),
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        info: (...args: unknown[]) => toastInfoMock(...args),
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const ProductImagesFieldHarness = () => {
    const form = useForm<ProductFormValues>({
        defaultValues: {
            images: [],
        } as Partial<ProductFormValues>,
    });
    const watchedImages = useWatch({
        control: form.control,
        name: "images",
    });
    const serializedImages = useMemo(
        () => JSON.stringify(watchedImages ?? []),
        [watchedImages]
    );

    return (
        <Form {...form}>
            <ProductImagesField control={form.control} />
            <output data-testid="images-json">{serializedImages}</output>
        </Form>
    );
};

describe("ProductImagesField", () => {
    beforeEach(() => {
        uploadImageMock.mockReset();
        deleteImageMock.mockReset();
        toastInfoMock.mockReset();
        toastSuccessMock.mockReset();
        toastErrorMock.mockReset();
        createObjectUrlMock.mockReset();
        revokeObjectUrlMock.mockReset();

        uploadImageMock.mockResolvedValue("server-image-1");
        createObjectUrlMock.mockReturnValue("blob:temp-image-1");
        Object.defineProperty(URL, "createObjectURL", {
            writable: true,
            value: createObjectUrlMock,
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            writable: true,
            value: revokeObjectUrlMock,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("keeps the uploaded image in the field after the async upload resolves", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const input = container.querySelector('input[type="file"]');

        expect(input).toBeInstanceOf(HTMLInputElement);

        const file = new File(["binary"], "cover.png", { type: "image/png" });
        await user.upload(input as HTMLInputElement, file);

        await waitFor(() => {
            expect(uploadImageMock).toHaveBeenCalledWith(file);
        });

        await waitFor(() => {
            expect(screen.getByTestId("images-json")).toHaveTextContent("server-image-1");
        });

        expect(screen.getByTestId("images-json")).not.toHaveTextContent("blob:temp-image-1");
        expect(screen.getAllByAltText("Preview")).toHaveLength(1);
        expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:temp-image-1");
        expect(toastSuccessMock).toHaveBeenCalledWith("Imagen subida: cover.png");
    });
});
