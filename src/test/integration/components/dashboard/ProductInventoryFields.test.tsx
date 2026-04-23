import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";

import ProductInventoryFields from "@/components/dashboard/forms/ProductInventoryFields";
import { Form } from "@/components/ui/form";
import type { ProductFormValues } from "@/components/dashboard/forms/productFormSchema";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

const {
  mockUseCanManageInventory,
  mockUseProductInventory,
  mockUseProductInventoryAllocations,
  mockUseProductInventoryUnits,
  mockUseProductRentability,
  mockUseUpdateInventoryUnit,
} = vi.hoisted(() => ({
  mockUseCanManageInventory: vi.fn(),
  mockUseProductInventory: vi.fn(),
  mockUseProductInventoryAllocations: vi.fn(),
  mockUseProductInventoryUnits: vi.fn(),
  mockUseProductRentability: vi.fn(),
  mockUseUpdateInventoryUnit: vi.fn(),
}));

vi.mock("@/application/hooks/useCapabilities", () => ({
  useCanManageInventory: mockUseCanManageInventory,
}));

vi.mock("@/application/hooks/useProductInventory", () => ({
  useProductInventory: mockUseProductInventory,
  useProductInventoryAllocations: mockUseProductInventoryAllocations,
  useProductInventoryUnits: mockUseProductInventoryUnits,
  useProductRentability: mockUseProductRentability,
  useUpdateInventoryUnit: mockUseUpdateInventoryUnit,
}));

const createDefaultValues = (
  overrides: Partial<ProductFormValues> = {}
): ProductFormValues => ({
  internalId: "INV-001",
  name: "Inflable",
  slug: "inflable",
  description: "Inflable para fiestas",
  imageUrl: "",
  thumbnailUrl: "",
  publicationStatus: "published",
  quantity: 2,
  isRentalEnabled: true,
  isInventoryEnabled: true,
  inventoryMode: "unmanaged",
  price: {
    daily: 100,
    deposit: "",
    tiers: [],
  },
  isRentable: true,
  isForSale: false,
  productType: "rental",
  category: {
    id: "cat-1",
    name: "Fiestas",
    slug: "fiestas",
  },
  currentTab: "inventory",
  images: [],
  dynamicProperties: {},
  ...overrides,
});

const ProductInventoryFieldsHarness = ({
  ownerType,
  defaultValues,
  productId,
}: {
  ownerType: "company" | "user";
  defaultValues?: Partial<ProductFormValues>;
  productId?: string;
}) => {
  const form = useForm<ProductFormValues>({
    defaultValues: createDefaultValues(defaultValues),
  });

  return (
    <Form {...form}>
      <ProductInventoryFields
        control={form.control}
        productId={productId}
        ownerType={ownerType}
        enableInventoryQuery={false}
      />
    </Form>
  );
};

