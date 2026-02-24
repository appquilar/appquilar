import { describe, expect, it } from "vitest";
import { NavigationConfig } from "@/domain/services/navigation/NavigationConfig";
import { UserRole } from "@/domain/models/UserRole";

describe("NavigationConfig", () => {
  it("returns core navigation for ROLE_USER users", () => {
    const sections = NavigationConfig.getSectionsForRole(UserRole.REGULAR_USER);
    const hrefs = sections.flatMap((section) => section.items.map((item) => item.href));

    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/dashboard/messages");
    expect(hrefs).not.toContain("/dashboard/users");
  });

  it("includes company management section for company admins", () => {
    const sections = NavigationConfig.getSectionsForRole(UserRole.COMPANY_ADMIN);

    const companySection = sections.find((section) => section.id === "company-management");
    expect(companySection).toBeDefined();
    expect(companySection?.items.map((item) => item.href)).toEqual([
      "/dashboard/products",
      "/dashboard/categories",
    ]);
  });

  it("includes admin section for company admins and super admins", () => {
    const companyAdminSections = NavigationConfig.getSectionsForRole(UserRole.COMPANY_ADMIN);
    const companyAdminHrefs = companyAdminSections.flatMap((section) =>
      section.items.map((item) => item.href)
    );

    ["/dashboard/users", "/dashboard/companies", "/dashboard/sites"].forEach((href) => {
      expect(companyAdminHrefs).toContain(href);
    });
  });

  it("returns only core section when role has no special access", () => {
    const sections = NavigationConfig.getSectionsForRole("unknown-role");

    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("core");
  });
});
