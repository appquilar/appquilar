import React from 'react';
import { Control, useFieldArray, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, InfoIcon } from 'lucide-react';
import { ProductFormValues } from './productFormSchema';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductPriceFieldsProps {
    control: Control<ProductFormValues>;
}

const ProductPriceFields = ({ control }: ProductPriceFieldsProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "price.tiers",
    });

    const tiersValues = useWatch({
        control,
        name: "price.tiers",
    });

    const handleAddTier = () => {
        const currentTiers = tiersValues || fields;

        if (currentTiers.length === 0) {
            append({
                daysFrom: 1,
                daysTo: undefined,
                pricePerDay: undefined as any,
            });
            return;
        }

        const lastTier = currentTiers[currentTiers.length - 1];
        const lastDaysTo = lastTier.daysTo ? Number(lastTier.daysTo) : 0;
        const lastDaysFrom = lastTier.daysFrom ? Number(lastTier.daysFrom) : 0;

        // Logic: Next start is Previous End + 1. If previous End is empty, fallback to Previous Start + 1
        const nextFrom = lastDaysTo > 0 ? lastDaysTo + 1 : lastDaysFrom + 1;

        append({
            daysFrom: nextFrom,
            daysTo: undefined,
            pricePerDay: undefined as any,
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">Precios</h3>

            <div className="p-4 border border-border rounded-lg bg-muted/30">
                <FormField
                    control={control}
                    name="price.deposit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-medium">Fianza (Depósito) €</FormLabel>
                            <FormControl>
                                <div className="relative max-w-xs">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                        className="pl-7"
                                    />
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                                </div>
                            </FormControl>
                            <Alert className="mt-2">
                                <InfoIcon className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    Pago reembolsable que se devuelve al finalizar el alquiler
                                </AlertDescription>
                            </Alert>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium">Tarifas por días</h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir tramo
                    </Button>
                </div>

                {fields.length === 0 && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Añade tramos de precio para definir diferentes tarifas según la duración del alquiler.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 border border-border rounded-lg bg-background">
                            <FormField
                                control={control}
                                name={`price.tiers.${index}.daysFrom`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Días desde</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`price.tiers.${index}.daysTo`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Días hasta</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Sin límite"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`price.tiers.${index}.pricePerDay`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Precio por día (€)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                                    className="pl-7"
                                                />
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-end">
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductPriceFields;