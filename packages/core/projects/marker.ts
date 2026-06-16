/**
 * Project marker model — encode/decode the single nullable `projects.icon`
 * column so it can hold either an emoji (today's behavior) or a Lucide icon
 * with an optional palette color, with zero DB migration.
 *
 * Encoding (one field, backwards-compatible):
 *   - emoji        → the raw emoji, e.g. `"🚀"`
 *   - icon         → `"lucide:FolderKanban"`
 *   - icon + color → `"lucide:FolderKanban:blue"`  (3rd segment = palette token)
 *
 * The `"lucide:"` prefix is collision-safe: the emoji picker only ever returns
 * real emoji (no ASCII colon), Lucide names are PascalCase (no colon), and
 * palette tokens are lowercase words (no colon). Parsing is total and never
 * throws — every malformed value degrades to a renderable fallback:
 *   - `null` / `""`                       → `null` (default 📁 glyph)
 *   - `"lucide:"` (empty name)            → `{ type:"icon", iconName:"" }`,
 *                                           `isValidIconName("")` is false so
 *                                           the renderer falls back
 *   - `"lucide:Bogus"`                    → icon with an unknown name → fallback
 *   - `"lucide:FolderKanban:notacolor"`   → icon kept, color dropped (never lose
 *                                           the icon over a bad color token)
 *
 * Pure data — no React, no `lucide-react` — so mobile (MUL-6) can reuse it.
 */
import { isValidIconColor } from "./icon-colors";

export type ProjectMarker =
  | { type: "emoji"; emoji: string }
  | { type: "icon"; iconName: string; color?: string };

const ICON_PREFIX = "lucide:";

/**
 * Decode a stored marker string. Returns `null` for the empty/default marker
 * (the caller renders the default glyph). Validation of the icon name is left
 * to the renderer via `isValidIconName` so an unknown name still parses as an
 * icon and falls back rather than crashing.
 */
export function parseProjectMarker(icon: string | null | undefined): ProjectMarker | null {
  if (!icon) return null;

  if (icon.startsWith(ICON_PREFIX)) {
    const rest = icon.slice(ICON_PREFIX.length);
    const colonIndex = rest.indexOf(":");
    const iconName = colonIndex === -1 ? rest : rest.slice(0, colonIndex);
    const colorToken = colonIndex === -1 ? "" : rest.slice(colonIndex + 1);

    // A bad/unknown color is non-fatal: keep the icon, drop the color.
    if (colorToken && isValidIconColor(colorToken)) {
      return { type: "icon", iconName, color: colorToken };
    }
    return { type: "icon", iconName };
  }

  return { type: "emoji", emoji: icon };
}

/** Encode a curated icon name (+ optional palette color) into a marker string. */
export function encodeIconMarker(name: string, color?: string): string {
  return color ? `${ICON_PREFIX}${name}:${color}` : `${ICON_PREFIX}${name}`;
}
