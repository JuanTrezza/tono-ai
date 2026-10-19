/**
 * Detects macOS (and other Apple platforms) to choose between ⌘ and Ctrl.
 * Prefers navigator.userAgentData (not yet in TS DOM types) and falls back to navigator.platform.
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform;
  const platform = uaPlatform || navigator.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Formats a shortcut label: "⌘H" on Mac, "Ctrl+H" elsewhere. */
export function shortcutLabel(key: string): string {
  return isMacPlatform() ? `⌘${key}` : `Ctrl+${key}`;
}
