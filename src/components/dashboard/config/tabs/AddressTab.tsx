// src/components/dashboard/config/tabs/AddressTab.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { AddressFormValues } from "@/domain/schemas/userConfigSchema";
import type { UseFormReturn } from "react-hook-form";
import { useAddressMap } from "@/components/dashboard/hooks/useAddressMap";

interface AddressTabProps {
    addressForm: UseFormReturn<AddressFormValues>;
    onAddressSubmit: (data: AddressFormValues) => void;
}

const AddressTab: React.FC<AddressTabProps> = ({
                                                   addressForm,
                                                   onAddressSubmit,
                                               }) => {
    const { searchInputRef, mapContainerRef, isMapsLoading } =
        useAddressMap(addressForm);

    const latitude = addressForm.watch("latitude");
    const longitude = addressForm.watch("longitude");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <CardDescription>
                    Configura tu dirección. Usa el buscador o mueve el pin en el mapa para
                    ajustar la posición exacta.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...addressForm}>
                    <form
                        onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                        className="space-y-6"
                    >
                        {/* Buscador de dirección (no es campo del schema, sólo autocomplete) */}
                        <div className="space-y-1">
                            <FormLabel>Buscar dirección</FormLabel>
                            <Input
                                ref={searchInputRef}
                                placeholder="Empieza a escribir y selecciona tu dirección…"
                                disabled={isMapsLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Después puedes mover el pin en el mapa para afinar la posición.
                            </p>
                        </div>

                        {/* Calle y resto de datos */}
                        <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calle y número</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Calle y número" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={addressForm.control}
                            name="street2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección adicional (opcional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Piso, puerta, escalera…" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={addressForm.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ciudad</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ciudad" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={addressForm.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provincia / Estado</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Provincia o estado" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={addressForm.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="País" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={addressForm.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código postal</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Código postal" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Mapa */}
                        <div className="space-y-2">
                            <FormLabel>Ubicación en el mapa</FormLabel>
                            <p className="text-xs text-muted-foreground">
                                Nunca mostraremos tu dirección exacta a otros usuarios, sólo una
                                ubicación aproximada cercana a tu posición real.
                            </p>

                            <div
                                ref={mapContainerRef}
                                className="w-full h-[320px] rounded-md border overflow-hidden"
                            />

                            {typeof latitude === "number" &&
                                typeof longitude === "number" && (
                                    <p className="text-xs text-muted-foreground">
                                        Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                    </p>
                                )}
                        </div>

                        <CardFooter className="!px-0 !pb-0 !pt-4 border-t mt-4">
                            <Button
                                type="submit"
                                disabled={addressForm.formState.isSubmitting}
                            >
                                {addressForm.formState.isSubmitting
                                    ? "Guardando…"
                                    : "Guardar dirección"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default AddressTab;
