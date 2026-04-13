const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const asString = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const extractFirstValidationError = (errors: unknown): string | null => {
    if (!isRecord(errors)) {
        return null;
    }

    for (const value of Object.values(errors)) {
        if (Array.isArray(value)) {
            const firstString = value.find((item): item is string => typeof item === "string");
            if (firstString) {
                return firstString;
            }
        }

        const directValue = asString(value);
        if (directValue) {
            return directValue;
        }
    }

    return null;
};

const getPayload = (error: unknown): Record<string, unknown> | null => {
    if (!isRecord(error)) {
        return null;
    }

    if (isRecord(error.payload)) {
        return error.payload;
    }

    return error;
};

export const extractBackendErrorCode = (error: unknown): string | null => {
    const payload = getPayload(error);
    const backendError = payload?.error;

    if (Array.isArray(backendError)) {
        return backendError.find((value): value is string => typeof value === "string") ?? null;
    }

    return asString(backendError);
};

export const extractBackendErrorMessage = (error: unknown): string | null => {
    const payload = getPayload(error);

    const firstValidationError = extractFirstValidationError(payload?.errors);
    if (firstValidationError) {
        return firstValidationError;
    }

    const backendError = extractBackendErrorCode(error);
    if (backendError) {
        return backendError;
    }

    const payloadMessage = asString(payload?.message);
    if (payloadMessage) {
        return payloadMessage;
    }

    if (error instanceof Error) {
        return asString(error.message);
    }

    return null;
};

export const extractBackendErrorStatus = (error: unknown): number | null => {
    if (!isRecord(error)) {
        return null;
    }

    return typeof error.status === "number" ? error.status : null;
};

export const getErrorMessage = (error: unknown, fallback: string): string =>
    extractBackendErrorMessage(error) ?? fallback;
