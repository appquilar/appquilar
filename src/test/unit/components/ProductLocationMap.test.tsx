import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProductLocationMap from "@/components/products/ProductLocationMap";

const useProductLocationMapMock = vi.fn();

vi.mock("@/hooks/useProductLocationMap", () => ({
  useProductLocationMap: (...args: unknown[]) => useProductLocationMapMock(...args),
}));

describe("ProductLocationMap", () => {
  beforeEach(() => {
    useProductLocationMapMock.mockReset();
  });

  it("keeps a useful Google Maps link when the embedded map is blocked by referrer rules", async () => {
    useProductLocationMapMock.mockImplementation(
      ({ onError }: { onError?: (message: string | null) => void }) => {
        queueMicrotask(() => {
          onError?.("Google Maps no permite este dominio.");
        });
      }
    );

    render(
      <ProductLocationMap
        city="Madrid"
        state="Comunidad de Madrid"
        coordinates={[-3.7038, 40.4168]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Google Maps no permite este dominio.")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Abrir en Google Maps" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=40.4168%2C-3.7038"
    );
  });
});
