import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a safe URL string only when the protocol is http or https.
 * Rejects javascript:, data:, vbscript:, and other schemes to prevent
 * stored XSS from user-supplied URL fields (website, linkedin, etc.).
 */
export function safeExternalUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    // If the value already has a scheme-separator, parse as-is; otherwise
    // assume https so bare domains (e.g. "example.com") resolve correctly.
    const parsed = new URL(url.includes("://") ? url : `https://${url}`);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    // malformed URL — fall through to undefined
  }
  return undefined;
}
