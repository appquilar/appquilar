import type { ContactMessageData } from "@/domain/models/ContactMessage";

export interface ContactRepository {
    sendMessage(data: ContactMessageData): Promise<void>;
}

