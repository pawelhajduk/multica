/**
 * Token → Tailwind text-color class for project icon markers.
 *
 * ⚠️ Deliberate, centralized exception to the "semantic tokens only, never
 * hardcoded Tailwind colors" CSS rule. The brief asks for an on-brand,
 * fixed Tailwind palette of marker colors, so the concrete color classes have
 * to live somewhere literal. Both reviewers signed off on centralizing them
 * here rather than scattering them across components — keep ALL hardcoded color
 * classes in this one file.
 *
 * The class strings MUST stay literal (no `text-${token}-600` interpolation):
 * Tailwind v4 scans matched source files for literal class names and does not
 * follow imports or evaluate template strings. This `.ts` file is scanned via
 * the shared `@source` globs in each app's CSS — web globs both ts and tsx, and
 * the desktop glob was widened to match (else colored icons render colorless on
 * desktop).
 *
 * Per-mode shades (light / dark) so every swatch clears WCAG AA ≥3:1 non-text
 * contrast in BOTH themes: light hues (amber/yellow/lime/cyan) are darkened in
 * light mode, dark hues (slate/indigo/violet) are lightened in dark mode.
 */
export const PROJECT_ICON_COLOR_CLASS: Record<string, string> = {
  slate: "text-slate-600 dark:text-slate-300",
  red: "text-red-600 dark:text-red-400",
  orange: "text-orange-600 dark:text-orange-400",
  amber: "text-amber-700 dark:text-amber-400",
  yellow: "text-yellow-700 dark:text-yellow-400",
  lime: "text-lime-700 dark:text-lime-400",
  green: "text-green-600 dark:text-green-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  teal: "text-teal-600 dark:text-teal-400",
  cyan: "text-cyan-700 dark:text-cyan-400",
  sky: "text-sky-600 dark:text-sky-400",
  blue: "text-blue-600 dark:text-blue-400",
  indigo: "text-indigo-600 dark:text-indigo-300",
  violet: "text-violet-600 dark:text-violet-300",
  purple: "text-purple-600 dark:text-purple-400",
  fuchsia: "text-fuchsia-600 dark:text-fuchsia-400",
  pink: "text-pink-600 dark:text-pink-400",
  rose: "text-rose-600 dark:text-rose-400",
};

/**
 * Resolve a palette token to its text-color class. Returns `""` for an absent
 * or unknown token so the icon inherits `currentColor` (the default, uncolored
 * marker state).
 */
export function iconColorClass(color: string | undefined): string {
  if (!color) return "";
  return PROJECT_ICON_COLOR_CLASS[color] ?? "";
}
