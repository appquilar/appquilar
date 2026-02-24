import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSeo } from "@/hooks/useSeo.ts";
import { useSendContactMessage } from "@/application/hooks/useContact";
import { useRecaptchaToken } from "@/application/hooks/useCaptcha";

const CONTACT_EMAIL = "appquilar.contacto@gmail.com";

const CONTACT_TOPICS = ["Soporte", "Colaboración", "Legal", "Prensa", "Otro"] as const;

const contactSchema = z.object({
    topic: z.enum(CONTACT_TOPICS),
    name: z.string().trim().min(1, "Indica tu nombre.").max(120, "Nombre demasiado largo."),
    email: z.string().trim().email("Email no válido."),
    message: z
        .string()
        .trim()
        .min(10, "Cuéntanos un poco más (mín. 10 caracteres).")
        .max(5000, "El mensaje no puede superar 5000 caracteres."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
    useSeo({
        type: "static",
        title: "Contacto · Appquilar",
        description: "Contacta con el equipo de Appquilar.",
    });

    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { mutateAsync: sendContactMessage, isPending } = useSendContactMessage();
    const { execute, isLoadingConfig } = useRecaptchaToken();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            topic: "Soporte",
            name: "",
            email: "",
            message: "",
        },
    });

    const handleSubmit = async (values: ContactFormValues) => {
        setSubmitSuccess(null);
        setSubmitError(null);

        try {
            const captchaToken = await execute("contact_form");

            await sendContactMessage({
                topic: values.topic,
                name: values.name,
                email: values.email,
                message: values.message,
                captchaToken,
            });

            setSubmitSuccess("Mensaje enviado correctamente. Te responderemos lo antes posible.");
            form.reset({
                topic: "Soporte",
                name: "",
                email: "",
                message: "",
            });
        } catch (error) {
            const errors = (error as { payload?: { errors?: Record<string, string[]> } })?.payload?.errors;
            if (errors) {

                if (errors.name?.[0]) form.setError("name", { type: "server", message: errors.name[0] });
                if (errors.email?.[0]) form.setError("email", { type: "server", message: errors.email[0] });
                if (errors.topic?.[0]) form.setError("topic", { type: "server", message: errors.topic[0] });
                if (errors.message?.[0]) form.setError("message", { type: "server", message: errors.message[0] });

                if (errors.captchaToken?.[0]) {
                    setSubmitError("No se pudo validar reCAPTCHA. Por favor, inténtalo de nuevo.");
                    return;
                }
            }

            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "No se pudo enviar el formulario en este momento."
            );
        }
    };

    return (
        <div className="public-marketplace min-h-screen flex flex-col">
            <Header />

            <main className="public-main public-section flex-1">
                <div className="mx-auto w-full max-w-3xl">
                    <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                        Contacto
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        Escríbenos y te responderemos lo antes posible.
                    </p>

                    <div className="mt-10 rounded-xl border border-border bg-background p-6 md:p-8 shadow-sm">
                        <Form {...form}>
                            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                                {submitSuccess && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                        {submitSuccess}
                                    </div>
                                )}

                                {submitError && (
                                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        {submitError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tema</FormLabel>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecciona un tema" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CONTACT_TOPICS.map((topic) => (
                                                                <SelectItem key={topic} value={topic}>
                                                                    {topic}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Tu nombre" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="email" placeholder="tu@email.com" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mensaje</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            className="min-h-[180px]"
                                                            placeholder="¿En qué podemos ayudarte?"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                                    <div className="text-xs text-muted-foreground">
                                        Este formulario está protegido por reCAPTCHA.
                                    </div>

                                    <Button type="submit" disabled={isPending || isLoadingConfig}>
                                        {isPending ? "Enviando..." : "Enviar"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        También puedes escribir directamente a{" "}
                        <span className="font-medium text-foreground">{CONTACT_EMAIL}</span>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
