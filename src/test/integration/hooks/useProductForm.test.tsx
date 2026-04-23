import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useProductForm } from "@/application/hooks/useProductForm";
import type { Product } from "@/domain/models/Product";
import { ApiError } from "@/infrastructure/http/ApiClient";

const useCategoryDynamicPropertiesMock = vi.fn();
const uploadImageMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
    mediaService: {
        uploadImage: (...args: unknown[]) => uploadImageMock(...args),
    },
}));

vi.mock("@/application/hooks/useCategoryDynamicProperties", () => ({
  useCategoryDynamicProperties: (...args: unknown[]) => useCategoryDynamicPropertiesMock(...args),
}));

vi.mock("sonner", () => ({
    toast: {
        error: (...args: unknown[]) => toastErrorMock(...args),
    },
}));

const createDraftProduct = (): Product => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  internalId: "",
  name: "",
  slug: "",
  description: "",
  quantity: 1,
  isRentalEnabled: true,
  imageUrl: "",
  thumbnailUrl: "",
  publicationStatus: "draft",
  price: {
    daily: 0,
    deposit: 0,
    tiers: [],
  },
  dynamicProperties: {},
  category: { id: "", name: "", slug: "" },
  rating: 0,
  reviewCount: 0,
  productType: "rental",
});

const createFilledProduct = (): Product => ({
  ...createDraftProduct(),
  name: "Sala para eventos",
  slug: "sala-para-eventos",
  description: "Espacio interior",
  internalId: "SKU-001",
  dynamicProperties: {},
  category: { id: "cat-1", name: "Eventos", slug: "eventos" },
});

