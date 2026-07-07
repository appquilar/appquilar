import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import CategoryGrid from "@/components/Home/CategoryGrid";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

vi.mock("@/application/hooks/usePublicSiteCategories", () => ({
  usePublicSiteCategories: () => ({
    featuredCategories: [],
    isLoading: false,
  }),
}));

describe("CategoryGrid", () => {
  it("does not show static product counters when real counters are unavailable", () => {
    renderWithProviders(<CategoryGrid />);

    expect(screen.getByText("Explora por categorías")).toBeInTheDocument();
    expect(screen.queryAllByText(/\d+\s+productos/i)).toHaveLength(0);
  });
});
