import type { CaptchaConfig } from "@/domain/models/CaptchaConfig";
import type { CaptchaRepository } from "@/domain/repositories/CaptchaRepository";

export class CaptchaService {
    constructor(private readonly captchaRepository: CaptchaRepository) {}

    async getConfig(): Promise<CaptchaConfig> {
        return this.captchaRepository.getConfig();
    }
}

