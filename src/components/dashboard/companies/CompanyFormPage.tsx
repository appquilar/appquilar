import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useCompanyProfile, useUpdateCompanyProfile } from "@/application/hooks/useCompanyProfile";
import FormHeader from "../common/FormHeader";
import LoadingSpinner from "../common/LoadingSpinner";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddressMap } from "@/components/dashboard/hooks/useAddressMap";
import CompanySubscriptionSettingsCard from "./CompanySubscriptionSettingsCard";

const companyProfileSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    slug: z.string().min(2, { message: "El slug es obligatorio" }),
    description: z.string().optional(),
    fiscalIdentifier: z.string().optional(),
    contactEmail: z.union([z.literal(""), z.string().email({ message: "Email inválido" })]),
    phoneCountryCode: z.string().optional(),
    phonePrefix: z.string().optional(),
    phoneNumber: z.string().optional(),
    street: z.string().min(1, { message: "La calle es obligatoria" }),
    street2: z.string().optional(),
    city: z.string().min(1, { message: "La ciudad es obligatoria" }),
    state: z.string().min(1, { message: "La provincia/estado es obligatorio" }),
    country: z.string().min(1, { message: "El país es obligatorio" }),
    postalCode: z.string().min(1, { message: "El código postal es obligatorio" }),
    latitude: z.number({ required_error: "Selecciona ubicación en el mapa" }),
    longitude: z.number({ required_error: "Selecciona ubicación en el mapa" }),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

const CompanyFormPage = () => {
    const { companyId, id } = useParams();
    const { currentUser } = useAuth();

    const resolvedCompanyId = companyId ?? id ?? currentUser?.companyId ?? null;
    const profileQuery = useCompanyProfile(resolvedCompanyId);
    const updateMutation = useUpdateCompanyProfile();

    const form = useForm<CompanyProfileFormValues>({
        resolver: zodResolver(companyProfileSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            fiscalIdentifier: "",
            contactEmail: "",
            phoneCountryCode: "",
            phonePrefix: "",
            phoneNumber: "",
            street: "",
            street2: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            latitude: 40.4168,
            longitude: -3.7038,
        },
    });

    useEffect(() => {
        if (!profileQuery.data) {
            return;
        }

        form.reset({
            name: profileQuery.data.name ?? "",
            slug: profileQuery.data.slug ?? "",
            description: profileQuery.data.description ?? "",
            fiscalIdentifier: profileQuery.data.fiscalIdentifier ?? "",
            contactEmail: profileQuery.data.contactEmail ?? "",
            phoneCountryCode: profileQuery.data.phoneNumber?.countryCode ?? "",
            phonePrefix: profileQuery.data.phoneNumber?.prefix ?? "",
            phoneNumber: profileQuery.data.phoneNumber?.number ?? "",
            street: profileQuery.data.address?.street ?? "",
            street2: profileQuery.data.address?.street2 ?? "",
            city: profileQuery.data.address?.city ?? "",
            state: profileQuery.data.address?.state ?? "",
            country: profileQuery.data.address?.country ?? "",
            postalCode: profileQuery.data.address?.postalCode ?? "",
            latitude: profileQuery.data.location?.latitude ?? 40.4168,
            longitude: profileQuery.data.location?.longitude ?? -3.7038,
        });
    }, [profileQuery.data, form]);

    const { searchInputRef, mapContainerRef, isMapsLoading } = useAddressMap(
        form,
        !profileQuery.isLoading && !profileQuery.isError
    );
    const latitude = form.watch("latitude");
    const longitude = form.watch("longitude");

    const onSubmit = async (data: CompanyProfileFormValues) => {
        if (!resolvedCompanyId) {
            toast.error("No hay empresa asociada al usuario.");
            return;
        }

        const hasAnyPhone =
            Boolean(data.phoneCountryCode?.trim()) ||
            Boolean(data.phonePrefix?.trim()) ||
            Boolean(data.phoneNumber?.trim());

        if (hasAnyPhone && (!data.phoneCountryCode || !data.phonePrefix || !data.phoneNumber)) {
            toast.error("Para guardar teléfono, completa país, prefijo y número.");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                companyId: resolvedCompanyId,
                name: data.name.trim(),
                slug: data.slug.trim(),
                description: data.description?.trim() || null,
                fiscalIdentifier: data.fiscalIdentifier?.trim() || null,
                contactEmail: data.contactEmail?.trim() || null,
                phoneNumber: hasAnyPhone
                    ? {
                        countryCode: data.phoneCountryCode!.trim(),
                        prefix: data.phonePrefix!.trim(),
                        number: data.phoneNumber!.trim(),
                    }
                    : null,
                address: {
                    street: data.street.trim(),
                    street2: data.street2?.trim() || null,
                    city: data.city.trim(),
                    state: data.state.trim(),
                    country: data.country.trim(),
                    postalCode: data.postalCode.trim(),
                },
                location: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
            });

            toast.success("Empresa actualizada correctamente.");
        } catch (error) {
            console.error("Error updating company profile", error);
            toast.error("No se pudo guardar la empresa.");
        }
    };

    if (!resolvedCompanyId) {
        return (
            <div className="p-6">
                <p className="text-sm text-muted-foreground">
                    No hay empresa asociada a tu usuario.
                </p>
            </div>
        );
    }

    if (profileQuery.isLoading) {
        return <LoadingSpinner />;
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <div className="p-6">
                <p className="text-sm text-destructive">
                    No se pudo cargar la información de la empresa.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
            <FormHeader
                title="Mi empresa"
                backUrl="/dashboard"
            />

            <CompanySubscriptionSettingsCard />

            <Card>
                <CardHeader>
                    <CardTitle>Datos de empresa</CardTitle>
                    <CardDescription>
                        La ubicación se guarda con latitud y longitud.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Nombre de empresa" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="mi-empresa" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Describe tu empresa"
                                                className="min-h-[96px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fiscalIdentifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CIF / NIF</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="B12345678" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email de contacto</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} type="email" placeholder="contacto@empresa.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phoneCountryCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>País teléfono</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="ES" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phonePrefix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prefijo</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="+34" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} placeholder="612345678" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-1">
                                <FormLabel>Buscar dirección</FormLabel>
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Empieza a escribir y selecciona una dirección..."
                                    disabled={isMapsLoading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calle y número</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="street2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dirección adicional</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ciudad</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provincia / Estado</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código postal</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>Ubicación en el mapa</FormLabel>
                                <div
                                    ref={mapContainerRef}
                                    className="w-full h-[320px] rounded-md border overflow-hidden"
                                />
                                {typeof latitude === "number" && typeof longitude === "number" && (
                                    <p className="text-xs text-muted-foreground">
                                        Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                    </p>
                                )}
                            </div>

                            <CardFooter className="px-0 pb-0 pt-4 border-t mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link to={`/dashboard/companies/${resolvedCompanyId}/users`}>
                                            Usuarios empresa
                                        </Link>
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanyFormPage;
