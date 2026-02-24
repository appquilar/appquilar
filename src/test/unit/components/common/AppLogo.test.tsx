import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AppLogo from "@/components/common/AppLogo";

describe("AppLogo", () => {
  it("renders image by default", () => {
    render(<AppLogo alt="Appquilar logo" />);

    expect(screen.getByRole("img", { name: "Appquilar logo" })).toBeInTheDocument();
  });

  it("renders fallback text when image fails", () => {
    render(<AppLogo fallbackText="fallback-brand" />);

    const image = screen.getByRole("img");
    fireEvent.error(image);

    expect(screen.getByText("fallback-brand")).toBeInTheDocument();
  });
});

