export type ShortcutContext = Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">;

export const shortcutHelpEntries = [
  { key: "?", description: "Open shortcuts help" },
  { key: "n", description: "Open the task manager" },
  { key: "Esc", description: "Close overlays" },
];

export function normalizeShortcutKey(key: string) {
  return key.toLowerCase();
}

export function matchesShortcutKey(
  event: ShortcutContext,
  shortcut: string,
  options?: { allowModifier?: boolean },
) {
  const normalizedShortcut = normalizeShortcutKey(shortcut);
  const isModifierPressed = event.ctrlKey || event.metaKey || event.altKey;

  if (options?.allowModifier === true) {
    return normalizeShortcutKey(event.key) === normalizedShortcut;
  }

  return (
    !isModifierPressed &&
    !event.shiftKey &&
    normalizeShortcutKey(event.key) === normalizedShortcut
  );
}
