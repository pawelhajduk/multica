import type { ReactNode } from "react";
import type { Project } from "@multica/core/types";
import { parseProjectMarker, isValidIconName } from "@multica/core/projects";
import { cn } from "@multica/ui/lib/utils";
import { DynamicLucideIcon } from "@multica/ui/components/common/lucide-icon";

export type ProjectIconSize = "sm" | "md" | "lg";

export interface ProjectIconProps {
  project?: Pick<Project, "icon"> | null;
  size?: ProjectIconSize;
  className?: string;
}

const SIZE_CLASS: Record<ProjectIconSize, string> = {
  sm: "size-3.5 text-xs leading-none",
  md: "size-4 text-sm leading-none",
  lg: "size-6 text-2xl leading-none",
};

/**
 * Single render chokepoint for a project's visual marker (emoji or Lucide
 * icon + color). Every web/desktop surface routes through here, so teaching
 * this one component to parse the marker covers them all. An unknown icon name
 * or unset marker falls back to the default 📁 glyph.
 */
export function ProjectIcon({ project, size = "sm", className }: ProjectIconProps) {
  const marker = parseProjectMarker(project?.icon);

  let content: ReactNode;
  if (marker?.type === "icon" && isValidIconName(marker.iconName)) {
    content = <DynamicLucideIcon name={marker.iconName} size={size} color={marker.color} />;
  } else if (marker?.type === "emoji") {
    content = marker.emoji;
  } else {
    content = "📁";
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        SIZE_CLASS[size],
        className,
      )}
    >
      {content}
    </span>
  );
}
