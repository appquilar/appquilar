import { ArrowDownRight, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

import type { AdvancedStatsDelta, AdvancedStatsTrendPreference } from "@/domain/models/CompanyAdvancedStats";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdvancedStatsDeltaBadgeProps {
    delta: AdvancedStatsDelta;
    trendPreference?: AdvancedStatsTrendPreference;
}

const formatDeltaLabel = (delta: AdvancedStatsDelta): string => {
    if (delta.kind === "new") {
        return "Nuevo";
    }

    if (delta.kind === "neutral") {
        return "0%";
    }

    const prefix = delta.percentageChange > 0 ? "+" : "";
    return `${prefix}${delta.percentageChange.toFixed(1)}%`;
};

const isPositiveDelta = (
    delta: AdvancedStatsDelta,
    trendPreference: AdvancedStatsTrendPreference
): boolean => {
    if (delta.kind === "new") {
        return true;
    }

    if (delta.kind === "neutral") {
        return false;
    }

    if (trendPreference === "lower") {
        return delta.absoluteChange < 0;
    }

    return delta.absoluteChange > 0;
};

export const AdvancedStatsDeltaBadge = ({
    delta,
    trendPreference = "higher",
}: AdvancedStatsDeltaBadgeProps) => {
    const positive = isPositiveDelta(delta, trendPreference);

    const Icon = (() => {
        if (delta.kind === "new") {
            return Sparkles;
        }

        if (delta.kind === "neutral") {
            return ArrowRight;
        }

        return positive ? ArrowUpRight : ArrowDownRight;
    })();

    return (
        <Badge
            variant="secondary"
            className={cn(
                "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                delta.kind === "neutral" && "bg-slate-100 text-slate-600",
                delta.kind === "new" && "bg-emerald-100 text-emerald-700",
                delta.kind !== "neutral" &&
                    delta.kind !== "new" &&
                    positive &&
                    "bg-emerald-100 text-emerald-700",
                delta.kind !== "neutral" &&
                    delta.kind !== "new" &&
                    !positive &&
                    "bg-rose-100 text-rose-700"
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {formatDeltaLabel(delta)}
        </Badge>
    );
};
