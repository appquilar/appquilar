import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { trackProductViewMock } = vi.hoisted(() => ({
  trackProductViewMock: vi.fn(),
}));

vi.mock("@/compositionRoot", () => ({
  companyEngagementService: {
    trackProductView: trackProductViewMock,
  },
}));

import { useTrackProductView } from "@/application/hooks/useTrackProductView";

const HookProbe = ({ productId }: { productId?: string | null }) => {
  useTrackProductView(productId);
  return null;
};

describe("useTrackProductView edge cases", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reuses stored anonymous and session ids instead of regenerating them", () => {
    vi.useFakeTimers();

    localStorage.setItem("analytics:anonymous_id", "anon-existing");
    sessionStorage.setItem("analytics:session_id", "session-existing");

    render(<HookProbe productId="product-1" />);
    vi.advanceTimersByTime(8000);

    expect(trackProductViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product-1",
        anonymousId: "anon-existing",
        sessionId: "session-existing",
      })
    );
  });

  it("does not flush tracking on visibility/pagehide events before the minimum dwell time", () => {
    vi.useFakeTimers();

    render(<HookProbe productId="product-2" />);

    vi.advanceTimersByTime(5000);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pagehide"));

    expect(trackProductViewMock).not.toHaveBeenCalled();
  });

  it("tracks each viewed product once when the product id changes", () => {
    vi.useFakeTimers();

    const view = render(<HookProbe productId="product-3" />);

    vi.advanceTimersByTime(8000);
    view.rerender(<HookProbe productId="product-4" />);
    vi.advanceTimersByTime(8000);

    expect(trackProductViewMock).toHaveBeenCalledTimes(2);
    expect(trackProductViewMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ productId: "product-3" })
    );
    expect(trackProductViewMock.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ productId: "product-4" })
    );
  });
});
