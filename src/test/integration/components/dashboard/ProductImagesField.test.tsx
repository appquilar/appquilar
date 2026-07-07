import { useMemo } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, useWatch } from "react-hook-form";

import { Form } from "@/components/ui/form";
import ProductImagesField from "@/components/dashboard/forms/ProductImagesField";
import type { ProductFormValues } from "@/components/dashboard/forms/productFormSchema";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const uploadImageMock = vi.fn();
const deleteImageMock = vi.fn();
const toastLoadingMock = vi.fn();
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
        loading: (...args: unknown[]) => toastLoadingMock(...args),
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const ProductImagesFieldHarness = ({
    initialImages = [],
}: {
    initialImages?: ProductFormValues["images"];
}) => {
    const form = useForm<ProductFormValues>({
        defaultValues: {
            images: initialImages,
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
        toastLoadingMock.mockReset();
        toastSuccessMock.mockReset();
        toastErrorMock.mockReset();
        createObjectUrlMock.mockReset();
        revokeObjectUrlMock.mockReset();

        uploadImageMock.mockResolvedValue("server-image-1");
        toastLoadingMock.mockReturnValue("upload-toast-1");
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
        expect(toastLoadingMock).toHaveBeenCalledWith("Subiendo cover.png...");
        expect(toastSuccessMock).toHaveBeenCalledWith("Imagen subida: cover.png", { id: "upload-toast-1" });
    });

    it("removes uploaded images from the server when users delete them", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const input = container.querySelector('input[type="file"]');

        const file = new File(["binary"], "cover.png", { type: "image/png" });
        await user.upload(input as HTMLInputElement, file);

        await waitFor(() => {
            expect(screen.getByTestId("images-json")).toHaveTextContent("server-image-1");
        });

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(deleteImageMock).toHaveBeenCalledWith("server-image-1");
        });
        expect(screen.getByTestId("images-json")).toHaveTextContent("[]");
        expect(toastSuccessMock).toHaveBeenCalledWith("Imagen eliminada");
    });

    it("keeps persisted image removal local to the form", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <ProductImagesFieldHarness
                initialImages={[
                    {
                        id: "persisted-image-1",
                        url: "https://cdn.example.com/persisted.jpg",
                    },
                ]}
            />
        );

        await user.click(screen.getByRole("button"));

        expect(screen.getByTestId("images-json")).toHaveTextContent("[]");
        expect(deleteImageMock).not.toHaveBeenCalled();
        expect(toastSuccessMock).toHaveBeenCalledWith("Imagen quitada del formulario");
    });

    it("removes temporary images when upload fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        uploadImageMock.mockRejectedValue(new Error("upload failed"));
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const input = container.querySelector('input[type="file"]');

        const file = new File(["binary"], "cover.png", { type: "image/png" });
        await user.upload(input as HTMLInputElement, file);

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith("Error al subir cover.png", { id: "upload-toast-1" });
        });
        expect(screen.getByTestId("images-json")).toHaveTextContent("[]");
        expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:temp-image-1");
    });

    it("keeps the form update when server cleanup fails after removing an uploaded image", async () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        deleteImageMock.mockRejectedValue(new Error("delete failed"));
        const user = userEvent.setup();
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const input = container.querySelector('input[type="file"]');

        const file = new File(["binary"], "cover.png", { type: "image/png" });
        await user.upload(input as HTMLInputElement, file);

        await waitFor(() => {
            expect(screen.getByTestId("images-json")).toHaveTextContent("server-image-1");
        });

        await user.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith(
                "La imagen se quitó del formulario, pero no se pudo limpiar en el servidor"
            );
        });
        expect(screen.getByTestId("images-json")).toHaveTextContent("[]");
    });

    it("uploads images dropped onto the drop zone after showing the drag state", async () => {
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const dropZone = container.querySelector(".border-dashed");
        expect(dropZone).toBeInstanceOf(HTMLDivElement);
        const dropZoneElement = dropZone as HTMLDivElement;

        fireEvent.dragOver(dropZoneElement);
        expect(dropZoneElement).toHaveClass("border-primary");

        fireEvent.dragLeave(dropZoneElement);
        expect(dropZoneElement).toHaveClass("border-gray-300");

        const file = new File(["binary"], "dropped.png", { type: "image/png" });
        fireEvent.drop(dropZoneElement, {
            dataTransfer: {
                files: [file],
            },
        });

        await waitFor(() => {
            expect(uploadImageMock).toHaveBeenCalledWith(file);
        });
        expect(screen.getByTestId("images-json")).toHaveTextContent("server-image-1");
    });

    it("rejects uploads that exceed the image count limit", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(
            <ProductImagesFieldHarness
                initialImages={[
                    { id: "image-1", url: "/image-1.jpg" },
                    { id: "image-2", url: "/image-2.jpg" },
                    { id: "image-3", url: "/image-3.jpg" },
                    { id: "image-4", url: "/image-4.jpg" },
                    { id: "image-5", url: "/image-5.jpg" },
                ]}
            />
        );
        const input = container.querySelector('input[type="file"]');

        await user.upload(input as HTMLInputElement, new File(["binary"], "extra.png", { type: "image/png" }));

        expect(toastErrorMock).toHaveBeenCalledWith("Solo puedes subir hasta 5 imágenes");
        expect(uploadImageMock).not.toHaveBeenCalled();
        expect(screen.getByTestId("images-json")).toHaveTextContent("image-5");
    });

    it("rejects unsupported and oversized image files before upload", async () => {
        const { container } = renderWithProviders(<ProductImagesFieldHarness />);
        const input = container.querySelector('input[type="file"]');

        const invalidType = new File(["binary"], "cover.gif", { type: "image/gif" });
        const oversized = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.png", { type: "image/png" });
        fireEvent.change(input as HTMLInputElement, {
            target: {
                files: [invalidType, oversized],
            },
        });

        expect(toastErrorMock).toHaveBeenCalledWith("El archivo cover.gif no es una imagen válida (JPEG/PNG)");
        expect(toastErrorMock).toHaveBeenCalledWith("El archivo huge.png excede el tamaño máximo de 2MB");
        expect(uploadImageMock).not.toHaveBeenCalled();
        expect(screen.getByTestId("images-json")).toHaveTextContent("[]");
    });
});
