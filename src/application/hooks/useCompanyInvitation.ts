import { useMutation } from "@tanstack/react-query";
import { companyInvitationService } from "@/compositionRoot";
import type { AcceptCompanyInvitationInput } from "@/domain/models/CompanyInvitation";

export const useAcceptCompanyInvitation = () => {
    return useMutation({
        mutationFn: (input: AcceptCompanyInvitationInput) =>
            companyInvitationService.acceptInvitation(input),
    });
};
