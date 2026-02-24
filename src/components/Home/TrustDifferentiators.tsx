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
    <div className="w-full rounded-none border-y border-border/60 bg-muted/10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {DIFFERENTIATORS.map(({ title, description, Icon, accent, border }) => (
          <div
            key={title}
            className={`border-b md:border-b border-border/50 xl:border-b-0 xl:border-r last:border-r-0 ${border} bg-gradient-to-br ${accent} p-5 md:p-6 transition-colors`}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustDifferentiators;
