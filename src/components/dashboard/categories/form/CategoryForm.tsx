import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

import type { CategoryUpsertPayload } from "@/domain/models/Category";
import { slugify } from "@/utils/slugify";

import CategoryParentSelect from "@/components/dashboard/categories/form/CategoryParentSelect";
import CategoryLandscapeUpload from "@/components/dashboard/categories/form/CategoryLandscapeUpload";
import CategoryFeaturedUpload from "@/components/dashboard/categories/form/CategoryFeaturedUpload";
import CategoryDescriptionEditor from "@/components/dashboard/categories/form/CategoryDescriptionEditor";
import IconPicker from "@/components/dashboard/categories/icon-picker/IconPicker";
import { useMediaActions } from "@/application/hooks/useMediaActions";

type FormValues = Omit<CategoryUpsertPayload, "id">;

const schema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    slug: z.string().min(1, "El slug es obligatorio"),
    description: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
    iconName: z.string().nullable().optional(),
    featuredImageId: z.string().nullable().optional(),
    landscapeImageId: z.string().nullable().optional(),
});

type Props = {
    defaultValues: FormValues;
    isSubmitting: boolean;
    onSubmit: (data: FormValues) => Promise<void>;
    onCancel: () => void;
    categoryId?: string;
};

const CategoryForm: React.FC<Props> = ({
    defaultValues,
    isSubmitting,
    onSubmit,
    onCancel,
    categoryId,
}) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onSubmit",
    });
    const { deleteImage, replaceImage } = useMediaActions();

    const name = form.watch("name");

    // slug autogenerado (disabled)
    useEffect(() => {
        const next = slugify(name ?? "");
        form.setValue("slug", next, { shouldDirty: true, shouldValidate: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name]);

    // reset en modo edit cuando llegan defaults
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const [featuredUploading, setFeaturedUploading] = React.useState(false);
    const [landscapeUploading, setLandscapeUploading] = React.useState(false);

    const uploadReplace = async (
        currentId: string | null,
        setId: (id: string | null) => void,
        file: File
    ) => {
        const newId = await replaceImage({ currentId, file });
        setId(newId);
    };

    const removeCurrent = async (currentId: string | null, setId: (id: string | null) => void) => {
        if (!currentId) {
            setId(null);
            return;
        }
        await deleteImage(currentId);
        setId(null);
    };

    const submit = form.handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <Form {...form}>
            <form onSubmit={submit} className="space-y-8">
                {/* Básicos */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Nombre</Label>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Ej: Vehículos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Slug (autogenerado)</Label>
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <CategoryParentSelect
                                            value={field.value ?? null}
                                            onChange={(id) => field.onChange(id)}
                                            excludeCategoryId={categoryId}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                {/* Media (IDs) */}
                <div className="space-y-6">
                    <h3 className="text-base font-semibold">Imágenes (se guardan como IDs)</h3>

                    <div className="space-y-2">
                        <Label>Icono Lucide</Label>
                        <FormField
                            control={form.control}
                            name="iconName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <IconPicker
                                            selectedIcon={field.value ?? null}
                                            onSelectIcon={field.onChange}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Se guarda como `icon_name` y se renderiza con Lucide en FE.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="featuredImageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <CategoryFeaturedUpload
                                        featuredId={field.value ?? null}
                                        isUploading={featuredUploading}
                                        onSelectFile={async (file) => {
                                            setFeaturedUploading(true);
                                            try {
                                                await uploadReplace(field.value ?? null, field.onChange, file);
                                                toast.success("Featured image subida");
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error al subir la featured image");
                                            } finally {
                                                setFeaturedUploading(false);
                                            }
                                        }}
                                        onRemove={async () => {
                                            setFeaturedUploading(true);
                                            try {
                                                await removeCurrent(field.value ?? null, field.onChange);
                                                toast.success("Featured image eliminada");
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error al eliminar la featured image");
                                            } finally {
                                                setFeaturedUploading(false);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="landscapeImageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <CategoryLandscapeUpload
                                        landscapeId={field.value ?? null}
                                        isUploading={landscapeUploading}
                                        onSelectFile={async (file) => {
                                            setLandscapeUploading(true);
                                            try {
                                                await uploadReplace(field.value ?? null, field.onChange, file);
                                                toast.success("Landscape subida");
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error al subir la landscape");
                                            } finally {
                                                setLandscapeUploading(false);
                                            }
                                        }}
                                        onRemove={async () => {
                                            setLandscapeUploading(true);
                                            try {
                                                await removeCurrent(field.value ?? null, field.onChange);
                                                toast.success("Landscape eliminada");
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error al eliminar la landscape");
                                            } finally {
                                                setLandscapeUploading(false);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* Description (WYSIWYG) */}
                <div className="space-y-2">
                    <h3 className="text-base font-semibold">Descripción</h3>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <CategoryDescriptionEditor
                                        value={field.value ?? ""}
                                        onChange={(html) => field.onChange(html)}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CategoryForm;
