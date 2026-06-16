"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Ban } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import { Input } from "@multica/ui/components/ui/input";
import { DynamicLucideIcon } from "./lucide-icon";
import { iconColorClass } from "./color-classes";

/**
 * One selectable icon. Kept as a local interface (not imported from `core`) so
 * this component stays a pure, reusable UI primitive — `packages/ui` must not
 * import `@multica/core`. Callers (e.g. project views) pass their own curated
 * list, which keeps the picker reusable for any icon set whose names exist in
 * `DynamicLucideIcon`'s record.
 */
export interface IconPickerOption {
  name: string;
  label: string;
  keywords: string[];
}

export interface IconPickerSelection {
  iconName: string;
  /** Palette token, or `undefined` for the default (uncolored) state. */
  color?: string;
}

export interface IconPickerProps {
  icons: readonly IconPickerOption[];
  /** Fixed color palette tokens (e.g. "blue", "rose"). */
  colors: readonly string[];
  /** Currently-selected icon name, if any. */
  iconName?: string;
  /** Currently-selected color token, if any. */
  color?: string;
  /** Reports the new selection. Applies live — the popover does not close here. */
  onSelect: (selection: IconPickerSelection) => void;
  className?: string;
}

const GRID_COLUMNS = 8;

/** Move roving focus within a same-tabindex group on arrow keys. */
function handleRovingKeys(
  e: KeyboardEvent<HTMLElement>,
  index: number,
  count: number,
  columns: number,
  setActive: (i: number) => void,
  container: HTMLElement | null,
) {
  let next = index;
  switch (e.key) {
    case "ArrowRight": next = Math.min(index + 1, count - 1); break;
    case "ArrowLeft": next = Math.max(index - 1, 0); break;
    case "ArrowDown": next = Math.min(index + columns, count - 1); break;
    case "ArrowUp": next = Math.max(index - columns, 0); break;
    case "Home": next = 0; break;
    case "End": next = count - 1; break;
    default: return;
  }
  e.preventDefault();
  setActive(next);
  const buttons = container?.querySelectorAll<HTMLElement>("[data-roving-item]");
  buttons?.[next]?.focus();
}

/**
 * Reusable, dumb icon + color picker. Mirrors the `EmojiPicker` contract
 * (no internal selection state beyond focus; reports choices via `onSelect`).
 *
 * Accessibility (blocking per design review):
 *   - Search matches name + label + keywords (human terms, not PascalCase).
 *   - Icon grid is a `role="grid"` with roving arrow-key focus (one tab stop),
 *     each cell an `aria-label`led button with `aria-pressed`; the SVG itself
 *     is `aria-hidden`.
 *   - Color row is a separate roving group with a leading "No color" chip
 *     (selected when `color` is undefined); the selected swatch uses a two-tone
 *     ring (ring-offset background inner + foreground outer) that stays legible
 *     on every hue, never a same-color ring.
 */
export function IconPicker({
  icons,
  colors,
  iconName,
  color,
  onSelect,
  className,
}: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [activeIcon, setActiveIcon] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const colorRowRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return icons;
    return icons.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.label.toLowerCase().includes(q) ||
        i.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [icons, query]);

  // "No color" chip is index 0; palette tokens follow.
  const colorCount = colors.length + 1;

  return (
    <div className={cn("flex flex-col gap-3 p-3", className)}>
      <Input
        type="search"
        value={query}
        autoFocus
        placeholder="Search icons"
        aria-label="Search icons"
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIcon(0);
        }}
      />

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {`No icons match "${query}"`}
        </div>
      ) : (
        <div
          ref={gridRef}
          role="grid"
          aria-label="Icons"
          className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto"
        >
          {filtered.map((icon, i) => {
            const selected = icon.name === iconName;
            return (
              <button
                key={icon.name}
                type="button"
                data-roving-item
                role="gridcell"
                aria-label={icon.label}
                aria-pressed={selected}
                tabIndex={i === activeIcon ? 0 : -1}
                onFocus={() => setActiveIcon(i)}
                onKeyDown={(e) =>
                  handleRovingKeys(e, i, filtered.length, GRID_COLUMNS, setActiveIcon, gridRef.current)
                }
                onClick={() => onSelect({ iconName: icon.name, color })}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-foreground transition-colors",
                  "hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",
                  selected && "bg-accent ring-2 ring-ring",
                )}
              >
                <DynamicLucideIcon name={icon.name} size="md" />
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={colorRowRef}
        role="group"
        aria-label="Icon color"
        className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3"
      >
        {/* No color / default chip (index 0). */}
        <button
          type="button"
          data-roving-item
          aria-label="No color"
          aria-pressed={!color}
          tabIndex={activeColor === 0 ? 0 : -1}
          onFocus={() => setActiveColor(0)}
          onKeyDown={(e) =>
            handleRovingKeys(e, 0, colorCount, colorCount, setActiveColor, colorRowRef.current)
          }
          onClick={() => onSelect({ iconName: iconName ?? "", color: undefined })}
          className={cn(
            "flex size-6 items-center justify-center rounded-full border border-input bg-background text-muted-foreground transition",
            "focus-visible:outline-2 focus-visible:outline-ring",
            !color &&
              "ring-2 ring-offset-2 ring-foreground ring-offset-background outline-none",
          )}
        >
          <Ban className="size-3.5" aria-hidden="true" />
        </button>

        {colors.map((token, idx) => {
          const i = idx + 1;
          const selected = token === color;
          return (
            <button
              key={token}
              type="button"
              data-roving-item
              aria-label={token}
              aria-pressed={selected}
              tabIndex={activeColor === i ? 0 : -1}
              onFocus={() => setActiveColor(i)}
              onKeyDown={(e) =>
                handleRovingKeys(e, i, colorCount, colorCount, setActiveColor, colorRowRef.current)
              }
              onClick={() => onSelect({ iconName: iconName ?? "", color: token })}
              className={cn(
                "size-6 rounded-full p-0.5 transition",
                "focus-visible:outline-2 focus-visible:outline-ring",
                iconColorClass(token),
                selected &&
                  "ring-2 ring-offset-2 ring-foreground ring-offset-background outline-none",
              )}
            >
              <span className="block size-full rounded-full bg-current" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
