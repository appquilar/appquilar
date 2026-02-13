import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CompanyUserRole,
    CreateCompanyInput,
    InviteCompanyUserInput,
    RemoveCompanyUserInput,
    UpdateCompanyUserRoleInput,
} from "@/domain/models/CompanyMembership";
import { companyMembershipService } from "@/compositionRoot";

const COMPANY_USERS_QUERY_KEY = ["companyUsers"] as const;

export const useCompanyUsers = (
    companyId: string | null | undefined,
    page = 1,
    perPage = 50
) => {
    return useQuery({
        queryKey: [...COMPANY_USERS_QUERY_KEY, companyId, page, perPage],
        queryFn: () => companyMembershipService.listCompanyUsers(companyId!, page, perPage),
        enabled: Boolean(companyId),
    });
};

export const useCreateCompany = () => {
    return useMutation({
        mutationFn: (input: CreateCompanyInput) => companyMembershipService.createCompany(input),
    });
};

export const useInviteCompanyUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: InviteCompanyUserInput) => companyMembershipService.inviteCompanyUser(input),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: [...COMPANY_USERS_QUERY_KEY, variables.companyId],
            });
        },
    });
};

export const useUpdateCompanyUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateCompanyUserRoleInput) => companyMembershipService.updateCompanyUserRole(input),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: [...COMPANY_USERS_QUERY_KEY, variables.companyId],
            });
        },
    });
};

export const useRemoveCompanyUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: RemoveCompanyUserInput) => companyMembershipService.removeCompanyUser(input),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: [...COMPANY_USERS_QUERY_KEY, variables.companyId],
            });
        },
    });
};

export const COMPANY_USER_ROLES: ReadonlyArray<{ value: CompanyUserRole; label: string }> = [
    { value: "ROLE_CONTRIBUTOR", label: "Colaborador" },
    { value: "ROLE_ADMIN", label: "Administrador" },
];

