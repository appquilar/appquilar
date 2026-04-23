import { describe, expect, it } from "vitest";

import {
    isNumericDynamicPropertyType,
    isOptionDynamicPropertyType,
    pruneDynamicProperties,
    resolveDynamicPropertyDisplayItems,
    sanitizeDynamicProperties,
    validateDynamicProperties,
} from "@/domain/services/DynamicPropertyService";
import type { DynamicPropertyDefinition } from "@/domain/models/DynamicProperty";

const definitions: DynamicPropertyDefinition[] = [
    {
        code: "power",
        label: "Potencia",
        type: "decimal",
        filterable: true,
        unit: "W",
    },
    {
        code: "phases",
        label: "Fases",
        type: "integer",
        filterable: true,
    },
    {
        code: "finish",
        label: "Acabado",
        type: "select",
        filterable: true,
        options: [
            { value: "mate", label: "Mate" },
            { value: "gloss", label: "Brillo" },
        ],
    },
    {
        code: "features",
        label: "Prestaciones",
        type: "multi_select",
        filterable: true,
        options: [
            { value: "waterproof", label: "Impermeable" },
            { value: "portable", label: "Portátil" },
        ],
    },
    {
        code: "warranty",
        label: "Garantía",
        type: "boolean",
        filterable: true,
    },
];

describe("DynamicPropertyService", () => {
    it("classifies numeric and option property types", () => {
        expect(isNumericDynamicPropertyType("integer")).toBe(true);
        expect(isNumericDynamicPropertyType("decimal")).toBe(true);
        expect(isNumericDynamicPropertyType("select")).toBe(false);

        expect(isOptionDynamicPropertyType("boolean")).toBe(true);
        expect(isOptionDynamicPropertyType("select")).toBe(true);
        expect(isOptionDynamicPropertyType("multi_select")).toBe(true);
        expect(isOptionDynamicPropertyType("decimal")).toBe(false);
    });

    it("prunes and sanitizes select, multi-select and numeric values", () => {
        const values = {
            power: "1500,5",
            phases: "3",
            finish: " mate ",
            features: ["portable", "portable", "", "waterproof", 1],
            warranty: true,
            ignored: "descartar",
        };

        expect(pruneDynamicProperties(values, definitions)).toEqual({
            power: 1500.5,
            phases: 3,
            finish: "mate",
            features: ["portable", "waterproof"],
            warranty: true,
        });

        expect(sanitizeDynamicProperties(values, definitions)).toEqual({
            power: 1500.5,
            phases: 3,
            finish: "mate",
            features: ["portable", "waterproof"],
            warranty: true,
        });
    });

    it("reports type-specific validation errors without flagging empty values", () => {
        expect(
            validateDynamicProperties(
                {
                    power: "abc",
                    phases: "3.5",
                    finish: "invalid",
                    features: ["unknown"],
                    warranty: "sí",
                    empty_finish: "",
                },
                definitions
            )
        ).toEqual({
            power: "Introduce un número válido.",
            phases: "Introduce un número entero válido.",
            finish: "Selecciona una opción válida.",
            features: "Selecciona una o varias opciones válidas.",
            warranty: "Selecciona sí o no.",
        });
    });

    it("formats display items with option labels, units, localized numbers and fallback labels", () => {
        expect(
            resolveDynamicPropertyDisplayItems(
                {
                    finish: "mate",
                    power: 1500.5,
                    warranty: false,
                    features: ["portable", "waterproof", ""],
                    custom_metric: "Manual",
                    blank_text: "   ",
                },
                definitions
            )
        ).toEqual([
            { code: "power", label: "Potencia", value: "1500,5 W" },
            { code: "finish", label: "Acabado", value: "Mate" },
            { code: "features", label: "Prestaciones", value: "Portátil, Impermeable" },
            { code: "warranty", label: "Garantía", value: "No" },
            { code: "custom_metric", label: "Custom Metric", value: "Manual" },
        ]);
    });

    it("handles unsupported definitions and malformed values safely", () => {
        const unsupportedDefinition = {
            code: "legacy",
            label: "Legacy",
            type: "legacy" as never,
            filterable: false,
        } as DynamicPropertyDefinition;

        expect(
            pruneDynamicProperties(
                {
                    legacy: "deprecated",
                    phases: Number.POSITIVE_INFINITY,
                    finish: "   ",
                    features: [],
                    warranty: null,
                },
                [...definitions, unsupportedDefinition]
            )
        ).toEqual({});

        expect(
            validateDynamicProperties(
                { legacy: "deprecated" },
                [unsupportedDefinition]
            )
        ).toEqual({
            legacy: "Valor no válido.",
        });
    });

    it("formats raw values gracefully when definitions are missing or partially configured", () => {
        expect(
            resolveDynamicPropertyDisplayItems(
                {
                    fases_motor: 3,
                    colors: ["red", "blue"],
                    enabled: true,
                },
                []
            )
        ).toEqual([
            { code: "colors", label: "Colors", value: "red, blue" },
            { code: "enabled", label: "Enabled", value: "Sí" },
            { code: "fases_motor", label: "Fases Motor", value: "3" },
        ]);
    });

    it("drops invalid numeric, select and multi-select values during sanitization", () => {
        expect(
            sanitizeDynamicProperties(
                {
                    power: Number.NaN,
                    phases: "  ",
                    finish: "desconocido",
                    features: [1, null],
                    warranty: "true",
                },
                definitions
            )
        ).toEqual({});
    });

    it("accepts permissive select and multi-select definitions when there is no explicit option catalog", () => {
        const permissiveDefinitions: DynamicPropertyDefinition[] = [
            {
                code: "material",
                label: "Material",
                type: "select",
                filterable: true,
            },
            {
                code: "extras",
                label: "Extras",
                type: "multi_select",
                filterable: true,
            },
        ];

        expect(
            sanitizeDynamicProperties(
                {
                    material: " aluminio ",
                    extras: [" ruedas ", " asas ", "ruedas", ""],
                },
                permissiveDefinitions
            )
        ).toEqual({
            material: "aluminio",
            extras: ["ruedas", "asas"],
        });
    });

    it("formats integers, unknown array values and boolean false values gracefully", () => {
        expect(
            resolveDynamicPropertyDisplayItems(
                {
                    phases: 4,
                    features: ["portable", "legacy-option"],
                    warranty: false,
                },
                definitions
            )
        ).toEqual([
            { code: "phases", label: "Fases", value: "4" },
            { code: "features", label: "Prestaciones", value: "Portátil, legacy-option" },
            { code: "warranty", label: "Garantía", value: "No" },
        ]);
    });

    it("ignores empty values during validation and keeps valid booleans and numbers", () => {
        expect(
            validateDynamicProperties(
                {
                    power: 12.5,
                    phases: 2,
                    warranty: false,
                    finish: "",
                    features: [],
                },
                definitions
            )
        ).toEqual({});

        expect(
            pruneDynamicProperties(
                {
                    power: 12.5,
                    phases: 2,
                    warranty: false,
                },
                definitions
            )
        ).toEqual({
            power: 12.5,
            phases: 2,
            warranty: false,
        });
    });
});
