import { SOCKET_URL } from "../consts/appConstants";

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `${SOCKET_URL}${path}`;
}
