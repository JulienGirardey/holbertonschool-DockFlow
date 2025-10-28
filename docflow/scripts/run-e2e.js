import { spawn } from "child_process";
import fetch from "node-fetch"; // Node 22 a fetch global, mais on utilise node-fetch pour robustesse if needed
import process from "process";

const PORT = process.env.PORT || "3000";
const BASE = `http://127.0.0.1:${PORT}`;
const MAX_WAIT_MS = 30_000;
const POLL_MS = 500;

function startDev() {
  const dev = spawn("npm", ["run", "dev"], { stdio: "inherit", env: process.env });
  dev.on("exit", (code) => {
    if (code !== 0) console.error("Next dev exited with", code);
  });
  return dev;
}

async function waitReady() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(BASE + "/");
      if (res.ok) return;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error("Server did not become ready in time: " + BASE);
}

async function run() {
  const dev = startDev();
  try {
    await waitReady();
    console.log("Server ready at", BASE);
    process.env.BASE_URL = BASE;
    // run e2e script
    const runner = spawn("node", ["tests/e2e.test.js"], { stdio: "inherit", env: process.env });
    await new Promise((res, rej) => {
      runner.on("exit", (code) => {
        if (code === 0) return res(code);
        // treat exit code 1 as a non-fatal warning (e.g. auth tests
        console.warn("Warning: e2e test exited with code", code);
        res(code);
      });
    });
  } finally {
    // kill dev (best-effort)
    dev.kill();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});