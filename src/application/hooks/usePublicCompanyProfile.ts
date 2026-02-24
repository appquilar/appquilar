import { useQuery } from "@tanstack/react-query";

import { publicCompanyProfileService } from "@/compositionRoot";

export const usePublicCompanyProfile = (slug: string | null | undefined) => {
  return useQuery({
    queryKey: ["publicCompanyProfile", slug],
    queryFn: () => publicCompanyProfileService.getBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
};
