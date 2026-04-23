import { Control, UseFormGetValues, UseFormSetValue, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { CategoryUpsertPayload } from "@/domain/models/Category";
import type { DynamicPropertyType } from "@/domain/models/DynamicProperty";
import { slugify } from "@/utils/slugify";

type FormValues = Omit<CategoryUpsertPayload, "id">;

const PROPERTY_TYPE_OPTIONS: Array<{ value: DynamicPropertyType; label: string }> = [
    { value: "boolean", label: "Sí / No" },
    { value: "select", label: "Selección única" },
    { value: "multi_select", label: "Selección múltiple" },
    { value: "integer", label: "Número entero" },
    { value: "decimal", label: "Número decimal" },
];

const createEmptyOption = () => ({
    value: "",
    label: "",
});

const createEmptyDefinition = () => ({
    code: "",
    label: "",
    type: "select" as DynamicPropertyType,
    filterable: true,
    unit: null,
    options: [createEmptyOption()],
});

const toPropertyCode = (value: string): string => slugify(value).replace(/-/g, "_");

interface DynamicPropertyOptionsEditorProps {
    control: Control<FormValues>;
    getValues: UseFormGetValues<FormValues>;
    propertyIndex: number;
    setValue: UseFormSetValue<FormValues>;
}

const DynamicPropertyOptionsEditor = ({
    control,
    getValues,
    propertyIndex,
    setValue,
}: DynamicPropertyOptionsEditorProps) => {
    const propertyType = useWatch({
        control,
        name: `dynamicPropertyDefinitions.${propertyIndex}.type` as const,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: `dynamicPropertyDefinitions.${propertyIndex}.options` as const,
    });

    if (propertyType !== "select" && propertyType !== "multi_select") {
        return null;
    }

    return (
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Opciones</p>
                    <p className="text-xs text-muted-foreground">
                        Configura los valores que podrán usarse en productos y filtros.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(createEmptyOption())}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir opción
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field, optionIndex) => (
                    <div
                        key={field.id}
                        className="grid gap-3 rounded-lg border border-border/60 bg-background p-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                        <FormField
                            control={control}
                            name={`dynamicPropertyDefinitions.${propertyIndex}.options.${optionIndex}.label` as const}
                            render={({ field: optionField }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                        Etiqueta
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...optionField}
                                            value={optionField.value ?? ""}
                                            placeholder="Interior"
                                            onBlur={(event) => {
                                                optionField.onBlur();

                                                const currentValue = getValues(
                                                    `dynamicPropertyDefinitions.${propertyIndex}.options.${optionIndex}.value`
                                                );

                                                if (!currentValue && event.target.value.trim().length > 0) {
                                                    setValue(
                                                        `dynamicPropertyDefinitions.${propertyIndex}.options.${optionIndex}.value`,
                                                        toPropertyCode(event.target.value),
                                                        { shouldDirty: true, shouldValidate: true }
                                                    );
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`dynamicPropertyDefinitions.${propertyIndex}.options.${optionIndex}.value` as const}
                            render={({ field: optionField }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                        Valor
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...optionField}
                                            value={optionField.value ?? ""}
                                            placeholder="interior"
                                        />
                                    </FormControl>
                                    <FormDescription>Se guarda en productos y URLs de filtros.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(optionIndex)}
                                disabled={fields.length === 1}
                                className="text-destructive hover:text-destructive"
                                aria-label={`Eliminar opción ${optionIndex + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface CategoryDynamicPropertyDefinitionsFieldsProps {
    control: Control<FormValues>;
    getValues: UseFormGetValues<FormValues>;
    setValue: UseFormSetValue<FormValues>;
}

interface CategoryDynamicPropertyDefinitionCardProps {
    control: Control<FormValues>;
    getValues: UseFormGetValues<FormValues>;
    index: number;
    isLast: boolean;
    onRemove: () => void;
    setValue: UseFormSetValue<FormValues>;
}

const CategoryDynamicPropertyDefinitionCard = ({
    control,
    getValues,
    index,
    isLast,
    onRemove,
    setValue,
}: CategoryDynamicPropertyDefinitionCardProps) => {
    const propertyType = useWatch({
        control,
        name: `dynamicPropertyDefinitions.${index}.type` as const,
    });

    return (
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">Propiedad {index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                        Define cómo se captura y filtra este atributo.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="text-destructive hover:text-destructive"
                    aria-label={`Eliminar propiedad ${index + 1}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={control}
                    name={`dynamicPropertyDefinitions.${index}.label` as const}
                    render={({ field: propertyField }) => (
                        <FormItem>
                            <FormLabel>Etiqueta</FormLabel>
                            <FormControl>
                                <Input
                                    {...propertyField}
                                    value={propertyField.value ?? ""}
                                    placeholder="Capacidad de personas"
                                    onBlur={(event) => {
                                        propertyField.onBlur();

                                        const currentCode = getValues(
                                            `dynamicPropertyDefinitions.${index}.code`
                                        );

                                        if (!currentCode && event.target.value.trim().length > 0) {
                                            setValue(
                                                `dynamicPropertyDefinitions.${index}.code`,
                                                toPropertyCode(event.target.value),
                                                { shouldDirty: true, shouldValidate: true }
                                            );
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`dynamicPropertyDefinitions.${index}.code` as const}
                    render={({ field: propertyField }) => (
                        <FormItem>
                            <FormLabel>Código</FormLabel>
                            <FormControl>
                                <Input
                                    {...propertyField}
                                    value={propertyField.value ?? ""}
                                    placeholder="capacidad_personas"
                                />
                            </FormControl>
                            <FormDescription>
                                Usa minúsculas, números y guiones bajos.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={`dynamicPropertyDefinitions.${index}.type` as const}
                    render={({ field: propertyField }) => (
                        <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select
                                value={propertyField.value ?? "select"}
                                onValueChange={(nextType) => {
                                    propertyField.onChange(nextType);

                                    if (nextType === "select" || nextType === "multi_select") {
                                        const currentOptions = getValues(
                                            `dynamicPropertyDefinitions.${index}.options`
                                        ) ?? [];

                                        if (currentOptions.length === 0) {
                                            setValue(
                                                `dynamicPropertyDefinitions.${index}.options`,
                                                [createEmptyOption()],
                                                { shouldDirty: true, shouldValidate: true }
                                            );
                                        }

                                        return;
                                    }

                                    setValue(
                                        `dynamicPropertyDefinitions.${index}.options`,
                                        [],
                                        { shouldDirty: true, shouldValidate: true }
                                    );
                                }}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {PROPERTY_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
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
                    name={`dynamicPropertyDefinitions.${index}.filterable` as const}
                    render={({ field: propertyField }) => (
                        <FormItem className="rounded-xl border border-border/60 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <FormLabel className="m-0">Visible en filtros</FormLabel>
                                    <FormDescription>
                                        Si se activa, esta propiedad podrá aparecer en la búsqueda pública.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={Boolean(propertyField.value)}
                                        onCheckedChange={propertyField.onChange}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {(propertyType === "integer" || propertyType === "decimal") && (
                <FormField
                    control={control}
                    name={`dynamicPropertyDefinitions.${index}.unit` as const}
                    render={({ field: propertyField }) => (
                        <FormItem className="max-w-sm">
                            <FormLabel>Unidad</FormLabel>
                            <FormControl>
                                <Input
                                    {...propertyField}
                                    value={propertyField.value ?? ""}
                                    placeholder="personas, kg, W, m²..."
                                />
                            </FormControl>
                            <FormDescription>
                                Opcional. Se mostrará junto al valor en producto y filtros.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <DynamicPropertyOptionsEditor
                control={control}
                getValues={getValues}
                propertyIndex={index}
                setValue={setValue}
            />

            {!isLast && <Separator />}
        </div>
    );
};

const CategoryDynamicPropertyDefinitionsFields = ({
    control,
    getValues,
    setValue,
}: CategoryDynamicPropertyDefinitionsFieldsProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "dynamicPropertyDefinitions",
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold">Propiedades dinámicas</h3>
                    <p className="text-sm text-muted-foreground">
                        Añade, edita o elimina las propiedades que heredan los productos de esta categoría.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append(createEmptyDefinition())}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir propiedad
                </Button>
            </div>

            {fields.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Esta categoría aún no tiene propiedades propias. Si es una subcategoría, seguirá heredando las del padre.
                </div>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <CategoryDynamicPropertyDefinitionCard
                            key={field.id}
                            control={control}
                            getValues={getValues}
                            index={index}
                            isLast={index === fields.length - 1}
                            onRemove={() => remove(index)}
                            setValue={setValue}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryDynamicPropertyDefinitionsFields;
