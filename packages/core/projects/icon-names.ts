/**
 * Curated set of Lucide icon names a project marker may use.
 *
 * Pure data — no React, no `lucide-react` import — so this lives in `core` and
 * can be reused by mobile (MUL-6) via `import type` / value import without
 * pulling a DOM-only icon library. The matching renderer
 * (`packages/ui/components/common/lucide-icon.tsx`) keeps a static
 * name → component record for exactly these names; any name not in that record
 * (or not in this list) falls back to the default project glyph.
 *
 * Each entry carries:
 *   - `name`     the PascalCase Lucide component name (the stored token)
 *   - `label`    a human, Title Case name for `aria-label` and display
 *   - `keywords` extra search terms so typing "launch" finds `Rocket`,
 *                "board" finds `FolderKanban`, etc. Search matches name +
 *                label + keywords, so the picker is fast for human terms
 *                rather than only the PascalCase identifier.
 */
export interface ProjectIconEntry {
  name: string;
  label: string;
  keywords: string[];
}

export const PROJECT_ICONS: readonly ProjectIconEntry[] = [
  { name: "FolderKanban", label: "Board", keywords: ["folder", "board", "kanban", "project", "tasks"] },
  { name: "Folder", label: "Folder", keywords: ["folder", "directory", "files"] },
  { name: "Rocket", label: "Rocket", keywords: ["rocket", "launch", "ship", "startup"] },
  { name: "Star", label: "Star", keywords: ["star", "favorite", "featured"] },
  { name: "Heart", label: "Heart", keywords: ["heart", "love", "like", "health"] },
  { name: "Flag", label: "Flag", keywords: ["flag", "milestone", "goal", "marker"] },
  { name: "Bookmark", label: "Bookmark", keywords: ["bookmark", "save", "tag"] },
  { name: "Briefcase", label: "Briefcase", keywords: ["briefcase", "work", "business", "job"] },
  { name: "Building2", label: "Building", keywords: ["building", "office", "company", "org"] },
  { name: "Calendar", label: "Calendar", keywords: ["calendar", "date", "schedule", "event"] },
  { name: "Camera", label: "Camera", keywords: ["camera", "photo", "picture"] },
  { name: "Cloud", label: "Cloud", keywords: ["cloud", "weather", "storage", "sky"] },
  { name: "Code", label: "Code", keywords: ["code", "dev", "programming", "engineering"] },
  { name: "Coffee", label: "Coffee", keywords: ["coffee", "cafe", "break", "drink"] },
  { name: "Compass", label: "Compass", keywords: ["compass", "navigate", "direction", "explore"] },
  { name: "Cpu", label: "CPU", keywords: ["cpu", "chip", "processor", "hardware"] },
  { name: "CreditCard", label: "Credit Card", keywords: ["credit", "card", "payment", "billing", "money"] },
  { name: "Database", label: "Database", keywords: ["database", "db", "data", "storage"] },
  { name: "FileText", label: "Document", keywords: ["file", "document", "doc", "text", "page"] },
  { name: "Flame", label: "Flame", keywords: ["flame", "fire", "hot", "trending"] },
  { name: "Gift", label: "Gift", keywords: ["gift", "present", "reward", "box"] },
  { name: "Globe", label: "Globe", keywords: ["globe", "world", "web", "internet", "global"] },
  { name: "GraduationCap", label: "Graduation", keywords: ["graduation", "education", "learn", "school", "course"] },
  { name: "Hammer", label: "Hammer", keywords: ["hammer", "build", "tool", "construction"] },
  { name: "Headphones", label: "Headphones", keywords: ["headphones", "audio", "music", "support"] },
  { name: "Home", label: "Home", keywords: ["home", "house", "dashboard", "main"] },
  { name: "Image", label: "Image", keywords: ["image", "photo", "picture", "media"] },
  { name: "Inbox", label: "Inbox", keywords: ["inbox", "mail", "messages", "tray"] },
  { name: "Key", label: "Key", keywords: ["key", "access", "auth", "security", "password"] },
  { name: "Lightbulb", label: "Lightbulb", keywords: ["lightbulb", "idea", "tip", "inspiration"] },
  { name: "Lock", label: "Lock", keywords: ["lock", "secure", "private", "security"] },
  { name: "Mail", label: "Mail", keywords: ["mail", "email", "message", "envelope"] },
  { name: "Map", label: "Map", keywords: ["map", "location", "roadmap", "plan"] },
  { name: "MapPin", label: "Pin", keywords: ["pin", "location", "place", "marker", "map"] },
  { name: "Megaphone", label: "Megaphone", keywords: ["megaphone", "announce", "marketing", "broadcast"] },
  { name: "MessageCircle", label: "Message", keywords: ["message", "chat", "comment", "talk"] },
  { name: "Music", label: "Music", keywords: ["music", "audio", "song", "note"] },
  { name: "Package", label: "Package", keywords: ["package", "box", "shipping", "release", "product"] },
  { name: "Palette", label: "Palette", keywords: ["palette", "design", "color", "art", "paint"] },
  { name: "PenTool", label: "Pen", keywords: ["pen", "design", "draw", "edit", "vector"] },
  { name: "Phone", label: "Phone", keywords: ["phone", "call", "contact", "mobile"] },
  { name: "PieChart", label: "Chart", keywords: ["chart", "pie", "analytics", "stats", "report"] },
  { name: "Plane", label: "Plane", keywords: ["plane", "travel", "flight", "trip"] },
  { name: "Puzzle", label: "Puzzle", keywords: ["puzzle", "plugin", "integration", "piece", "extension"] },
  { name: "Settings", label: "Settings", keywords: ["settings", "config", "gear", "options", "preferences"] },
  { name: "Shield", label: "Shield", keywords: ["shield", "security", "protection", "safety", "guard"] },
  { name: "ShoppingCart", label: "Cart", keywords: ["cart", "shopping", "store", "ecommerce", "buy"] },
  { name: "Sparkles", label: "Sparkles", keywords: ["sparkles", "ai", "magic", "new", "shine"] },
  { name: "Target", label: "Target", keywords: ["target", "goal", "objective", "aim", "focus"] },
  { name: "Terminal", label: "Terminal", keywords: ["terminal", "console", "shell", "cli", "command"] },
  { name: "ThumbsUp", label: "Thumbs Up", keywords: ["thumbs", "like", "approve", "good"] },
  { name: "Trophy", label: "Trophy", keywords: ["trophy", "win", "award", "achievement", "prize"] },
  { name: "Truck", label: "Truck", keywords: ["truck", "delivery", "shipping", "logistics"] },
  { name: "Umbrella", label: "Umbrella", keywords: ["umbrella", "rain", "protection", "insurance"] },
  { name: "User", label: "User", keywords: ["user", "person", "account", "profile"] },
  { name: "Users", label: "Users", keywords: ["users", "team", "people", "group", "members"] },
  { name: "Wallet", label: "Wallet", keywords: ["wallet", "money", "finance", "payment", "budget"] },
  { name: "Wrench", label: "Wrench", keywords: ["wrench", "tool", "fix", "maintenance", "settings"] },
  { name: "Zap", label: "Zap", keywords: ["zap", "energy", "fast", "power", "lightning", "bolt"] },
  { name: "Bug", label: "Bug", keywords: ["bug", "issue", "defect", "error", "qa"] },
  { name: "Beaker", label: "Beaker", keywords: ["beaker", "lab", "experiment", "test", "science"] },
  { name: "Bell", label: "Bell", keywords: ["bell", "notification", "alert", "reminder"] },
  { name: "Book", label: "Book", keywords: ["book", "docs", "read", "library", "guide"] },
  { name: "Box", label: "Box", keywords: ["box", "package", "container", "cube"] },
  { name: "Leaf", label: "Leaf", keywords: ["leaf", "nature", "eco", "green", "plant"] },
  { name: "Anchor", label: "Anchor", keywords: ["anchor", "stable", "ship", "marine"] },
];

export const PROJECT_ICON_NAMES: readonly string[] = PROJECT_ICONS.map((i) => i.name);

const ICON_NAME_SET = new Set(PROJECT_ICON_NAMES);

/** True only for a name in the curated set. Empty string and unknown names are false. */
export function isValidIconName(name: string): boolean {
  return ICON_NAME_SET.has(name);
}
