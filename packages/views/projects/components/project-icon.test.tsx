import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ProjectIcon } from "./project-icon";
import { encodeIconMarker } from "@multica/core/projects";

describe("ProjectIcon", () => {
  it("renders an emoji marker as text", () => {
    const { container } = render(<ProjectIcon project={{ icon: "🚀" }} />);
    expect(container.textContent).toContain("🚀");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders an icon marker as an svg, not the literal string", () => {
    const { container } = render(
      <ProjectIcon project={{ icon: encodeIconMarker("FolderKanban") }} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.textContent).not.toContain("lucide");
  });

  it("applies the per-mode color class for an icon+color marker", () => {
    const { container } = render(
      <ProjectIcon project={{ icon: encodeIconMarker("FolderKanban", "blue") }} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toContain("text-blue-600");
    expect(svg?.getAttribute("class")).toContain("dark:text-blue-400");
  });

  it("falls back to the default glyph for a null marker", () => {
    const { container } = render(<ProjectIcon project={{ icon: null }} />);
    expect(container.textContent).toContain("📁");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("falls back to the default glyph for an unknown icon name", () => {
    const { container } = render(<ProjectIcon project={{ icon: "lucide:Bogus" }} />);
    expect(container.textContent).toContain("📁");
    expect(container.querySelector("svg")).toBeNull();
  });
});
