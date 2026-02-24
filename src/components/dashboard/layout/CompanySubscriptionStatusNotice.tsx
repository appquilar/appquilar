import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const CompanySubscriptionStatusNotice = () => {
    const { currentUser } = useAuth();
    const companyContext = currentUser?.companyContext ?? null;

    if (!companyContext) {
        return null;
    }

    if (!companyContext.isCompanyOwner) {
        return null;
    }

    if (companyContext.subscriptionStatus === "active") {
        return null;
    }

    const isPaused = companyContext.subscriptionStatus === "paused";
    const title = isPaused
        ? "Hay un problema con el cobro de la suscripcion de empresa"
        : "La suscripcion de tu empresa esta cancelada";
    const body = isPaused
        ? "Stripe esta reintentando el cobro. Revisa la gestion de la suscripcion para evitar restricciones en el equipo."
        : "La empresa ha perdido el acceso por falta de pago. Revisa la gestion de la suscripcion para reactivarla o migra a modo Explorador.";

    return (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-slate-900 sm:px-5">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="space-y-2">
                    <p className="text-sm font-semibold">
                        {title}
                    </p>
                    <p className="text-sm text-slate-700">
                        {body}
                    </p>
                    <Link
                        to={`/dashboard/companies/${companyContext.companyId}`}
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

export default CompanySubscriptionStatusNotice;
