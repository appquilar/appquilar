import type { PlatformMetricCard } from "@/domain/models/AdminPlatformAnalytics";

const formatCount = (value: number): string => {
    if (Number.isInteger(value)) {
        return value.toLocaleString("es-ES");
    }

    return value.toLocaleString("es-ES", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
};

export const formatPlatformMetricValue = (card: Pick<PlatformMetricCard, "format" | "value">): string => {
    if (card.value == null) {
        return "No disponible";
    }

    if (card.format === "percentage") {
        return `${(card.value * 100).toLocaleString("es-ES", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        })}%`;
    }

    if (card.format === "duration_minutes") {
        const minutes = Math.max(0, Math.round(card.value));
        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} h`;
        }

        return `${hours} h ${remainingMinutes} min`;
    }

    return formatCount(card.value);
};

export const formatPlainMetricValue = (
    value: number | null | undefined,
    format: PlatformMetricCard["format"] = "count"
): string => formatPlatformMetricValue({ value: value ?? null, format });

export const formatDemandOfferRatio = (value: number): string =>
    `${value.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} conv./producto`;
