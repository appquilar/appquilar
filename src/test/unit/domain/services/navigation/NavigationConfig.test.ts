import { describe, expect, it } from "vitest";

import { buildDashboardNavigationSections } from "@/domain/services/navigation/NavigationConfig";

describe("buildDashboardNavigationSections", () => {
  it("keeps the new dashboard order for platform navigation", () => {
    const sections = buildDashboardNavigationSections({
      companyId: null,
      shouldShowRentalsItem: true,
      showCompanyManagement: false,
      canManageCompanyUsers: false,
    });

    expect(
      sections.map((section) => ({
        id: section.id,
        title: section.title,
        items: section.items.map((item) => item.title),
      }))
    ).toEqual([
      {
        id: "overview",
        title: null,
        items: ["Resumen"],
      },
      {
        id: "operation",
        title: "OPERACIÓN",
        items: ["Productos", "Alquileres", "Mensajes"],
      },
      {
        id: "content-catalog",
        title: "CONTENIDO Y CATÁLOGO",
        items: ["Categorías", "Blog", "Sitio"],
      },
      {
        id: "management",
        title: "GESTIÓN",
        items: ["Empresas", "Usuarios"],
      },
      {
        id: "business",
        title: "NEGOCIO",
        items: ["Planes de pago", "Analítica plataforma"],
      },
      {
        id: "settings",
        title: "AJUSTES",
        items: ["Configuración"],
      },
    ]);
  });

  it("maps company management entries into the shared GESTIÓN section", () => {
    const sections = buildDashboardNavigationSections({
      companyId: "company-1",
      shouldShowRentalsItem: false,
      showCompanyManagement: true,
      canManageCompanyUsers: true,
    });

    const managementSection = sections.find((section) => section.id === "management");

    expect(managementSection?.items).toEqual([
      expect.objectContaining({
        id: "company-edit",
        title: "Empresa",
        href: "/dashboard/companies/company-1",
      }),
      expect.objectContaining({
        id: "company-users",
        title: "Usuarios",
        href: "/dashboard/companies/company-1/users",
      }),
    ]);
  });
});
