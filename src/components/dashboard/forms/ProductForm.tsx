import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductFormData } from "@/domain/models/Product";
import ProductImagesField from "./ProductImagesField";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { slugify } from "@/utils/slugify.ts";
import CategoryParentSelect from "@/components/dashboard/categories/form/CategoryParentSelect.tsx";
import ProductFormTiers from "@/components/dashboard/forms/ProductFormTiers.tsx";
import MoneyInput from "@/components/shared/MoneyInput.tsx";

interface Props {
    onSubmit: (data: ProductFormData) => void;
    defaultValues?: Partial<ProductFormData>;
}

const BASE_DEFAULTS: ProductFormData = {
    name: "",
    slug: "",
    internalId: "",
    description: "",
    images: [],
    price: {
        deposit: 0,
        tiers: [{ daysFrom: 1, daysTo: null as any, pricePerDay: 0 }],
    } as any,
    isRentable: true,
    isForSale: false,
} as any;

const ProductForm = ({ onSubmit, defaultValues }: Props) => {
    const resolvedDefaults = useMemo<ProductFormData>(() => {
        return {
            ...BASE_DEFAULTS,
            ...(defaultValues ?? {}),
            price: {
                ...(BASE_DEFAULTS.price as any),
                ...((defaultValues as any)?.price ?? {}),
            },
            images: (defaultValues as any)?.images ?? BASE_DEFAULTS.images,
        } as any;
    }, [defaultValues]);

    const form = useForm<ProductFormData>({
        defaultValues: resolvedDefaults,
    });

    // cuando llegan defaultValues async (modo edit), reseteamos el form
    useEffect(() => {
        form.reset(resolvedDefaults);
    }, [form, resolvedDefaults]);

    const name = form.watch("name");

    useEffect(() => {
        form.setValue("slug", slugify(name || ""), { shouldDirty: true });
    }, [name, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 max-w-5xl mx-auto"
            >
                {/* Nombre */}
                <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del producto</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ej. Casco de bicicleta" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Slug */}
                <FormItem>
                    <FormLabel>Slug (autogenerado)</FormLabel>
                    <FormControl>
                        <Input value={form.watch("slug")} disabled />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                        Se genera automáticamente a partir del nombre y se usa en la URL.
                    </p>
                </FormItem>

                {/* Internal ID */}
                <FormField
                    control={form.control}
                    name="internalId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Identificador interno</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ej. EAN, SKU, código interno..." />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                                Código interno de la empresa para identificar el producto (EAN, código de barras, SKU, etc.).
                                No se muestra al público.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Imágenes */}
                <ProductImagesField form={form} />

                {/* Categoría */}
                <CategoryParentSelect
                    value={(form.watch("categoryId") as any) ?? null}
                    onChange={(v) => form.setValue("categoryId" as any, v, { shouldDirty: true })}
                    hideLabel={false}
                    labelText="Categoría"
                    noneOptionLabel="Selecciona una categoría"
                    helpText="Elige la categoría del producto. Puedes buscar por nombre."
                />

                {/* Descripción */}
                <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                        <RichTextEditor
                            value={form.watch("description")}
                            onChange={(v) => form.setValue("description", v, { shouldDirty: true })}
                        />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                        Describe el producto, su estado, uso recomendado, etc.
                    </p>
                </FormItem>

                {/* Tiers */}
                <ProductFormTiers control={form.control} />

                {/* Depósito */}
                <div className="border rounded-md p-4 space-y-2 max-w-md">
                    <h3 className="font-medium">Fianza (depósito)</h3>
                    <p className="text-sm text-muted-foreground">
                        Importe que se devuelve al finalizar el alquiler si el producto se devuelve en buen estado.
                    </p>

                    <div className="relative">
                        <MoneyInput
                            valueCents={(form.watch("price.deposit") as any) ?? 0}
                            onChangeCents={(cents) =>
                                form.setValue("price.deposit" as any, cents, { shouldDirty: true })
                            }
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            €
                        </span>
                    </div>
                </div>

                <Button type="submit">Guardar producto</Button>
            </form>
        </Form>
    );
};

export default ProductForm;
