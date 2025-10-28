/**
 * Simple end-to-end test runner for the local app (no test runner required).
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 TEST_USER_EMAIL=you@example.com TEST_USER_PASSWORD=secret node tests/e2e.test.js
 *
 * Environment variables:
 * - BASE_URL: default http://localhost:3000
 * - TEST_USER_EMAIL, TEST_USER_PASSWORD: if provided, login + authenticated tests run
 * - SKIP_AI=true to skip AI / generate endpoint test
 *
 * Note: ensure dev server is running (npm run dev) before running this script.
 */

 // Resolve a sane base URL (allow explicit BASE_URL, otherwise fallback to localhost:3001)
 function resolveBase() {
   const provided = (process.env.BASE_URL || "").trim();
   if (provided) return provided.replace(/\/+$/u, ""); // strip trailing slash
   const port = process.env.PORT || "3001";
   return `http://localhost:${port}`;
 }
 const baseResolved = resolveBase();

// Ensure base is never empty when run under vitest/CI
export const base = baseResolved && baseResolved.length ? baseResolved : "http://localhost:3001";

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
 const TEST_PWD = process.env.TEST_USER_PASSWORD;
 const SKIP_AI = process.env.SKIP_AI === "true";

const results = [];
const cookieJar = new Map();

function storeSetCookieHeaders(headers) {
  const setCookies = [];
  for (const [k, v] of headers) {
    if (k.toLowerCase() === "set-cookie") setCookies.push(v);
  }
  for (const sc of setCookies) {
    const pair = sc.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      cookieJar.set(name, value);
    }
  }
}

function buildCookieHeader() {
  const pairs = [];
  for (const [k, v] of cookieJar) pairs.push(`${k}=${v}`);
  return pairs.join("; ");
}

async function fetchWithCookies(path, opts = {}) {
  let url;
  try {
    url = path.startsWith("http") ? path : new URL(path, base).toString();
  } catch (err) {
    throw new Error(`Invalid URL built from base="${base}" and path="${path}": ${err}`);
  }
  const headers = new Headers(opts.headers || {});
  const cookie = buildCookieHeader();
  if (cookie) headers.set("Cookie", cookie);
  const res = await fetch(url, { ...opts, headers });
  storeSetCookieHeaders(res.headers);
  return res;
}

async function run() {
  console.log("E2E tests starting against", base);

  // 1) GET / (homepage)
  try {
    const r = await fetchWithCookies("/");
    const ok = r.status === 200;
    results.push({ name: "GET /", ok, status: r.status });
  } catch (e) {
    results.push({ name: "GET /", ok: false, error: String(e) });
  }

  // 2) GET /login
  try {
    const r = await fetchWithCookies("/login");
    results.push({ name: "GET /login", ok: r.status === 200, status: r.status });
  } catch (e) {
    results.push({ name: "GET /login", ok: false, error: String(e) });
  }

  // 3) unauthenticated POST /api/documents should be 401/403
  try {
    const r = await fetchWithCookies("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "a", objective: "b", rawContent: "c" }),
    });
    const ok = r.status === 401 || r.status === 403;
    results.push({ name: "POST /api/documents (unauth)", ok, status: r.status });
  } catch (e) {
    results.push({ name: "POST /api/documents (unauth)", ok: false, error: String(e) });
  }

  // 4) If credentials provided, try login + authenticated flows
  if (TEST_EMAIL && TEST_PWD) {
    try {
      const r = await fetchWithCookies("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PWD }),
      });
      const body = await r.text();
      const ok = r.status === 200 || r.status === 201;
      results.push({ name: "POST /api/auth/login", ok, status: r.status, body: body.slice(0, 200) });
      if (!ok) {
        console.warn("Login failed, skipping authenticated tests");
      } else {
        // extract csrf cookie if present
        const csrf = cookieJar.get("csrf");
        if (!csrf) console.warn("No csrf cookie found after login; client may fail mutating requests");

        // 4.a) POST /api/documents (auth)
        try {
          const headers = { "Content-Type": "application/json" };
          if (csrf) headers["x-csrf-token"] = csrf;
          const r2 = await fetchWithCookies("/api/documents", {
            method: "POST",
            headers,
            body: JSON.stringify({ title: "E2E test doc", objective: "test", rawContent: "<p>safe</p>" }),
          });
          const json = await r2.json().catch(() => null);
          const ok2 = r2.status === 201 || r2.status === 200;
          let docId = null;
          if (ok2 && json && json.id) docId = json.id;
          results.push({ name: "POST /api/documents (auth)", ok: ok2, status: r2.status, docId });

          // 4.b) GET /api/documents?lite=true
          try {
            const r3 = await fetchWithCookies("/api/documents?lite=true");
            results.push({ name: "GET /api/documents?lite=true (auth)", ok: r3.status === 200, status: r3.status });
          } catch (e) {
            results.push({ name: "GET /api/documents?lite=true (auth)", ok: false, error: String(e) });
          }

          // 4.c) if docId and not SKIP_AI, call generate endpoint (may require user key)
          if (docId && !SKIP_AI) {
            try {
              const headersG = { "Content-Type": "application/json" };
              if (csrf) headersG["x-csrf-token"] = csrf;
              const r4 = await fetchWithCookies(`/api/documents/${docId}/generate`, {
                method: "POST",
                headers: headersG,
                body: JSON.stringify({ prompt: "Write a short summary in English" }),
              });
              const ok4 = r4.status === 200 || r4.status === 201;
              const txt = await r4.text().catch(() => "");
              results.push({ name: "POST /api/documents/:id/generate", ok: ok4, status: r4.status, snippet: txt.slice(0, 200) });
            } catch (e) {
              results.push({ name: "POST /api/documents/:id/generate", ok: false, error: String(e) });
            }
          } else if (!docId) {
            results.push({ name: "POST /api/documents/:id/generate", ok: false, error: "no docId from create" });
          } else {
            results.push({ name: "POST /api/documents/:id/generate", ok: false, error: "skipped by SKIP_AI" });
          }

          // 4.d) cleanup: delete created document if possible
          if (docId) {
            try {
              const headersD = {};
              if (csrf) headersD["x-csrf-token"] = csrf;
              const rDel = await fetchWithCookies(`/api/documents/${docId}`, { method: "DELETE", headers: headersD });
              results.push({ name: "DELETE /api/documents/:id", ok: rDel.status === 200 || rDel.status === 204, status: rDel.status });
            } catch (e) {
              results.push({ name: "DELETE /api/documents/:id", ok: false, error: String(e) });
            }
          }
        } catch (e) {
          results.push({ name: "POST /api/documents (auth)", ok: false, error: String(e) });
        }
      }
    } catch (e) {
      results.push({ name: "POST /api/auth/login", ok: false, error: String(e) });
    }
  } else {
    results.push({ name: "Auth tests", ok: false, error: "TEST_USER_EMAIL / TEST_USER_PASSWORD not set, skipped" });
  }

  // Summary
  console.log("\nTest summary:");
  for (const r of results) {
    if (r.ok) {
      console.log(` ✅ ${r.name} (status: ${r.status ?? "n/a"})`);
    } else {
      console.log(` ❌ ${r.name} - ${r.error ?? `status ${r.status}`}`);
    }
  }

  // exit code
  const failed = results.filter((r) => !r.ok).length;
  // When running under Vitest, avoid calling process.exit which Vitest treats as unexpected.
  if (process.env.VITEST) {
    if (failed > 0) throw new Error(`${failed} e2e checks failed`);
    return;
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Fatal error running tests:", e);
  throw e; // remplace process.exit(2);
 });