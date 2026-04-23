import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductPagination from "@/components/dashboard/products/ProductPagination";
import { renderWithProviders } from "@/test/utils/renderWithProviders";

describe("ProductPagination", () => {
  it("does not render anything when there is only one page", () => {
    const { container } = renderWithProviders(
      <ProductPagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders all page links for short collections and lets the user navigate with prev/next controls", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderWithProviders(
      <ProductPagination currentPage={2} totalPages={4} onPageChange={onPageChange} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2").closest("a")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Go to previous page"));
    await user.click(screen.getByLabelText("Go to next page"));
    await user.click(screen.getByText("4"));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 4);
  });

  it("renders leading and trailing ellipses when the current page is in the middle of a long collection", () => {
    renderWithProviders(<ProductPagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5").closest("a")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  it("disables prev/next navigation when the user is on the first or last page", async () => {
    const user = userEvent.setup();
    const onFirstPageChange = vi.fn();
    const onLastPageChange = vi.fn();

    const { rerender } = renderWithProviders(
      <ProductPagination currentPage={1} totalPages={6} onPageChange={onFirstPageChange} />
    );

    const firstPreviousLink = screen.getByLabelText("Go to previous page");
    expect(firstPreviousLink).toHaveClass("pointer-events-none");
    await user.click(firstPreviousLink);
    expect(onFirstPageChange).not.toHaveBeenCalled();

    rerender(<ProductPagination currentPage={6} totalPages={6} onPageChange={onLastPageChange} />);

    const lastNextLink = screen.getByLabelText("Go to next page");
    expect(lastNextLink).toHaveClass("pointer-events-none");
    await user.click(lastNextLink);
    expect(onLastPageChange).not.toHaveBeenCalled();
  });
});
