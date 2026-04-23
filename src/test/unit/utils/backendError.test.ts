import { describe, expect, it } from "vitest";

import {
  extractBackendErrorCode,
  extractBackendErrorMessage,
  extractBackendErrorStatus,
  getErrorMessage,
} from "@/utils/backendError";

describe("backendError utils", () => {
  it("extracts the first backend error code from strings and payload arrays", () => {
    expect(
      extractBackendErrorCode({
        payload: {
          error: ["billing.failed", "ignored"],
        },
      })
    ).toBe("billing.failed");

    expect(
      extractBackendErrorCode({
        error: "auth.unauthorized",
      })
    ).toBe("auth.unauthorized");
  });

  it("prioritizes validation errors before backend codes and messages", () => {
    expect(
      extractBackendErrorMessage({
        payload: {
          errors: {
            email: ["Email obligatorio."],
            message: ["Otro error"],
          },
          error: ["auth.unauthorized"],
          message: "Mensaje genérico",
        },
      })
    ).toBe("Email obligatorio.");
  });

  it("falls back to payload messages, native errors and null when necessary", () => {
    expect(
      extractBackendErrorMessage({
        payload: {
          message: "No se pudo guardar.",
        },
      })
    ).toBe("No se pudo guardar.");

    expect(extractBackendErrorMessage(new Error("Red caída"))).toBe("Red caída");
    expect(extractBackendErrorMessage({ payload: { message: "   " } })).toBeNull();
  });

  it("reads numeric status codes and fallback messages", () => {
    expect(extractBackendErrorStatus({ status: 422 })).toBe(422);
    expect(extractBackendErrorStatus({ status: "422" })).toBeNull();
    expect(getErrorMessage({ payload: { error: ["blog.unavailable"] } }, "Fallback")).toBe(
      "blog.unavailable"
    );
    expect(getErrorMessage({}, "Fallback")).toBe("Fallback");
  });

  it("extracts direct validation strings and ignores malformed payload shapes safely", () => {
    expect(
      extractBackendErrorMessage({
        payload: {
          errors: {
            slug: "Slug duplicado.",
            image: [null, "Imagen inválida."],
          },
        },
      })
    ).toBe("Slug duplicado.");

    expect(
      extractBackendErrorCode({
        payload: {
          error: [null, 5, "products.unavailable"],
        },
      })
    ).toBe("products.unavailable");

    expect(extractBackendErrorCode({ payload: { error: ["   "] } })).toBe("   ");
    expect(extractBackendErrorMessage({ payload: { errors: "not-an-object" } })).toBeNull();
    expect(extractBackendErrorStatus(null)).toBeNull();
    expect(
      extractBackendErrorMessage({
        payload: {
          errors: {
            field: [null, false],
          },
        },
      })
    ).toBeNull();
    expect(extractBackendErrorMessage(5)).toBeNull();
    expect(extractBackendErrorMessage(new Error("   "))).toBeNull();
  });

  it("falls back to direct payload values when the wrapper uses the root error object", () => {
    expect(
      extractBackendErrorMessage({
        errors: {
          email: ["Email inválido."],
        },
      })
    ).toBe("Email inválido.");

    expect(
      extractBackendErrorMessage({
        error: "companies.invitation.invalid",
      })
    ).toBe("companies.invitation.invalid");

    expect(
      extractBackendErrorMessage({
        message: "No se pudo continuar.",
      })
    ).toBe("No se pudo continuar.");
  });

  it("returns null for non-string codes and non-record payloads", () => {
    expect(extractBackendErrorCode({ payload: { error: [null, false] } })).toBeNull();
    expect(extractBackendErrorCode({ payload: { error: 5 } })).toBeNull();
    expect(extractBackendErrorMessage({ payload: null })).toBeNull();
    expect(extractBackendErrorStatus({ payload: { status: 422 } })).toBeNull();
  });
});
