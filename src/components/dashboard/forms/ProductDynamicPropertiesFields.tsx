import { Control } from "react-hook-form";
import type { DynamicPropertyDefinition } from "@/domain/models/DynamicProperty";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import type { ProductFormValues } from "./productFormSchema";

interface ProductDynamicPropertiesFieldsProps {
    control: Control<ProductFormValues>;
    definitions: DynamicPropertyDefinition[];
    isLoading: boolean;
    enabled: boolean;
}

const ProductDynamicPropertiesFields = ({
    control,
    definitions,
    isLoading,
    enabled,
}: ProductDynamicPropertiesFieldsProps) => {
    if (!enabled && !isLoading) {
        return null;
    }

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Cargando atributos de la categoría...</p>;
    }

    if (definitions.length === 0) {
        return <p className="text-sm text-muted-foreground">Esta categoría no tiene propiedades configuradas.</p>;
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {definitions.map((definition) => {
                const fieldName = `dynamicProperties.${definition.code}` as const;
                const label = definition.unit ? `${definition.label} (${definition.unit})` : definition.label;

                if (definition.type === "boolean") {
                    return (
                        <FormField
                            key={definition.code}
                            control={control}
                            name={fieldName as never}
                            render={({ field }) => (
                                <FormItem className="rounded-xl border border-border/60 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <FormLabel className="m-0">{label}</FormLabel>
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
                    );
                }

                if (definition.type === "select") {
                    return (
                        <FormField
                            key={definition.code}
                            control={control}
                            name={fieldName as never}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <Select
                                        value={typeof field.value === "string" ? field.value : ""}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Selecciona ${definition.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(definition.options ?? []).map((option) => (
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
                    );
                }

                if (definition.type === "multi_select") {
                    return (
                        <FormField
                            key={definition.code}
                            control={control}
                            name={fieldName as never}
                            render={({ field }) => {
                                const selectedValues = Array.isArray(field.value) ? field.value : [];

                                const toggleOption = (optionValue: string, checked: boolean) => {
                                    const nextValues = checked
                                        ? Array.from(new Set([...selectedValues, optionValue]))
                                        : selectedValues.filter((value) => value !== optionValue);

                                    field.onChange(nextValues);
                                };

                                return (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>{label}</FormLabel>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {(definition.options ?? []).map((option) => (
                                                <label
                                                    key={option.value}
                                                    className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2"
                                                >
                                                    <Checkbox
                                                        checked={selectedValues.includes(option.value)}
                                                        onCheckedChange={(checked) => toggleOption(option.value, checked === true)}
                                                    />
                                                    <span className="text-sm">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    );
                }

                return (
                    <FormField
                        key={definition.code}
                        control={control}
                        name={fieldName as never}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        step={definition.type === "integer" ? "1" : "0.01"}
                                        value={typeof field.value === "string" || typeof field.value === "number" ? field.value : ""}
                                        onChange={(event) => field.onChange(event.target.value)}
                                        placeholder={`Introduce ${definition.label.toLowerCase()}`}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            })}
        </div>
    );
};

export default ProductDynamicPropertiesFields;
