import { parseProjectMarker } from "@multica/core/projects/marker";

/**
 * Resolve a stored project marker to the single glyph mobile can render.
 *
 * v1 ships no React Native icon library (lucide-react is DOM-only), so an icon
 * marker — with or without a color — falls back to the default folder glyph;
 * an emoji marker renders as-is. This keeps every mobile surface from leaking
 * the raw "lucide:..." string. Full mobile icon + color rendering is tracked
 * in MUL-6.
 */
export function projectMarkerGlyph(icon: string | null | undefined): string {
  const marker = parseProjectMarker(icon);
  return marker?.type === "emoji" ? marker.emoji : "📁";
}
