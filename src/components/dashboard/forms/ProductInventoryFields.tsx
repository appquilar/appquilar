import { Link } from "react-router-dom";
import { type Control, useWatch } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCanManageInventory } from "@/application/hooks/useCapabilities";
import { useProductInventory, useProductRentability } from "@/application/hooks/useProductInventory";
import type { ProductInventorySummary } from "@/domain/models/Product";
import type { ProductFormValues } from "./productFormSchema";

interface ProductInventoryFieldsProps {
    control: Control<ProductFormValues>;
    productId?: string;
    ownerType: "company" | "user";
    enableInventoryQuery?: boolean;
}

const getCapabilityMessage = (capabilityState: "enabled" | "read_only" | "disabled") => {
    switch (capabilityState) {
        case "read_only":
            return {
                title: "Inventario en modo lectura",
                description:
                    "Tu plan actual mantiene el inventario operativo, pero no permite editar la capacidad concurrente.",
            };
        case "disabled":
            return {
                title: "Inventario no incluido en tu plan",
                description:
                    "Puedes seguir pausando o reanudando el alquiler del producto, pero la capacidad concurrente queda bloqueada hasta ampliar el plan.",
            };
        default:
            return null;
    }
};

const ProductInventoryFields = ({
    control,
    productId,
    ownerType,
    enableInventoryQuery = true,
}: ProductInventoryFieldsProps) => {
    const quantity = useWatch({ control, name: "quantity" }) ?? 1;
    const isRentalEnabled = useWatch({ control, name: "isRentalEnabled" }) ?? true;
    const publicationStatus = useWatch({ control, name: "publicationStatus" }) ?? "draft";

    const { capability } = useCanManageInventory(ownerType);
    const inventoryQuery = useProductInventory(productId ?? null, enableInventoryQuery && Boolean(productId));

    const reservedQuantity = inventoryQuery.data?.reservedQuantity ?? 0;
    const capabilityState = inventoryQuery.data?.capabilityState ?? capability?.state ?? "disabled";

    const localSummary: ProductInventorySummary = {
        productId: productId ?? "",
        productInternalId: inventoryQuery.data?.productInternalId ?? "",
        totalQuantity: quantity,
        reservedQuantity,
        availableQuantity: Math.max(0, quantity - reservedQuantity),
        isRentalEnabled,
        capabilityState,
        isRentableNow: publicationStatus === "published" && isRentalEnabled && Math.max(0, quantity - reservedQuantity) > 0,
        unavailabilityReason: publicationStatus !== "published"
            ? "unpublished"
            : !isRentalEnabled
                ? "rental_paused"
                : Math.max(0, quantity - reservedQuantity) <= 0
                    ? "out_of_stock"
                    : null,
    };

    const effectiveSummary: ProductInventorySummary = {
        ...(inventoryQuery.data ?? localSummary),
        totalQuantity: quantity,
        availableQuantity: Math.max(0, quantity - reservedQuantity),
        isRentalEnabled,
        capabilityState,
        isRentableNow: publicationStatus === "published" && isRentalEnabled && Math.max(0, quantity - reservedQuantity) > 0,
        unavailabilityReason: publicationStatus !== "published"
            ? "unpublished"
            : !isRentalEnabled
                ? "rental_paused"
                : Math.max(0, quantity - reservedQuantity) <= 0
                    ? "out_of_stock"
                    : null,
    };

    const rentability = useProductRentability({
        id: productId ?? "",
        internalId: effectiveSummary.productInternalId,
        name: "",
        slug: "",
        description: "",
        quantity,
        isRentalEnabled,
        imageUrl: "",
        thumbnailUrl: "",
        publicationStatus,
        price: { daily: 0, tiers: [] },
        category: { id: "", name: "", slug: "" },
        rating: 0,
        reviewCount: 0,
        inventorySummary: effectiveSummary,
    });

    const capabilityMessage = getCapabilityMessage(capabilityState);
    const canEditInventory = capabilityState === "enabled";
    const showUpgradeCta = capabilityState === "disabled";

    return (
        <Card className="border-border/70">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Inventario y disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {capabilityMessage && (
                    <Alert variant="warning" className="bg-amber-50/70 border-amber-200">
                        <AlertTitle>{capabilityMessage.title}</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>{capabilityMessage.description}</p>
                            {showUpgradeCta && (
                                <Link
                                    to="/dashboard/upgrade"
                                    className="inline-flex text-sm font-medium text-primary underline underline-offset-4"
                                >
                                    Ver planes y desbloquear inventario
                                </Link>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <FormField
                    control={control}
                    name="isRentalEnabled"
                    render={({ field }) => (
                        <FormItem className="rounded-xl border border-border p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <FormLabel className="text-base">Permitir alquiler del producto</FormLabel>
                                    <FormDescription>
                                        Separa la visibilidad del producto de su posibilidad real de alquilarse.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={Boolean(field.value)}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacidad concurrente total</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={field.value ?? 1}
                                    onChange={(event) => {
                                        const nextValue = Number.parseInt(event.target.value, 10);
                                        field.onChange(Number.isNaN(nextValue) ? 1 : nextValue);
                                    }}
                                    disabled={!canEditInventory}
                                />
                            </FormControl>
                            <FormDescription>
                                Cada alquiler confirmado o activo consume 1 plaza en esta iteración.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                        <p className="mt-1 text-2xl font-semibold">{effectiveSummary.totalQuantity}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ocupado / reservado</p>
                        <p className="mt-1 text-2xl font-semibold">{effectiveSummary.reservedQuantity}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponible</p>
                        <p className="mt-1 text-2xl font-semibold">{effectiveSummary.availableQuantity}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
                    <Badge
                        variant="outline"
                        className={
                            rentability.availabilityTone === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : rentability.availabilityTone === "warning"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-slate-200 bg-slate-50 text-slate-700"
                        }
                    >
                        {rentability.availabilityLabel}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{rentability.availabilityMessage}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductInventoryFields;
