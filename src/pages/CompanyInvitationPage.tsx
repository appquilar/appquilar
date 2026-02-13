import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAcceptCompanyInvitation } from "@/application/hooks/useCompanyInvitation";
import { useAuth } from "@/context/AuthContext";
import { authPasswordSchema } from "@/domain/schemas/authSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const existingAccountSchema = z.object({
    password: z.string().min(1, "La contraseña es obligatoria"),
});

type ExistingAccountFormValues = z.infer<typeof existingAccountSchema>;

const newAccountSchema = z.object({
    givenName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    familyName: z.string().min(1, "El apellido es obligatorio"),
    password: authPasswordSchema,
});

type NewAccountFormValues = z.infer<typeof newAccountSchema>;

const getApiErrorCode = (error: unknown): string | null => {
    const payload = (error as { payload?: { error?: unknown } })?.payload;
    const errorField = payload?.error;

    if (Array.isArray(errorField) && typeof errorField[0] === "string") {
        return errorField[0];
    }

    return null;
};

const CompanyInvitationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const companyId = searchParams.get("company_id") ?? "";
    const token = searchParams.get("token") ?? "";
    const invitedEmail = (searchParams.get("email") ?? "").trim().toLowerCase();
    const isLinkValid = Boolean(companyId && token);

    const { currentUser, login } = useAuth();
    const acceptInvitation = useAcceptCompanyInvitation();
    const [mode, setMode] = useState<"existing" | "new">("existing");

    const existingAccountForm = useForm<ExistingAccountFormValues>({
        resolver: zodResolver(existingAccountSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            password: "",
        },
    });

    const newAccountForm = useForm<NewAccountFormValues>({
        resolver: zodResolver(newAccountSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            givenName: "",
            familyName: "",
            password: "",
        },
    });

    const title = useMemo(() => {
        if (!isLinkValid) {
            return "Invitación inválida";
        }

        return "Aceptar invitación de empresa";
    }, [isLinkValid]);

    const requiresInvitationEmail = !currentUser && invitedEmail.length === 0;

    const acceptAsAuthenticatedUser = async () => {
        await acceptInvitation.mutateAsync({
            companyId,
            token,
            email: null,
            password: null,
        });
    };

    const onAcceptLoggedUser = async () => {
        if (!isLinkValid) {
            toast.error("El enlace de invitación no es válido.");
            return;
        }

        try {
            await acceptAsAuthenticatedUser();
            toast.success("Invitación aceptada correctamente.");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Error accepting invitation as logged user", error);
            toast.error("No se pudo aceptar la invitación con esta cuenta.");
        }
    };

    const onExistingAccountSubmit = async (values: ExistingAccountFormValues) => {
        if (!isLinkValid) {
            toast.error("El enlace de invitación no es válido.");
            return;
        }

        if (!invitedEmail) {
            toast.error("El enlace no incluye el email invitado. Solicita una nueva invitación.");
            return;
        }

        try {
            await login(invitedEmail, values.password);
            await acceptAsAuthenticatedUser();
            toast.success("Invitación aceptada correctamente.");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Error accepting invitation using existing account", error);
            toast.error("No se pudo completar la invitación. Revisa la contraseña de la cuenta invitada.");
        }
    };

    const onNewAccountSubmit = async (values: NewAccountFormValues) => {
        if (!isLinkValid) {
            toast.error("El enlace de invitación no es válido.");
            return;
        }

        if (!invitedEmail) {
            toast.error("El enlace no incluye el email invitado. Solicita una nueva invitación.");
            return;
        }

        try {
            await acceptInvitation.mutateAsync({
                companyId,
                token,
                email: invitedEmail,
                password: values.password,
                firstName: values.givenName.trim(),
                lastName: values.familyName.trim(),
            });

            try {
                await login(invitedEmail, values.password);
                navigate("/dashboard", { replace: true });
            } catch {
                navigate("/", { replace: true });
            }

            toast.success("Invitación aceptada correctamente.");
        } catch (error) {
            console.error("Error accepting invitation creating account", error);
            const errorCode = getApiErrorCode(error);

            if (errorCode === "company.accept_invitation.user_already_exists") {
                setMode("existing");
                existingAccountForm.setValue("password", values.password, { shouldDirty: true });
                toast.error("Ese email ya tiene cuenta. Usa 'Ya tengo cuenta' para aceptar la invitación.");
                return;
            }

            if (errorCode === "company.accept_invitation.login_required") {
                toast.error("Esta invitación está asociada a una cuenta existente. Usa 'Ya tengo cuenta'.");
                return;
            }

            if (errorCode === "company.accept_invitation.already_accepted") {
                toast.error("Esta invitación ya fue aceptada.");
                return;
            }

            const fieldErrors = (error as { payload?: { errors?: Record<string, string[]> } })?.payload?.errors;
            const passwordError = fieldErrors?.password?.[0];
            const firstNameError = fieldErrors?.firstName?.[0] ?? fieldErrors?.first_name?.[0];
            const lastNameError = fieldErrors?.lastName?.[0] ?? fieldErrors?.last_name?.[0];
            if (firstNameError) {
                newAccountForm.setError("givenName", { type: "server", message: firstNameError });
            }
            if (lastNameError) {
                newAccountForm.setError("familyName", { type: "server", message: lastNameError });
            }
            if (passwordError) {
                newAccountForm.setError("password", { type: "server", message: passwordError });
                return;
            }
            toast.error("No se pudo crear la cuenta o aceptar la invitación.");
        }
    };

    const isSubmitting =
        acceptInvitation.isPending ||
        existingAccountForm.formState.isSubmitting ||
        newAccountForm.formState.isSubmitting;

    const extractPasswordFromFormDom = (formElement: HTMLFormElement): string => {
        const formData = new FormData(formElement);
        return String(formData.get("password") ?? "");
    };

    const syncPasswordFromFormDom = (
        formElement: HTMLFormElement,
        setValue: (name: "password", value: string, options?: { shouldDirty?: boolean; shouldValidate?: boolean }) => void
    ) => {
        const password = extractPasswordFromFormDom(formElement);
        setValue("password", password, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="container mx-auto max-w-xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        El sistema detecta si ya tienes cuenta o si debes crearla para unirte a la empresa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isLinkValid ? (
                        <div className="space-y-4">
                            <p className="text-sm text-destructive">
                                Falta `company_id` o `token` en el enlace.
                            </p>
                            <Button onClick={() => navigate("/", { replace: true })}>
                                Volver al inicio
                            </Button>
                        </div>
                    ) : requiresInvitationEmail ? (
                        <div className="space-y-4">
                            <p className="text-sm text-destructive">
                                Falta el email invitado en el enlace. Solicita una nueva invitación.
                            </p>
                            <Button onClick={() => navigate("/", { replace: true })}>
                                Volver al inicio
                            </Button>
                        </div>
                    ) : currentUser ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Vas a aceptar la invitación con la cuenta:
                            </p>
                            <p className="text-sm font-medium">{currentUser.email}</p>
                            <Button onClick={onAcceptLoggedUser} disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Aceptando..." : "Aceptar invitación"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label>Email invitado</Label>
                                <Input value={invitedEmail} readOnly disabled />
                            </div>

                            <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-1">
                                <Button
                                    type="button"
                                    variant={mode === "existing" ? "default" : "ghost"}
                                    onClick={() => setMode("existing")}
                                    className="w-full"
                                >
                                    Ya tengo cuenta
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === "new" ? "default" : "ghost"}
                                    onClick={() => setMode("new")}
                                    className="w-full"
                                >
                                    Crear cuenta
                                </Button>
                            </div>

                            {mode === "existing" ? (
                                <Form key="existing-invitation-form" {...existingAccountForm}>
                                    <form
                                        className="space-y-4"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            syncPasswordFromFormDom(event.currentTarget, existingAccountForm.setValue);
                                            void existingAccountForm.handleSubmit(onExistingAccountSubmit)();
                                        }}
                                    >
                                        <FormField
                                            control={existingAccountForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            autoComplete="current-password"
                                                            autoCapitalize="none"
                                                            autoCorrect="off"
                                                            {...field}
                                                            onChange={(event) => {
                                                                existingAccountForm.clearErrors("password");
                                                                field.onChange(event.target.value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                            {isSubmitting ? "Accediendo..." : "Acceder y aceptar invitación"}
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                <Form key="new-invitation-form" {...newAccountForm}>
                                    <form
                                        className="space-y-4"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            syncPasswordFromFormDom(event.currentTarget, newAccountForm.setValue);
                                            void newAccountForm.handleSubmit(onNewAccountSubmit)();
                                        }}
                                    >
                                        <FormField
                                            control={newAccountForm.control}
                                            name="givenName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Tu nombre"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={newAccountForm.control}
                                            name="familyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Apellido</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Tus apellidos"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={newAccountForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Mínimo 8 caracteres"
                                                            autoComplete="new-password"
                                                            autoCapitalize="none"
                                                            autoCorrect="off"
                                                            {...field}
                                                            onChange={(event) => {
                                                                newAccountForm.clearErrors("password");
                                                                field.onChange(event.target.value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                            {isSubmitting ? "Creando cuenta..." : "Crear cuenta y aceptar invitación"}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CompanyInvitationPage;
