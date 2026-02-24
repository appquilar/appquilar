import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

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

describe("useTrackProductView", () => {
  it("does nothing when productId is missing", () => {
    vi.useFakeTimers();

    render(<HookProbe productId={null} />);

    vi.advanceTimersByTime(9000);

    expect(trackProductViewMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("tracks a product view after minimum dwell time", () => {
    vi.useFakeTimers();

    render(<HookProbe productId="product-1" />);

    vi.advanceTimersByTime(8000);

    expect(trackProductViewMock).toHaveBeenCalledTimes(1);
    expect(trackProductViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product-1",
        anonymousId: expect.any(String),
        sessionId: expect.any(String),
        dwellTimeMs: expect.any(Number),
        occurredAt: expect.any(String),
      })
    );

    vi.useRealTimers();
  });

  it("tracks once even if unmounted after timer flush", () => {
    vi.useFakeTimers();

    const view = render(<HookProbe productId="product-2" />);

    vi.advanceTimersByTime(8000);
    view.unmount();

    expect(trackProductViewMock).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("flushes tracking on pagehide after minimum dwell time", () => {
    vi.useFakeTimers();

    render(<HookProbe productId="product-3" />);

    vi.advanceTimersByTime(8500);
    window.dispatchEvent(new Event("pagehide"));

    expect(trackProductViewMock).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
