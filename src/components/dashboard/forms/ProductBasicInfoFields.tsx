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
import { useEffect, useState, useMemo } from "react";
import { Category } from "@/domain/models/Category";
import { categoryService } from "@/compositionRoot";
import { slugify } from "@/utils/slugify";

interface ProductBasicInfoFieldsProps {
    control: Control<ProductFormValues>;
}

const ProductBasicInfoFields = ({ control }: ProductBasicInfoFieldsProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const { setValue } = useFormContext<ProductFormValues>();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await categoryService.getAllCategories({ page: 1, per_page: 100 });
                setCategories(result.categories || []);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const categoriesWithPaths = useMemo(() => {
        const categoryMap = new Map(categories.map(c => [c.id, c]));
        const getPath = (cat: Category): string => {
            if (!cat.parentId) return cat.name;
            const parent = categoryMap.get(cat.parentId);
            if (parent && parent.id !== cat.id) return `${getPath(parent)} > ${cat.name}`;
            return cat.name;
        };

        return categories
            .map(cat => ({ ...cat, displayName: getPath(cat) }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
    }, [categories]);

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
                                        placeholder="Nombre de Herramienta Profesional"
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
                        <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría del producto" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categoriesWithPaths.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.displayName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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