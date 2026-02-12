import { useMutation } from "@tanstack/react-query";
import { contactService } from "@/compositionRoot";
import type { ContactMessageData } from "@/domain/models/ContactMessage";

export const useSendContactMessage = () => {
    return useMutation({
        mutationFn: async (payload: ContactMessageData) => {
            await contactService.sendMessage(payload);
        },
    });
};

