import type { CaptchaConfig } from "@/domain/models/CaptchaConfig";
import type { CaptchaRepository } from "@/domain/repositories/CaptchaRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";

type CaptchaConfigDto = {
    enabled?: boolean;
    site_key?: string | null;
    siteKey?: string | null;
};

type CaptchaConfigResponseDto =
    | { success?: boolean; data?: CaptchaConfigDto }
    | CaptchaConfigDto;

export class ApiCaptchaRepository implements CaptchaRepository {
    constructor(private readonly apiClient: ApiClient) {}

    async getConfig(): Promise<CaptchaConfig> {
        const response = await this.apiClient.get<CaptchaConfigResponseDto>("/api/captcha/config");
        const dto = this.extractDto(response);
        const resolvedSiteKey = dto.site_key ?? dto.siteKey ?? null;

        return {
            enabled: Boolean(dto.enabled),
            siteKey: typeof resolvedSiteKey === "string" && resolvedSiteKey.trim() !== "" ? resolvedSiteKey : null,
        };
    }

    private extractDto(raw: CaptchaConfigResponseDto): CaptchaConfigDto {
        if (typeof raw === "object" && raw !== null && "data" in raw && typeof raw.data === "object" && raw.data !== null) {
            return raw.data as CaptchaConfigDto;
        }

        return raw as CaptchaConfigDto;
    }
}
