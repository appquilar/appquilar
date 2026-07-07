import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useRecaptchaToken } from "@/application/hooks/useCaptcha";

const getConfigMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
  captchaService: {
    getConfig: (...args: unknown[]) => getConfigMock(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const getRecaptchaScript = async (): Promise<HTMLScriptElement> => {
  await waitFor(() => {
    expect(document.getElementById("google-recaptcha-script")).toBeInstanceOf(HTMLScriptElement);
  });

  return document.getElementById("google-recaptcha-script") as HTMLScriptElement;
};

describe("useRecaptchaToken", () => {
  beforeEach(() => {
    getConfigMock.mockReset();
  });

  afterEach(() => {
    document.getElementById("google-recaptcha-script")?.remove();
    delete window.grecaptcha;
  });

  it("returns the disabled token when captcha is disabled", async () => {
    getConfigMock.mockResolvedValue({ enabled: false, siteKey: null });

    const { result } = renderHook(() => useRecaptchaToken(), { wrapper: createWrapper() });

    await expect(result.current.execute("signup")).resolves.toBe("captcha-disabled");
    expect(getConfigMock).toHaveBeenCalledTimes(1);
  });

  it("rejects enabled captcha when the site key is missing", async () => {
    getConfigMock.mockResolvedValue({ enabled: true, siteKey: "" });

    const { result } = renderHook(() => useRecaptchaToken(), { wrapper: createWrapper() });

    await expect(result.current.execute("signup")).rejects.toThrow(
      "reCAPTCHA no está disponible en este momento."
    );
  });

  it("loads the recaptcha script and executes the requested action", async () => {
    const executeMock = vi.fn().mockResolvedValue("recaptcha-token");
    getConfigMock.mockResolvedValue({ enabled: true, siteKey: "site-key-success" });

    const { result } = renderHook(() => useRecaptchaToken(), { wrapper: createWrapper() });

    const tokenPromise = result.current.execute("signup");
    const script = await getRecaptchaScript();
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: executeMock,
    };

    script.dispatchEvent(new Event("load"));

    await expect(tokenPromise).resolves.toBe("recaptcha-token");
    expect(script.src).toContain("render=site-key-success");
    expect(executeMock).toHaveBeenCalledWith("site-key-success", { action: "signup" });

    await expect(result.current.execute("login")).resolves.toBe("recaptcha-token");
    expect(document.querySelectorAll("#google-recaptcha-script")).toHaveLength(1);
    expect(executeMock).toHaveBeenLastCalledWith("site-key-success", { action: "login" });
  });

  it("surfaces script loading errors", async () => {
    getConfigMock.mockResolvedValue({ enabled: true, siteKey: "site-key-error" });

    const { result } = renderHook(() => useRecaptchaToken(), { wrapper: createWrapper() });

    const tokenPromise = result.current.execute("signup");
    const script = await getRecaptchaScript();

    script.dispatchEvent(new Event("error"));

    await expect(tokenPromise).rejects.toThrow("No se pudo cargar reCAPTCHA.");
  });

  it("surfaces recaptcha execution failures", async () => {
    const executeMock = vi.fn().mockResolvedValue("");
    getConfigMock.mockResolvedValue({ enabled: true, siteKey: "site-key-empty-token" });

    const { result } = renderHook(() => useRecaptchaToken(), { wrapper: createWrapper() });

    const tokenPromise = result.current.execute("signup");
    const script = await getRecaptchaScript();
    window.grecaptcha = {
      ready: (callback) => callback(),
      execute: executeMock,
    };

    script.dispatchEvent(new Event("load"));

    await expect(tokenPromise).rejects.toThrow("No se pudo obtener un token de reCAPTCHA.");
  });
});
