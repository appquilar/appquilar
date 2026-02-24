import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    question: "¿Cómo funciona Appquilar?",
    answer:
      "Appquilar es un marketplace donde empresas y particulares publican productos para alquilar. Puedes buscar, contactar con el propietario y acordar las fechas de alquiler directamente desde la plataforma.",
  },
  {
    question: "¿Tengo que pagar para alquilar?",
    answer:
      "El pago y las condiciones dependen del propietario del producto. Appquilar facilita el contacto y la gestión del alquiler.",
  },
  {
    question: "¿Qué pasa si el producto se daña?",
    answer:
      "Las condiciones de uso y responsabilidad se acuerdan entre ambas partes. Recomendamos revisar siempre las condiciones antes de confirmar el alquiler.",
  },
  {
    question: "¿Puedo cancelar un alquiler?",
    answer:
      "Sí, pero las condiciones de cancelación dependen del propietario. Consulta siempre la política antes de cerrar el acuerdo.",
  },
  {
    question: "¿Cómo publico un producto?",
    answer:
      "Crea una cuenta gratuita, añade fotos, descripción y disponibilidad. En pocos minutos tu producto estará visible.",
  },
  {
    question: "¿Es solo para empresas?",
    answer:
      "No. Pueden publicar tanto empresas como particulares. Las empresas disponen de herramientas de gestión más avanzadas.",
  },
  {
    question: "¿Cómo sé si un proveedor es fiable?",
    answer:
      "Puedes ver: perfil público, productos publicados, información de empresa e historial dentro de la plataforma.",
  },
  {
    question: "¿Appquilar alquila coches o viviendas?",
    answer:
      "No. Appquilar está especializado en alquiler de productos, herramientas y equipamiento.",
  },
];

const FaqSection = () => {
  return (
    <section className="public-section">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            Preguntas frecuentes
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-display font-semibold tracking-tight">
            Resolvemos las dudas más comunes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Encuentra respuestas rápidas antes de publicar o alquilar.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-white shadow-sm">
          <Accordion type="single" collapsible className="divide-y">
            {FAQS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`} className="px-6">
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
