import { baseUrl } from "./constants";

export function getAbsoluteURL(url: string) {
  const hasSiteURL = url.startsWith(baseUrl);
  const startsWithSlash = url[0] === "/";

  if (hasSiteURL) return url;
  if (startsWithSlash) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}
