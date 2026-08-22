import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { useWorkspaceStore } from "@/store/workspace-store";

describe("WorkspaceSwitcher", () => {
  it("opens the workspace creator when the new workspace button is clicked", async () => {
    useWorkspaceStore.setState({
      workspaces: [
        { id: "ws-1", name: "Northstar Labs", slug: "northstar-labs", logoUrl: null },
      ],
      currentWorkspaceId: "ws-1",
    });

    const user = userEvent.setup();
    render(<WorkspaceSwitcher workspaces={[{ id: "ws-1", name: "Northstar Labs", slug: "northstar-labs", logoUrl: null }]} />);

    await user.click(screen.getByRole("button", { name: /northstar labs/i }));
    await user.click(screen.getByRole("button", { name: /new/i }));

    expect(screen.getByRole("heading", { name: /create workspace/i })).toBeInTheDocument();
  });
});
