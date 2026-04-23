import type {
    DynamicPropertyDefinition,
    DynamicPropertyType,
    ProductDynamicProperties,
    ProductDynamicPropertyValue,
} from "@/domain/models/DynamicProperty";

export const isNumericDynamicPropertyType = (type: DynamicPropertyType): boolean =>
    type === "integer" || type === "decimal";

export const isOptionDynamicPropertyType = (type: DynamicPropertyType): boolean =>
    type === "boolean" || type === "select" || type === "multi_select";

export const pruneDynamicProperties = (
    values: Record<string, unknown>,
    definitions: DynamicPropertyDefinition[]
): Record<string, unknown> => {
    const definitionsByCode = new Map(definitions.map((definition) => [definition.code, definition]));
    const pruned: Record<string, unknown> = {};

    for (const [code, rawValue] of Object.entries(values)) {
        const definition = definitionsByCode.get(code);
        if (!definition) {
            continue;
        }

        const sanitized = sanitizeDynamicPropertyValue(rawValue, definition);
        if (sanitized !== undefined) {
            pruned[code] = sanitized;
        }
    }

    return pruned;
};

export const validateDynamicProperties = (
    values: Record<string, unknown>,
    definitions: DynamicPropertyDefinition[]
): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const definition of definitions) {
        const rawValue = values[definition.code];
        if (
            rawValue === undefined
            || rawValue === null
            || rawValue === ""
            || (Array.isArray(rawValue) && rawValue.length === 0)
        ) {
            continue;
        }

        if (sanitizeDynamicPropertyValue(rawValue, definition) === undefined) {
            errors[definition.code] = getDynamicPropertyErrorMessage(definition.type);
        }
    }

    return errors;
};

export const sanitizeDynamicProperties = (
    values: Record<string, unknown>,
    definitions: DynamicPropertyDefinition[]
): ProductDynamicProperties => {
    const sanitizedEntries = definitions.flatMap((definition) => {
        const sanitizedValue = sanitizeDynamicPropertyValue(values[definition.code], definition);
        if (sanitizedValue === undefined) {
            return [];
        }

        return [[definition.code, sanitizedValue] as const];
    });

    return Object.fromEntries(sanitizedEntries);
};

export interface ResolvedDynamicPropertyDisplayItem {
    code: string;
    label: string;
    value: string;
}

export const resolveDynamicPropertyDisplayItems = (
    values: ProductDynamicProperties,
    definitions: DynamicPropertyDefinition[]
): ResolvedDynamicPropertyDisplayItem[] => {
    const definitionsByCode = new Map(definitions.map((definition) => [definition.code, definition]));
    const definitionOrder = new Map(definitions.map((definition, index) => [definition.code, index]));

    return Object.entries(values)
        .map(([code, rawValue]) => {
            const definition = definitionsByCode.get(code);
            const formattedValue = formatDynamicPropertyValue(rawValue, definition);

            if (!formattedValue) {
                return null;
            }

            return {
                code,
                label: definition?.label ?? humanizeDynamicPropertyCode(code),
                value: formattedValue,
            };
        })
        .filter((item): item is ResolvedDynamicPropertyDisplayItem => item !== null)
        .sort((left, right) => {
            const leftOrder = definitionOrder.get(left.code) ?? Number.MAX_SAFE_INTEGER;
            const rightOrder = definitionOrder.get(right.code) ?? Number.MAX_SAFE_INTEGER;

            if (leftOrder !== rightOrder) {
                return leftOrder - rightOrder;
            }

            return left.label.localeCompare(right.label);
        });
};

const sanitizeDynamicPropertyValue = (
    rawValue: unknown,
    definition: DynamicPropertyDefinition
): ProductDynamicPropertyValue | undefined => {
    switch (definition.type) {
        case "boolean":
            return typeof rawValue === "boolean" ? rawValue : undefined;
        case "select":
            return sanitizeSelectValue(rawValue, definition);
        case "multi_select":
            return sanitizeMultiSelectValue(rawValue, definition);
        case "integer":
            return sanitizeNumericValue(rawValue, true);
        case "decimal":
            return sanitizeNumericValue(rawValue, false);
        default:
            return undefined;
    }
};

const formatDynamicPropertyValue = (
    rawValue: ProductDynamicPropertyValue,
    definition?: DynamicPropertyDefinition
): string | null => {
    if (typeof rawValue === "boolean") {
        return rawValue ? "Sí" : "No";
    }

    if (typeof rawValue === "number") {
        const formattedNumber = Number.isInteger(rawValue) ? String(rawValue) : rawValue.toLocaleString("es-ES");
        return definition?.unit ? `${formattedNumber} ${definition.unit}` : formattedNumber;
    }

    if (typeof rawValue === "string") {
        if (rawValue.trim().length === 0) {
            return null;
        }

        const optionLabel = definition?.options?.find((option) => option.value === rawValue)?.label;
        return optionLabel ?? rawValue;
    }

    if (Array.isArray(rawValue)) {
        const formattedValues = rawValue
            .map((value) => definition?.options?.find((option) => option.value === value)?.label ?? value)
            .filter((value) => value.trim().length > 0);

        return formattedValues.length > 0 ? formattedValues.join(", ") : null;
    }

    return null;
};

const humanizeDynamicPropertyCode = (code: string): string =>
    code
        .split("_")
        .filter((segment) => segment.length > 0)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

const sanitizeSelectValue = (
    rawValue: unknown,
    definition: DynamicPropertyDefinition
): string | undefined => {
    if (typeof rawValue !== "string") {
        return undefined;
    }

    const trimmed = rawValue.trim();
    if (trimmed.length === 0) {
        return undefined;
    }

    const allowedValues = new Set((definition.options ?? []).map((option) => option.value));
    if (allowedValues.size > 0 && !allowedValues.has(trimmed)) {
        return undefined;
    }

    return trimmed;
};

const sanitizeMultiSelectValue = (
    rawValue: unknown,
    definition: DynamicPropertyDefinition
): string[] | undefined => {
    if (!Array.isArray(rawValue)) {
        return undefined;
    }

    const allowedValues = new Set((definition.options ?? []).map((option) => option.value));
    const sanitizedValues = rawValue
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .filter((value) => allowedValues.size === 0 || allowedValues.has(value));

    return sanitizedValues.length > 0 ? Array.from(new Set(sanitizedValues)) : undefined;
};

const sanitizeNumericValue = (
    rawValue: unknown,
    integerOnly: boolean
): number | undefined => {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
        return undefined;
    }

    if (typeof rawValue === "number") {
        if (!Number.isFinite(rawValue)) {
            return undefined;
        }

        return integerOnly ? (Number.isInteger(rawValue) ? rawValue : undefined) : rawValue;
    }

    if (typeof rawValue !== "string") {
        return undefined;
    }

    const normalized = rawValue.replace(",", ".").trim();
    if (normalized.length === 0) {
        return undefined;
    }

    const parsedValue = Number(normalized);
    if (!Number.isFinite(parsedValue)) {
        return undefined;
    }

    if (integerOnly && !Number.isInteger(parsedValue)) {
        return undefined;
    }

    return parsedValue;
};

const getDynamicPropertyErrorMessage = (type: DynamicPropertyType): string => {
    switch (type) {
        case "boolean":
            return "Selecciona sí o no.";
        case "select":
            return "Selecciona una opción válida.";
        case "multi_select":
            return "Selecciona una o varias opciones válidas.";
        case "integer":
            return "Introduce un número entero válido.";
        case "decimal":
            return "Introduce un número válido.";
        default:
            return "Valor no válido.";
    }
};
