import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductFormData } from "@/domain/models/Product";
import { X, Plus } from "lucide-react";
import MoneyInput from "@/components/shared/MoneyInput";

interface Props {
    control: Control<ProductFormData>;
}

const ProductFormTiers = ({ control }: Props) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "price.tiers",
    });

    // ✅ valores reales (incluye lo que el usuario escribe)
    const tiers = useWatch({ control, name: "price.tiers" }) ?? [];

    const addTier = () => {
        const last = tiers[tiers.length - 1];

        const lastDaysTo =
            last?.daysTo != null && String(last.daysTo).trim() !== ""
                ? Number(last.daysTo)
                : null;

        const lastDaysFrom =
            last?.daysFrom != null && String(last.daysFrom).trim() !== ""
                ? Number(last.daysFrom)
                : 1;

        // ✅ Regla: si hay "hasta", siguiente empieza en hasta+1
        // si no hay "hasta", usamos desde+1
        const nextFrom = Number.isFinite(lastDaysTo as number)
            ? (lastDaysTo as number) + 1
            : lastDaysFrom + 1;

        append({
            daysFrom: nextFrom,
            daysTo: null,
            pricePerDay: 0, // cents
        });
    };

    return (
        <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="font-medium">Tiers (precio por día)</h3>
                    <p className="text-sm text-muted-foreground">
                        Define rangos de días. El precio se aplica por día según la duración del alquiler.
                        Si “Días hasta” está vacío, ese tier aplica desde “Días desde” en adelante.
                    </p>
                </div>

                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir tier
                </Button>
            </div>

            <div className="grid grid-cols-[44px_1fr_1fr_1fr] gap-3 text-sm text-muted-foreground">
                <div />
                <div>Días desde</div>
                <div>Días hasta (opcional)</div>
                <div>Precio por día</div>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[44px_1fr_1fr_1fr] gap-3 items-end">
                    {/* ✅ X a la izquierda */}
                    {fields.length > 1 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => remove(index)}
                            title="Eliminar tier"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Input
                        type="number"
                        min={1}
                        step={1}
                        {...(control as any).register(`price.tiers.${index}.daysFrom`, {
                            valueAsNumber: true,
                        })}
                    />

                    <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder="∞"
                        {...(control as any).register(`price.tiers.${index}.daysTo`, {
                            setValueAs: (v: any) => {
                                if (v === "" || v == null) return null;
                                const n = Number(v);
                                return Number.isFinite(n) ? n : null;
                            },
                        })}
                    />

                    <Controller
                        control={control}
                        name={`price.tiers.${index}.pricePerDay` as const}
                        render={({ field: f }) => (
                            <MoneyInput
                                valueCents={Number.isFinite(Number(f.value)) ? Number(f.value) : 0}
                                onChangeCents={f.onChange}
                            />
                        )}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProductFormTiers;
