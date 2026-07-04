export function getCookieHeader(setCookie: string | null) {
  if (!setCookie) {
    return "";
  }

  return setCookie
    .split(/,(?=\s*[^;]+=[^;]+)/)
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}
