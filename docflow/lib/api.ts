export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const method = (init?.method || "GET").toString().toUpperCase();

  // normalize headers into a plain object
  const incomingHeaders = init?.headers || {};
  const baseHeaders: Record<string, string> =
    incomingHeaders instanceof Headers
      ? Object.fromEntries(Array.from(incomingHeaders.entries()))
      : (incomingHeaders as Record<string, string>);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...baseHeaders,
  };

  // Client-side only: attach CSRF token for mutating requests (double-submit)
  if (typeof window !== "undefined" && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const match = document.cookie.match(/(^|; )csrf=([^;]+)/);
    if (match) {
      try {
        headers["x-csrf-token"] = decodeURIComponent(match[2]);
      } catch {
        headers["x-csrf-token"] = match[2];
      }
    }
  }

  const merged: RequestInit = {
    credentials: "include",
    headers,
    ...init,
  };
  return fetch(input, merged);
}