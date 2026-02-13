import { Building2, CalendarDays, MessageCircle, BarChart3 } from "lucide-react";

const DIFFERENTIATORS = [
  {
    title: "Especialización profesional",
    description:
      "Solo productos, sin coches ni viviendas. Marketplace enfocado en alquiler real y práctico.",
    Icon: Building2,
    accent: "from-orange-50/80 to-white",
    border: "border-orange-200/70",
  },
  {
    title: "Calendario de disponibilidad",
    description:
      "Gestiona disponibilidad real. Evita dobles reservas y controla fechas fácilmente.",
    Icon: CalendarDays,
    accent: "from-amber-50/80 to-white",
    border: "border-amber-200/70",
  },
  {
    title: "Comunicación integrada",
    description:
      "Mensajería directa entre empresa y cliente sin salir de la plataforma.",
    Icon: MessageCircle,
    accent: "from-rose-50/80 to-white",
    border: "border-rose-200/70",
  },
  {
    title: "Gestión profesional",
    description:
      "Panel con estadísticas, control de productos y seguimiento de alquileres.",
    Icon: BarChart3,
    accent: "from-sky-50/80 to-white",
    border: "border-sky-200/70",
  },
];

const TrustDifferentiators = () => {
  return (
    <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            Diferenciadores clave
          </div>
          <h2 className="mt-4 text-3xl font-display font-semibold tracking-tight">
            La confianza reduce la fricción en los alquileres
          </h2>
          <p className="mt-3 text-muted-foreground">
            Por eso Appquilar está construido para dar seguridad y claridad en cada reserva.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map(({ title, description, Icon, accent, border }) => (
            <div
              key={title}
              className={`rounded-xl border ${border} bg-gradient-to-br ${accent} p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">
            ¿Tienes productos que no están generando ingresos?
          </p>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            Publica gratis en Appquilar
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrustDifferentiators;
