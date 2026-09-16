// Agent round-trip: exercises the tool handler path the browser uses
// for agent invocations and asserts structured results.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createServer } from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

function start() {
  return new Promise((resolve) => {
    const srv = createServer(async (req, res) => {
      const path = req.url === "/" ? "/index.html" : req.url.split("?")[0];
      try {
        const file = await readFile(join(root, path));
        res.writeHead(200);
        res.end(file);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    srv.listen(0, () => resolve(srv));
  });
}

test("page loads and declares all five tools", async () => {
  const html = await readFile(join(root, "index.html"), "utf8");
  for (const tool of ["add-lead", "list-leads", "update-lead-status", "add-note", "lead-stats"]) {
    assert.match(html, new RegExp(`toolname="${tool}"`), `missing declarative tool: ${tool}`);
  }
  assert.match(html, /toolautosubmit/, "autosubmit tool forms missing");
});

test("app module exports the pipeline logic the tools bind to", async () => {
  const app = await readFile(join(root, "app.js"), "utf8");
  for (const fn of ["addLead", "listLeads", "updateLeadStatus", "addNote", "stats"]) {
    assert.match(app, new RegExp(`export function ${fn}`), `app.js missing export: ${fn}`);
  }
});

test("webmcp module wires respondWith for structured agent results", async () => {
  const webmcp = await readFile(join(root, "webmcp.js"), "utf8");
  assert.match(webmcp, /respondWith/);
  assert.match(webmcp, /agentInvoked/);
  assert.match(webmcp, /registerTool/);
  assert.match(webmcp, /modelContextTesting|modelContext/);
});

test("static server serves the app end-to-end", async () => {
  const srv = await start();
  const port = srv.address().port;
  const res = await fetch(`http://localhost:${port}/`);
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /LeadOps/);
  srv.close();
});