describe("useProductForm", () => {
  beforeEach(() => {
    useCategoryDynamicPropertiesMock.mockReset();
    uploadImageMock.mockReset();
    toastErrorMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes new products with a first empty tier and blank deposit", () => {
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: { dynamicFiltersEnabled: false, definitions: [] },
      isLoading: false,
      isFetching: false,
    });

    const { result } = renderHook(() =>
      useProductForm({
        product: createDraftProduct(),
        onSave: vi.fn(),
        onCancel: vi.fn(),
      })
    );

    expect(result.current.form.getValues("price.deposit")).toBe("");
    expect(result.current.form.getValues("price.tiers")).toEqual([
      {
        daysFrom: 1,
        daysTo: undefined,
        pricePerDay: "",
      },
    ]);
  });

  it("shows a field error when a dynamic property value is invalid", async () => {
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: {
        dynamicFiltersEnabled: true,
        definitions: [
          {
            code: "capacidad_personas",
            label: "Capacidad",
            type: "integer",
            filterable: true,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    });

    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useProductForm({
        product: createFilledProduct(),
        onSave,
        onCancel: vi.fn(),
      })
    );

    act(() => {
      result.current.form.setValue("dynamicProperties.capacidad_personas" as never, "abc" as never);
    });

    await act(async () => {
      await result.current.onSubmit(result.current.form.getValues() as any);
    });

    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.form.getFieldState("dynamicProperties.capacidad_personas" as never).error?.message)
      .toBe("Introduce un número entero válido.");
  });

  it("clears dynamic properties when there is no selected category", async () => {
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    const product = {
      ...createDraftProduct(),
      dynamicProperties: {
        legacy_code: "deprecated",
      },
    };

    const { result } = renderHook(() =>
      useProductForm({
        product,
        onSave: vi.fn(),
        onCancel: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.form.getValues("dynamicProperties")).toEqual({});
    });
  });

  it("clears dynamic properties when the selected category disables them", async () => {
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: {
        dynamicFiltersEnabled: false,
        definitions: [],
      },
      isLoading: false,
      isFetching: false,
    });

    const product = {
      ...createFilledProduct(),
      dynamicProperties: {
        capacidad_personas: 12,
      },
    };

    const { result } = renderHook(() =>
      useProductForm({
        product,
        onSave: vi.fn(),
        onCancel: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.form.getValues("dynamicProperties")).toEqual({});
    });
    expect(result.current.areDynamicPropertiesEnabled).toBe(false);
  });

  it("prunes and sanitizes stale dynamic properties when the category definitions change", async () => {
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: {
        dynamicFiltersEnabled: true,
        definitions: [
          {
            code: "capacidad_personas",
            label: "Capacidad",
            type: "integer",
            filterable: true,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    });

    const product = {
      ...createFilledProduct(),
      dynamicProperties: {
        capacidad_personas: "24",
        legacy: "remove-me",
      },
    };

    const { result } = renderHook(() =>
      useProductForm({
        product,
        onSave: vi.fn(),
        onCancel: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(result.current.form.getValues("dynamicProperties")).toEqual({
        capacidad_personas: 24,
      });
    });
    expect(result.current.areDynamicPropertiesEnabled).toBe(true);
  });

  it("uploads new images, preserves existing ids and builds derived media URLs on save", async () => {
    uploadImageMock.mockResolvedValue("uploaded-image");
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: {
        dynamicFiltersEnabled: true,
        definitions: [
          {
            code: "capacidad_personas",
            label: "Capacidad",
            type: "integer",
            filterable: true,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
    });

    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useProductForm({
        product: createFilledProduct(),
        onSave,
        onCancel: vi.fn(),
      })
    );

    const file = new File(["binary"], "cover.png", { type: "image/png" });

    act(() => {
      result.current.form.setValue("images", [
        { id: "temp-1", file, url: "blob://cover" },
        { id: "existing-image", url: "https://cdn.test/existing.png" },
      ]);
      result.current.form.setValue("dynamicProperties.capacidad_personas" as never, "18" as never);
    });

    await act(async () => {
      await result.current.onSubmit(result.current.form.getValues() as any);
    });

    expect(uploadImageMock).toHaveBeenCalledWith(file);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [{ id: "uploaded-image" }, { id: "existing-image" }],
        image_ids: ["uploaded-image", "existing-image"],
        dynamicProperties: {
          capacidad_personas: 18,
        },
        imageUrl: "http://localhost:8000/api/media/images/uploaded-image/MEDIUM",
        thumbnailUrl: "http://localhost:8000/api/media/images/uploaded-image/THUMBNAIL",
      })
    );
  });

  it("continues saving when image upload fallback fails and keeps root errors empty on field-level API errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    uploadImageMock.mockRejectedValue(new Error("upload failed"));
    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: { dynamicFiltersEnabled: false, definitions: [] },
      isLoading: false,
      isFetching: false,
    });

    const uploadFailureSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useProductForm({
        product: createFilledProduct(),
        onSave: uploadFailureSave,
        onCancel: vi.fn(),
      })
    );

    act(() => {
      result.current.form.setValue("images", [
        { id: "temp-1", file: new File(["bad"], "broken.png", { type: "image/png" }) },
      ]);
    });

    await act(async () => {
      await result.current.onSubmit(result.current.form.getValues() as any);
    });

    expect(uploadFailureSave).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [],
      })
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to upload image fallback",
      "broken.png",
      expect.any(Error)
    );

    const validationSave = vi.fn().mockRejectedValue(
      new ApiError("Validation failed", 422, {
        errors: {
          "category[id]": ["Selecciona una categoría."],
          "price[tiers][0][pricePerDay]": ["Precio obligatorio."],
        },
      })
    );

    const { result: validationResult } = renderHook(() =>
      useProductForm({
        product: createFilledProduct(),
        onSave: validationSave,
        onCancel: vi.fn(),
      })
    );

    await act(async () => {
      await validationResult.current.onSubmit(validationResult.current.form.getValues() as any);
    });

    expect(validationResult.current.form.getFieldState("category.id" as never).error?.message)
      .toBe("Selecciona una categoría.");
    expect(validationResult.current.form.getFieldState("price.tiers.0.pricePerDay" as never).error?.message)
      .toBe("Precio obligatorio.");
    expect(validationResult.current.form.getFieldState("root.server" as never).error).toBeUndefined();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("reports a generic root error when save fails without field-level backend details", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    useCategoryDynamicPropertiesMock.mockReturnValue({
      data: { dynamicFiltersEnabled: false, definitions: [] },
      isLoading: false,
      isFetching: false,
    });

    const onSave = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useProductForm({
        product: createFilledProduct(),
        onSave,
        onCancel: vi.fn(),
      })
    );

    await act(async () => {
      await result.current.onSubmit(result.current.form.getValues() as any);
    });

    expect(result.current.form.getFieldState("root.server" as never).error?.message).toBe(
      "No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo."
    );
    expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar el producto");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating product:", expect.any(Error));
  });
});
