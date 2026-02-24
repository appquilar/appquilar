import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const UserSubscriptionStatusNotice = () => {
  const { currentUser } = useAuth();
  const hasCompanyContext = Boolean(
    currentUser?.companyContext?.companyId ?? currentUser?.companyId
  );

  if (!currentUser || hasCompanyContext) {
    return null;
  }

  if (currentUser.subscriptionStatus === "active") {
    return null;
  }

  const isPaused = currentUser.subscriptionStatus === "paused";
  const title = isPaused
    ? "Detectamos un problema de pago en tu suscripcion User Pro"
    : "Tu suscripcion User Pro esta cancelada";
  const body = isPaused
    ? "Stripe esta reintentando el cobro. Revisa la suscripcion para recuperar metricas y beneficios de User Pro."
    : "Actualmente estas en modo Explorador. Reactiva User Pro desde Stripe para recuperar el plan de pago.";

  return (
    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-slate-900 sm:px-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div className="space-y-2">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-slate-700">{body}</p>
          <Link
            to="/dashboard/config"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F19D70] transition-opacity hover:opacity-80"
          >
            Gestionar suscripcion
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionStatusNotice;
