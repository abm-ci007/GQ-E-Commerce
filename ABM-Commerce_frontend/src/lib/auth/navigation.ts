/** Keep post-auth redirects on this site and reject protocol-relative URLs. */
export function safeReturnPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(value, "http://abm-market.local");
    return url.origin === "http://abm-market.local"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
