import { afterEach, describe, expect, it, vi } from "vitest";
import { Uuid } from "@/domain/valueObject/uuidv4";

describe("Uuid value object", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("generates UUID using Web Crypto API when randomUUID is available", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "123e4567-e89b-42d3-a456-426614174000"),
    });

    const uuid = Uuid.generate();

    expect(uuid.toString()).toBe("123e4567-e89b-42d3-a456-426614174000");
  });

  it("falls back to Math.random implementation when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});

    const uuid = Uuid.generate().toString();

    expect(Uuid.isValid(uuid)).toBe(true);
  });

  it("creates UUID from valid string and rejects invalid strings", () => {
    const valid = "123e4567-e89b-42d3-a456-426614174000";

    expect(Uuid.fromString(valid).toString()).toBe(valid);
    expect(Uuid.isValid(valid)).toBe(true);
    expect(Uuid.isValid("not-a-uuid")).toBe(false);
    expect(() => Uuid.fromString("invalid")).toThrow("Invalid UUID: invalid");
  });
});

