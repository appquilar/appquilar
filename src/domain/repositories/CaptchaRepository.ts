import type { CaptchaConfig } from "@/domain/models/CaptchaConfig";

export interface CaptchaRepository {
    getConfig(): Promise<CaptchaConfig>;
}

