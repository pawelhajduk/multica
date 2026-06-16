/**
 * Fixed Tailwind palette a project's icon marker may be tinted with.
 *
 * Pure data — the tokens here are stored in the marker string
 * (`"lucide:FolderKanban:blue"`); the token → concrete Tailwind class mapping
 * lives in `packages/ui/components/common/color-classes.ts` (UI-only, because
 * the class strings must be literal for Tailwind's scanner). Keeping the token
 * list here lets mobile (MUL-6) validate stored markers without importing UI.
 *
 * Emoji keep their native multi-color look; color applies to icon markers only.
 */
export const PROJECT_ICON_COLORS: readonly string[] = [
  "slate",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const ICON_COLOR_SET = new Set(PROJECT_ICON_COLORS);

/** True only for a token in the fixed palette. Empty string and unknown tokens are false. */
export function isValidIconColor(color: string): boolean {
  return ICON_COLOR_SET.has(color);
}
