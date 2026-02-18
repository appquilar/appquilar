import { Gem } from "lucide-react";
import { toast } from "sonner";

import { useCreateCheckoutSession } from "@/application/hooks/useBilling";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/infrastructure/http/ApiClient";

interface UpgradeToProLinkProps {
  onAfterNavigate?: () => void;
}

const UpgradeToProLink = ({ onAfterNavigate }: UpgradeToProLinkProps) => {
  const { currentUser } = useAuth();
  const createCheckoutMutation = useCreateCheckoutSession();

  if (!currentUser) {
    return null;
  }

  const hasCompanyProfile = Boolean(
    currentUser.companyContext?.companyId ?? currentUser.companyId
  );
  const isUserPro = currentUser.planType === "user_pro";

  if (hasCompanyProfile || isUserPro) {
    return null;
  }

  const handleUpgradeToPro = async () => {
    const currentUrl = window.location.href;

    try {
      const checkoutSession = await createCheckoutMutation.mutateAsync({
        scope: "user",
        planType: "user_pro",
        successUrl: currentUrl,
        cancelUrl: currentUrl,
      });

      onAfterNavigate?.();
      window.location.assign(checkoutSession.url);
    } catch (error) {
      console.error("Error creating user checkout session", error);
      const backendError = extractBackendErrorMessage(error);
      toast.error(
        backendError ?? "No se pudo iniciar el checkout para el plan Pro."
      );
    }
  };

  return (
    <button
      onClick={() => {
        void handleUpgradeToPro();
      }}
      disabled={createCheckoutMutation.isPending}
      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left transition-colors hover:bg-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-orange-600">
            {createCheckoutMutation.isPending ? "Redirigiendo..." : "Hazte Pro"}
          </p>
          <p className="text-xs text-zinc-600">
            Accede a metricas de visitas y mensajes por producto.
          </p>
        </div>
        <Gem size={16} className="mt-1 shrink-0 text-orange-500" />
      </div>
    </button>
  );
};

const extractBackendErrorMessage = (error: unknown): string | null => {
  if (!(error instanceof ApiError)) {
    return null;
  }

  const payload = error.payload as { error?: unknown } | undefined;
  const backendError = payload?.error;

  if (Array.isArray(backendError) && typeof backendError[0] === "string") {
    return backendError[0];
  }

  if (typeof backendError === "string") {
    return backendError;
  }

  return null;
};

export default UpgradeToProLink;
