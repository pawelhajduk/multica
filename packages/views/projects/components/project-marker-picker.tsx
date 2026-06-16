"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@multica/ui/components/ui/tabs";
import { EmojiPicker } from "@multica/ui/components/common/emoji-picker";
import { IconPicker } from "@multica/ui/components/common/icon-picker";
import {
  parseProjectMarker,
  encodeIconMarker,
  PROJECT_ICONS,
  PROJECT_ICON_COLORS,
} from "@multica/core/projects";
import { useT } from "../../i18n";

export interface ProjectMarkerPickerProps {
  /** The current stored marker (emoji, encoded icon, or null). */
  icon: string | null | undefined;
  /**
   * Fired when the user picks an emoji. By convention the host closes the
   * popover on emoji select (a single, terminal choice).
   */
  onSelectEmoji: (emoji: string) => void;
  /**
   * Fired when the user picks an icon or a color. The encoded marker is applied
   * live and the host keeps the popover OPEN so the color row stays reachable.
   */
  onSelectIcon: (marker: string) => void;
}

/**
 * Tabbed Emoji | Icon marker picker shared by the create-project modal and the
 * project detail sidebar. Opens on the tab matching the current marker so the
 * "what's currently set" state is visible immediately.
 *
 * Close behavior is intentionally split (design review #3): the Emoji tab is a
 * terminal choice and the host closes on select; the Icon tab applies live and
 * stays open so the user can pick a color after the icon without the popover
 * dismissing out from under them.
 */
export function ProjectMarkerPicker({ icon, onSelectEmoji, onSelectIcon }: ProjectMarkerPickerProps) {
  const { t } = useT("projects");
  const marker = parseProjectMarker(icon);
  const defaultTab = marker?.type === "icon" ? "icon" : "emoji";
  const currentIconName = marker?.type === "icon" ? marker.iconName : undefined;
  const currentColor = marker?.type === "icon" ? marker.color : undefined;

  return (
    <Tabs defaultValue={defaultTab} className="w-[352px]">
      <TabsList className="m-2 mb-0 w-[calc(100%-1rem)]">
        <TabsTrigger value="emoji">{t(($) => $.marker_picker.emoji_tab)}</TabsTrigger>
        <TabsTrigger value="icon">{t(($) => $.marker_picker.icon_tab)}</TabsTrigger>
      </TabsList>

      <TabsContent value="emoji">
        <EmojiPicker onSelect={onSelectEmoji} />
      </TabsContent>

      <TabsContent value="icon">
        <IconPicker
          icons={PROJECT_ICONS}
          colors={PROJECT_ICON_COLORS}
          iconName={currentIconName}
          color={currentColor}
          onSelect={({ iconName, color }) => onSelectIcon(encodeIconMarker(iconName, color))}
        />
      </TabsContent>
    </Tabs>
  );
}
