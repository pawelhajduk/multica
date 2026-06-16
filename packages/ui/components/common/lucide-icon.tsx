"use client";

import {
  FolderKanban, Folder, Rocket, Star, Heart, Flag, Bookmark, Briefcase,
  Building2, Calendar, Camera, Cloud, Code, Coffee, Compass, Cpu, CreditCard,
  Database, FileText, Flame, Gift, Globe, GraduationCap, Hammer, Headphones,
  Home, Image, Inbox, Key, Lightbulb, Lock, Mail, Map, MapPin, Megaphone,
  MessageCircle, Music, Package, Palette, PenTool, Phone, PieChart, Plane,
  Puzzle, Settings, Shield, ShoppingCart, Sparkles, Target, Terminal, ThumbsUp,
  Trophy, Truck, Umbrella, User, Users, Wallet, Wrench, Zap, Bug, Beaker, Bell,
  Book, Box, Leaf, Anchor,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import { iconColorClass } from "./color-classes";

/**
 * Static name → component record for the curated project icon set. Built with
 * named imports (no `import * as icons`) so the bundle only carries these ~60
 * glyphs. Any name not in this record renders nothing — `DynamicLucideIcon`
 * returns `null` and the caller falls back to the default marker.
 */
const ICON_COMPONENTS: Record<string, LucideIcon> = {
  FolderKanban, Folder, Rocket, Star, Heart, Flag, Bookmark, Briefcase,
  Building2, Calendar, Camera, Cloud, Code, Coffee, Compass, Cpu, CreditCard,
  Database, FileText, Flame, Gift, Globe, GraduationCap, Hammer, Headphones,
  Home, Image, Inbox, Key, Lightbulb, Lock, Mail, Map, MapPin, Megaphone,
  MessageCircle, Music, Package, Palette, PenTool, Phone, PieChart, Plane,
  Puzzle, Settings, Shield, ShoppingCart, Sparkles, Target, Terminal, ThumbsUp,
  Trophy, Truck, Umbrella, User, Users, Wallet, Wrench, Zap, Bug, Beaker, Bell,
  Book, Box, Leaf, Anchor,
};

export type DynamicLucideIconSize = "sm" | "md" | "lg";

/**
 * Explicit px + stroke per size. A Lucide glyph at its default 2px stroke reads
 * thinner and smaller than a same-box emoji, so small sizes use a 14/16px box
 * with a reduced 1.75 stroke to match emoji visual weight at board/list density.
 */
const SIZE: Record<DynamicLucideIconSize, { px: number; strokeWidth: number }> = {
  sm: { px: 14, strokeWidth: 1.75 },
  md: { px: 16, strokeWidth: 1.75 },
  lg: { px: 24, strokeWidth: 2 },
};

export interface DynamicLucideIconProps {
  /** Curated Lucide component name (e.g. "FolderKanban"). */
  name: string;
  size?: DynamicLucideIconSize;
  /** Palette token (e.g. "blue"); maps to a per-mode text-color class. */
  color?: string;
  className?: string;
}

/**
 * Render a curated Lucide icon by name. The icon strokes `currentColor`, so a
 * color token resolves to a Tailwind text-color class. Returns `null` for an
 * unknown name so callers can fall back.
 */
export function DynamicLucideIcon({ name, size = "sm", color, className }: DynamicLucideIconProps) {
  const Icon = ICON_COMPONENTS[name];
  if (!Icon) return null;

  const { px, strokeWidth } = SIZE[size];
  return (
    <Icon
      width={px}
      height={px}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", iconColorClass(color), className)}
      aria-hidden="true"
    />
  );
}
