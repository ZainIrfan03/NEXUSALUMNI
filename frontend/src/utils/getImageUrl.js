/**
 * Builds a full, browser-loadable URL for an uploaded image (avatar,
 * attachment, etc). Every page used to copy-paste this exact same
 * few lines — this is the single shared version.
 *
 * - Empty/undefined path -> "" (caller should fall back to a placeholder)
 * - Local unsaved preview ("blob:...") -> "" (never sent to the server,
 *   the caller should render the blob URL itself, not run it through this)
 * - Already-absolute URL (e.g. from a third-party host) -> returned as-is
 * - Relative path from our own backend (e.g. "/uploads/avatar123.png")
 *   -> prefixed with the API base URL from .env
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `${SOCKET_URL}${path}`;
}