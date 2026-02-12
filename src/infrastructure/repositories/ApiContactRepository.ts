import type { ContactMessageData } from "@/domain/models/ContactMessage";
import type { ContactRepository } from "@/domain/repositories/ContactRepository";
import { ApiClient } from "@/infrastructure/http/ApiClient";

type ContactMessageDto = {
    name: string;
    email: string;
    topic: string;
    message: string;
    captcha_token: string;
};

export class ApiContactRepository implements ContactRepository {
    constructor(private readonly apiClient: ApiClient) {}

    async sendMessage(data: ContactMessageData): Promise<void> {
        const payload: ContactMessageDto = {
            name: data.name,
            email: data.email,
            topic: data.topic,
            message: data.message,
            captcha_token: data.captchaToken,
        };

        await this.apiClient.post<void>("/api/contact", payload, {
            skipParseJson: true,
        });
    }
}

