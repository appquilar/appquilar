import type { ContactMessageData } from "@/domain/models/ContactMessage";
import type { ContactRepository } from "@/domain/repositories/ContactRepository";

export class ContactService {
    constructor(private readonly contactRepository: ContactRepository) {}

    async sendMessage(data: ContactMessageData): Promise<void> {
        await this.contactRepository.sendMessage(data);
    }
}

