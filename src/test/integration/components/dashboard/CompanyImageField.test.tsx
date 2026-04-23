import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CompanyImageField from "@/components/dashboard/companies/CompanyImageField";

const useMediaUrlMock = vi.fn();

vi.mock("@/application/hooks/useMediaUrl", () => ({
  useMediaUrl: (...args: unknown[]) => useMediaUrlMock(...args),
}));

describe("CompanyImageField", () => {
  beforeEach(() => {
    useMediaUrlMock.mockReset();
    useMediaUrlMock.mockReturnValue({
      url: null,
      isLoading: false,
      error: null,
    });
  });

  it("renders the avatar fallback when there is no uploaded image", () => {
    render(
      <CompanyImageField
        title="Logo"
        description="Imagen principal"
        mediaId={null}
        companyName="Acme Rentals"
        imageSize="MEDIUM"
        variant="avatar"
        isUploading={false}
        onSelectFile={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Quitar imagen" })).not.toBeInTheDocument();
    expect(screen.getByText("JPEG o PNG, máximo 2MB.")).toBeInTheDocument();
  });

  it("renders the banner preview copy when no header image exists", () => {
    render(
      <CompanyImageField
        title="Cabecera"
        description="Imagen pública"
        mediaId={null}
        companyName="Acme Rentals"
        imageSize="LARGE"
        variant="banner"
        isUploading={false}
        onSelectFile={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText("Acme Rentals")).toBeInTheDocument();
    expect(screen.getByText("Cabecera pública del perfil")).toBeInTheDocument();
  });

  it("renders the uploaded image, removal action and upload-state messaging", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockResolvedValue(undefined);

    useMediaUrlMock.mockReturnValue({
      url: "https://cdn.example.com/company-banner.jpg",
      isLoading: false,
      error: null,
    });

    render(
      <CompanyImageField
        title="Cabecera"
        description="Imagen pública"
        mediaId="media-1"
        companyName="Acme Rentals"
        imageSize="LARGE"
        variant="banner"
        isUploading={true}
        error="No se pudo subir la imagen."
        onSelectFile={vi.fn()}
        onRemove={onRemove}
      />
    );

    expect(screen.getByRole("img", { name: "Acme Rentals" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/company-banner.jpg"
    );
    expect(screen.getByText("Subiendo imagen...")).toBeInTheDocument();
    expect(screen.getByText("No se pudo subir la imagen.")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: "Quitar imagen" });
    expect(removeButton).toBeDisabled();

    useMediaUrlMock.mockReturnValue({
      url: "https://cdn.example.com/company-banner.jpg",
      isLoading: false,
      error: null,
    });
  });

  it("passes the first selected or dropped file to the uploader and ignores empty selections", async () => {
    const onSelectFile = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    const { container } = render(
      <CompanyImageField
        title="Logo"
        description="Imagen principal"
        mediaId={null}
        companyName="Acme Rentals"
        imageSize="MEDIUM"
        variant="avatar"
        isUploading={false}
        onSelectFile={onSelectFile}
        onRemove={vi.fn()}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();

    await user.upload(input, file);
    await waitFor(() => {
      expect(onSelectFile).toHaveBeenCalledWith(file);
    });

    const dropZone = screen.getByText("Haz clic para subir").closest("div")?.parentElement;
    expect(dropZone).not.toBeNull();

    fireEvent.drop(dropZone as HTMLElement, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(onSelectFile).toHaveBeenCalledTimes(2);
    });

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    expect(onSelectFile).toHaveBeenCalledTimes(2);
  });

  it("invokes the remove handler when the action is available", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockResolvedValue(undefined);

    useMediaUrlMock.mockReturnValue({
      url: "https://cdn.example.com/company-avatar.jpg",
      isLoading: false,
      error: null,
    });

    render(
      <CompanyImageField
        title="Logo"
        description="Imagen principal"
        mediaId="media-1"
        companyName="Acme Rentals"
        imageSize="MEDIUM"
        variant="avatar"
        isUploading={false}
        onSelectFile={vi.fn()}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole("button", { name: "Quitar imagen" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
