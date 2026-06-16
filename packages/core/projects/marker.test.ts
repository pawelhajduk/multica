import { describe, expect, it } from "vitest";
import { encodeIconMarker, parseProjectMarker } from "./marker";
import { isValidIconName, PROJECT_ICON_NAMES } from "./icon-names";
import { isValidIconColor, PROJECT_ICON_COLORS } from "./icon-colors";

describe("encodeIconMarker", () => {
  it("encodes an icon with no color", () => {
    expect(encodeIconMarker("FolderKanban")).toBe("lucide:FolderKanban");
  });

  it("encodes an icon with a color", () => {
    expect(encodeIconMarker("FolderKanban", "blue")).toBe("lucide:FolderKanban:blue");
  });
});

describe("parseProjectMarker", () => {
  it("round-trips an emoji marker", () => {
    expect(parseProjectMarker("🚀")).toEqual({ type: "emoji", emoji: "🚀" });
  });

  it("round-trips an icon-only marker", () => {
    const encoded = encodeIconMarker("FolderKanban");
    expect(parseProjectMarker(encoded)).toEqual({ type: "icon", iconName: "FolderKanban" });
  });

  it("round-trips an icon+color marker", () => {
    const encoded = encodeIconMarker("FolderKanban", "blue");
    expect(parseProjectMarker(encoded)).toEqual({
      type: "icon",
      iconName: "FolderKanban",
      color: "blue",
    });
  });

  it("returns null for a null marker (default)", () => {
    expect(parseProjectMarker(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseProjectMarker(undefined)).toBeNull();
  });

  // Boundary: empty string is reachable (mobile seeds an editable field with `icon ?? ""`).
  it("returns null for an empty string, no crash", () => {
    expect(parseProjectMarker("")).toBeNull();
  });

  // Boundary: "lucide:" has an empty name → parses as an icon, but the name is
  // invalid so the renderer falls back.
  it("parses an empty icon name and reports it as invalid", () => {
    const marker = parseProjectMarker("lucide:");
    expect(marker).toEqual({ type: "icon", iconName: "" });
    expect(isValidIconName("")).toBe(false);
  });

  // Failure path: an unknown icon name still parses as an icon; validity check
  // is the renderer's job.
  it("parses an unknown icon name and reports it as invalid", () => {
    const marker = parseProjectMarker("lucide:Bogus");
    expect(marker).toEqual({ type: "icon", iconName: "Bogus" });
    expect(isValidIconName("Bogus")).toBe(false);
  });

  // [v3] A bad color token must NOT drop the icon — keep the icon, drop the color.
  it("keeps the icon and drops an invalid color token", () => {
    const marker = parseProjectMarker("lucide:FolderKanban:notacolor");
    expect(marker).toEqual({ type: "icon", iconName: "FolderKanban" });
    expect(isValidIconColor("notacolor")).toBe(false);
  });
});

describe("curated registries", () => {
  it("validates curated icon names and rejects others", () => {
    expect(isValidIconName("FolderKanban")).toBe(true);
    expect(isValidIconName("DefinitelyNotAnIcon")).toBe(false);
    expect(PROJECT_ICON_NAMES.length).toBeGreaterThan(0);
  });

  it("validates palette colors and rejects others", () => {
    expect(isValidIconColor("blue")).toBe(true);
    expect(isValidIconColor("octarine")).toBe(false);
    expect(PROJECT_ICON_COLORS.length).toBeGreaterThan(0);
  });
});