describe("ProductInventoryFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseProductInventory.mockReturnValue({
      data: null,
      isLoading: false,
    });
    mockUseProductInventoryUnits.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseProductInventoryAllocations.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseUpdateInventoryUnit.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseProductRentability.mockImplementation((product) => {
      const inventoryManaged = Boolean(product?.inventorySummary?.isInventoryEnabled);

      return {
        inventoryManaged,
        isRentableNow: true,
        availableQuantity: inventoryManaged ? 2 : 1,
        unavailabilityReason: null,
        availabilityLabel: "Disponible",
        availabilityMessage: inventoryManaged
          ? "El producto está visible y con capacidad disponible para nuevas reservas."
          : "El producto está visible y se alquila en modo estándar, sin cupos de inventario.",
        availabilityTone: "success",
        isRentalEnabled: true,
      };
    });
  });

  it("shows a company upgrade CTA for user accounts without inventory capability", () => {
    mockUseCanManageInventory.mockReturnValue({
      capability: { state: "disabled" },
      canManageInventory: false,
      hasInventoryReadAccess: false,
      isReadOnly: false,
      isLoading: false,
    });

    renderWithProviders(<ProductInventoryFieldsHarness ownerType="user" />);

    expect(screen.getByText("Hazte empresa para activar inventario gestionado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hazte empresa" })).toHaveAttribute("href", "/dashboard/upgrade");
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("only offers manual or serialized inventory modes to company owners", () => {
    mockUseCanManageInventory.mockReturnValue({
      capability: { state: "enabled" },
      canManageInventory: true,
      hasInventoryReadAccess: true,
      isReadOnly: false,
      isLoading: false,
    });

    renderWithProviders(<ProductInventoryFieldsHarness ownerType="company" />);

    expect(screen.getByText("Gestión manual por propietario")).toBeInTheDocument();
    expect(screen.getByText("Unidades identificadas")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("lets owners move the product to manual management", async () => {
    const user = userEvent.setup();

    mockUseCanManageInventory.mockReturnValue({
      capability: { state: "enabled" },
      canManageInventory: true,
      hasInventoryReadAccess: true,
      isReadOnly: false,
      isLoading: false,
    });

    renderWithProviders(
      <ProductInventoryFieldsHarness
        ownerType="company"
        defaultValues={{ inventoryMode: "managed_serialized", quantity: 5 }}
      />
    );

    await user.click(screen.getByText("Gestión manual por propietario"));

    expect(screen.getByText("Gestión manual activa")).toBeInTheDocument();
    expect(
      screen.getByText(
        "El cliente podrá pedir fechas y cantidad, pero la disponibilidad final quedará sujeta a tu confirmación."
      )
    ).toBeInTheDocument();
  });

  it("explains that serialized units are the only managed option", () => {
    mockUseCanManageInventory.mockReturnValue({
      capability: { state: "enabled" },
      canManageInventory: true,
      hasInventoryReadAccess: true,
      isReadOnly: false,
      isLoading: false,
    });

    renderWithProviders(
      <ProductInventoryFieldsHarness
        ownerType="company"
        defaultValues={{ inventoryMode: "managed_serialized", quantity: 5 }}
      />
    );

    expect(screen.getByText("Unidades serializadas")).toBeInTheDocument();
    expect(
      screen.getByText("La cantidad marca cuántas unidades quieres tener operativas; las reservas asignarán unidades concretas.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Al guardar el producto se crearán automáticamente 5 unidades con códigos únicos.")
    ).toBeInTheDocument();
  });

  it("shows serialized units, lets owners rename them, and renders the occupancy agenda", async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockUseCanManageInventory.mockReturnValue({
      capability: { state: "enabled" },
      canManageInventory: true,
      hasInventoryReadAccess: true,
      isReadOnly: false,
      isLoading: false,
    });
    mockUseProductInventoryUnits.mockReturnValue({
      data: [
        {
          unitId: "unit-1",
          productId: "product-1",
          code: "CAST-001",
          status: "available",
          sortOrder: 1,
          nextAllocation: {
            rentId: "rent-1",
            startsAt: "2026-04-20T10:00:00.000Z",
            endsAt: "2026-04-22T10:00:00.000Z",
            state: "reserved",
          },
        },
      ],
      isLoading: false,
    });
    mockUseProductInventoryAllocations.mockReturnValue({
      data: [
        {
          allocationId: "allocation-1",
          rentId: "rent-1",
          productId: "product-1",
          productInternalId: "CAST",
          allocatedQuantity: 1,
          assignedUnitIds: ["unit-1"],
          state: "reserved",
          startsAt: "2026-04-20T10:00:00.000Z",
          endsAt: "2026-04-22T10:00:00.000Z",
          createdAt: "2026-04-18T10:00:00.000Z",
          releasedAt: null,
        },
      ],
      isLoading: false,
    });
    mockUseUpdateInventoryUnit.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderWithProviders(
      <ProductInventoryFieldsHarness
        ownerType="company"
        productId="product-1"
        defaultValues={{ inventoryMode: "managed_serialized", quantity: 1 }}
      />
    );

    expect(screen.getByText("Calendario de ocupacion")).toBeInTheDocument();

    const codeInput = screen.getByLabelText("Codigo interno de la unidad CAST-001");
    await user.clear(codeInput);
    await user.type(codeInput, "CAST-RENAMED");
    await user.click(screen.getByLabelText("Guardar codigo de la unidad CAST-001"));

    expect(mutateAsync).toHaveBeenCalledWith({
      productId: "product-1",
      unitId: "unit-1",
      data: { code: "CAST-RENAMED" },
    });
  });
});
