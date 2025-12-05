// src/domain/valueObjects/Uuid.ts

/**
 * Lightweight UUID v4 generator and validator.
 * Used across the entire frontend (domain-safe).
 */
export class Uuid {
    private constructor(private readonly value: string) {}

    public static generate(): Uuid {
        const uuid = Uuid.generateUuidV4();
        return new Uuid(uuid);
    }

    public static fromString(id: string): Uuid {
        if (!Uuid.isValid(id)) {
            throw new Error(`Invalid UUID: ${id}`);
        }
        return new Uuid(id);
    }

    public toString(): string {
        return this.value;
    }

    // ---- Static helpers ----

    /**
     * UUID v4 generation using Web Crypto API when available.
     * Falls back to Math.random() when running in non-crypto environments (SSR, tests).
     */
    private static generateUuidV4(): string {
        if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
            return crypto.randomUUID();
        }

        // Fallback implementation (not cryptographically guaranteed)
        const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return template.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * UUID v4 validator
     */
    public static isValid(value: string): boolean {
        const regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regex.test(value);
    }
}
