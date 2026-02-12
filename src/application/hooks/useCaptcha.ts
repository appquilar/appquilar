import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { captchaService } from "@/compositionRoot";

const CAPTCHA_QUERY_KEY = ["captcha", "config"] as const;

declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-script";
let currentScriptSiteKey: string | null = null;
let scriptLoadPromise: Promise<void> | null = null;

const loadScript = (siteKey: string): Promise<void> => {
    if (window.grecaptcha && currentScriptSiteKey === siteKey) {
        return Promise.resolve();
    }

    if (scriptLoadPromise && currentScriptSiteKey === siteKey) {
        return scriptLoadPromise;
    }

    const staleScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
    if (staleScript) {
        staleScript.remove();
    }

    currentScriptSiteKey = siteKey;
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar reCAPTCHA."));
        document.head.appendChild(script);
    });

    return scriptLoadPromise;
};

const executeRecaptchaAction = async (siteKey: string, action: string): Promise<string> => {
    if (!siteKey.trim()) {
        throw new Error("reCAPTCHA no está configurado.");
    }

    await loadScript(siteKey);

    if (!window.grecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
    }

    return new Promise<string>((resolve, reject) => {
        window.grecaptcha?.ready(async () => {
            try {
                const token = await window.grecaptcha?.execute(siteKey, { action });
                if (!token) {
                    reject(new Error("No se pudo obtener un token de reCAPTCHA."));
                    return;
                }

                resolve(token);
            } catch {
                reject(new Error("No se pudo validar reCAPTCHA."));
            }
        });
    });
};

export const useCaptchaConfig = () => {
    return useQuery({
        queryKey: CAPTCHA_QUERY_KEY,
        queryFn: () => captchaService.getConfig(),
        staleTime: 15 * 60 * 1000,
    });
};

export const useRecaptchaToken = () => {
    const captchaConfigQuery = useCaptchaConfig();

    const execute = useCallback(
        async (action: string): Promise<string> => {
            const config = captchaConfigQuery.data ?? (await captchaConfigQuery.refetch()).data;

            if (!config?.enabled) {
                // Local/dev mode: backend captcha verification is disabled via env.
                return "captcha-disabled";
            }

            if (!config.siteKey) {
                throw new Error("reCAPTCHA no está disponible en este momento.");
            }

            return executeRecaptchaAction(config.siteKey, action);
        },
        [captchaConfigQuery]
    );

    return {
        execute,
        isLoadingConfig: captchaConfigQuery.isLoading,
        isEnabled: Boolean(captchaConfigQuery.data?.enabled && captchaConfigQuery.data?.siteKey),
    };
};
