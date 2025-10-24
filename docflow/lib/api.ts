export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const merged: RequestInit = {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  };
  return fetch(input, merged);
}