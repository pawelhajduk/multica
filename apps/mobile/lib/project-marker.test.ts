import { describe, expect, it } from "vitest";
import { projectMarkerGlyph } from "./project-marker";

describe("projectMarkerGlyph", () => {
  it("renders an emoji marker as-is", () => {
    expect(projectMarkerGlyph("🚀")).toBe("🚀");
  });

  it("falls back to the folder glyph for an icon marker", () => {
    expect(projectMarkerGlyph("lucide:FolderKanban")).toBe("📁");
  });

  it("falls back for an icon+color marker, never the raw string", () => {
    const glyph = projectMarkerGlyph("lucide:FolderKanban:blue");
    expect(glyph).toBe("📁");
    expect(glyph).not.toContain("lucide");
  });

  it("falls back for null and empty markers", () => {
    expect(projectMarkerGlyph(null)).toBe("📁");
    expect(projectMarkerGlyph("")).toBe("📁");
  });
});
