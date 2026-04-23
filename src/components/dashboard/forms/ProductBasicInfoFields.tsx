import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, useFormContext } from "react-hook-form";
import { ProductFormValues } from "./productFormSchema";
import { slugify } from "@/utils/slugify";
import type { Category } from "@/domain/models/Category";
import CategorySelect from "@/components/dashboard/products/CategorySelect";

interface ProductBasicInfoFieldsProps {
    control: Control<ProductFormValues>;
}

const ProductBasicInfoFields = ({ control }: ProductBasicInfoFieldsProps) => {
    const { setValue } = useFormContext<ProductFormValues>();

    const handleCategoryChange = (category: Category | null) => {
        setValue("category.id", category?.id ?? null, { shouldValidate: true, shouldDirty: true });
        setValue("category.name", category?.name ?? "", { shouldDirty: true });
        setValue("category.slug", category?.slug ?? "", { shouldDirty: true });
    };

    return (
        <div className="space-y-4">
            {/* Primera fila: Nombre (70%) y Estado (30%) */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-[70%]">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Producto</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nombre del producto"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            const slug = slugify(e.target.value);
                                            setValue("slug", slug, { shouldValidate: true });
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="w-full sm:flex-1">
                    <FormField
                        control={control}
                        name="publicationStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona estado" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="draft">Borrador</SelectItem>
                                        <SelectItem value="published">Publicado</SelectItem>
                                        <SelectItem value="archived">Archivado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <FormField
                control={control}
                name="internalId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>ID Interno</FormLabel>
                        <FormControl>
                            <Input placeholder="ID Interno (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="category.id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                            <CategorySelect
                                value={field.value || null}
                                onChange={field.onChange}
                                onCategorySelect={handleCategoryChange}
                                placeholder="Seleccionar categoría del producto"
                                searchPlaceholder="Buscar categoría por nombre..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="slug-del-producto"
                                {...field}
                                disabled={true}
                                className="bg-muted text-muted-foreground"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe tu producto en detalle"
                                className="min-h-[120px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

export default ProductBasicInfoFields;
