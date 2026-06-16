import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectMarkerPicker } from "./project-marker-picker";

// The real emoji-mart picker instantiates DOM in an effect; stub it down to a
// button that reports a fixed emoji so we can assert the emoji path.
vi.mock("@multica/ui/components/common/emoji-picker", () => ({
  EmojiPicker: ({ onSelect }: { onSelect: (emoji: string) => void }) => (
    <button type="button" onClick={() => onSelect("🚀")}>
      pick-emoji
    </button>
  ),
}));

function setup(icon: string | null | undefined) {
  const onSelectEmoji = vi.fn();
  const onSelectIcon = vi.fn();
  render(
    <ProjectMarkerPicker
      icon={icon}
      onSelectEmoji={onSelectEmoji}
      onSelectIcon={onSelectIcon}
    />,
  );
  return { onSelectEmoji, onSelectIcon };
}

describe("ProjectMarkerPicker", () => {
  it("defaults to the Emoji tab for an emoji marker", () => {
    setup("🚀");
    expect(screen.getByRole("tab", { name: "Emoji" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens on the Icon tab when the current marker is an icon", () => {
    setup("lucide:FolderKanban:blue");
    expect(screen.getByRole("tab", { name: "Icon" })).toHaveAttribute("aria-selected", "true");
    // The current icon and color are reflected as pressed in the picker.
    expect(screen.getByRole("gridcell", { name: "Board" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "blue" })).toHaveAttribute("aria-pressed", "true");
  });

  it("reports a raw emoji from the Emoji tab", () => {
    const { onSelectEmoji } = setup(null);
    fireEvent.click(screen.getByText("pick-emoji"));
    expect(onSelectEmoji).toHaveBeenCalledWith("🚀");
  });

  it("encodes an icon with no color", () => {
    const { onSelectIcon } = setup("lucide:Rocket");
    fireEvent.click(screen.getByRole("gridcell", { name: "Board" }));
    expect(onSelectIcon).toHaveBeenCalledWith("lucide:FolderKanban");
  });

  it("encodes an icon with its color", () => {
    const { onSelectIcon } = setup("lucide:FolderKanban");
    fireEvent.click(screen.getByRole("button", { name: "blue" }));
    expect(onSelectIcon).toHaveBeenCalledWith("lucide:FolderKanban:blue");
  });

  it("encodes back to no color when the no-color chip is chosen", () => {
    const { onSelectIcon } = setup("lucide:FolderKanban:blue");
    fireEvent.click(screen.getByRole("button", { name: "No color" }));
    expect(onSelectIcon).toHaveBeenCalledWith("lucide:FolderKanban");
  });
});
