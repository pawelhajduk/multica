import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconPicker } from "@multica/ui/components/common/icon-picker";
import { PROJECT_ICONS, PROJECT_ICON_COLORS } from "@multica/core/projects";

function renderPicker(props: Partial<React.ComponentProps<typeof IconPicker>> = {}) {
  const onSelect = vi.fn();
  render(
    <IconPicker
      icons={PROJECT_ICONS}
      colors={PROJECT_ICON_COLORS}
      onSelect={onSelect}
      {...props}
    />,
  );
  return { onSelect };
}

describe("IconPicker", () => {
  it("filters by keyword, not just the PascalCase name", async () => {
    renderPicker();
    const search = screen.getByRole("searchbox", { name: "Search icons" });
    await userEvent.type(search, "folder");
    // "Board" (FolderKanban) is found via its keywords, even though the user
    // typed neither the label nor the component name verbatim.
    expect(screen.getByRole("gridcell", { name: "Board" })).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderPicker();
    const search = screen.getByRole("searchbox", { name: "Search icons" });
    await userEvent.type(search, "zzzznope");
    expect(screen.getByText('No icons match "zzzznope"')).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("reports the icon on click, carrying the current color", () => {
    const { onSelect } = renderPicker({ color: "blue" });
    fireEvent.click(screen.getByRole("gridcell", { name: "Board" }));
    expect(onSelect).toHaveBeenCalledWith({ iconName: "FolderKanban", color: "blue" });
  });

  it("reports a color swatch click, keeping the current icon", () => {
    const { onSelect } = renderPicker({ iconName: "FolderKanban" });
    fireEvent.click(screen.getByRole("button", { name: "blue" }));
    expect(onSelect).toHaveBeenCalledWith({ iconName: "FolderKanban", color: "blue" });
  });

  it("reports the no-color chip as color: undefined", () => {
    const { onSelect } = renderPicker({ iconName: "FolderKanban", color: "blue" });
    fireEvent.click(screen.getByRole("button", { name: "No color" }));
    expect(onSelect).toHaveBeenCalledWith({ iconName: "FolderKanban", color: undefined });
  });

  it("marks the selected icon and color as pressed", () => {
    renderPicker({ iconName: "Rocket", color: "rose" });
    expect(screen.getByRole("gridcell", { name: "Rocket" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "rose" })).toHaveAttribute("aria-pressed", "true");
    // No color chip is not pressed while a color is selected.
    expect(screen.getByRole("button", { name: "No color" })).toHaveAttribute("aria-pressed", "false");
  });

  it("marks the no-color chip pressed when no color is set", () => {
    renderPicker({ iconName: "Rocket" });
    expect(screen.getByRole("button", { name: "No color" })).toHaveAttribute("aria-pressed", "true");
  });
});
