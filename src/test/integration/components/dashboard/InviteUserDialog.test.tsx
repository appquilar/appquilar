import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InviteUserDialog } from "@/components/dashboard/companies/users/InviteUserDialog";

describe("InviteUserDialog", () => {
  it("keeps form values when invitation submit fails", async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    const user = userEvent.setup();

    render(
      <InviteUserDialog
        open
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText("Email"), "invitee@appquilar.test");
    await user.click(screen.getByRole("button", { name: "Enviar invitación" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "invitee@appquilar.test",
        role: "ROLE_CONTRIBUTOR",
      });
    });
    expect(screen.getByDisplayValue("invitee@appquilar.test")).toBeInTheDocument();
  });
});
