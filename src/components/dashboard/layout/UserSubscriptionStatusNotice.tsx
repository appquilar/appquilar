import type { MouseEvent } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/domain/models/UserRole";

const UserSubscriptionStatusNotice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, hasRole } = useAuth();
  const isPlatformAdmin = hasRole(UserRole.ADMIN);
  const hasCompanyContext = Boolean(
    currentUser?.companyContext?.companyId ?? currentUser?.companyId
  );
  const subscriptionTargetHash = "#user-subscription-settings";

  if (!currentUser || hasCompanyContext || isPlatformAdmin) {
    return null;
  }

  const isScheduledForCancellation =
    currentUser.subscriptionStatus === "active" &&
    currentUser.subscriptionCancelAtPeriodEnd === true;

  if (currentUser.subscriptionStatus === "active" && !isScheduledForCancellation) {
    return null;
  }

  const isPaused = currentUser.subscriptionStatus === "paused";
  const actionLabel = "Abrir suscripcion";
  const title = isScheduledForCancellation
    ? "Tu suscripcion User Pro terminara al final del periodo actual"
    : isPaused
    ? "Detectamos un problema de pago en tu suscripcion User Pro"
    : "Tu suscripcion User Pro esta cancelada";
  const body = isScheduledForCancellation
    ? "Seguiras teniendo acceso hasta entonces. Si fue un error, desde la suscripcion puedes mantener User Pro sin abrir un checkout nuevo."
    : isPaused
    ? "Stripe esta reintentando el cobro. Revisa la suscripcion para recuperar metricas y beneficios de User Pro."
    : "Actualmente estas en modo Explorador. Inicia una nueva activacion de User Pro para recuperar el plan de pago.";

  const handleOpenSubscription = (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== "/dashboard/config") {
      return;
    }

    const target = document.getElementById("user-subscription-settings");
    if (!target) {
      return;
    }

    event.preventDefault();
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: subscriptionTargetHash,
      },
      { replace: false }
    );
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-slate-900 sm:px-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div className="space-y-2">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-slate-700">{body}</p>
          <Link
            to="/dashboard/config#user-subscription-settings"
            onClick={handleOpenSubscription}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F19D70] transition-opacity hover:opacity-80"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionStatusNotice;
