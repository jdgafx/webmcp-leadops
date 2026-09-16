// ================================================================
// LeadOps — WebMCP integration
// Declarative tool forms (Chrome 146+ testing flag) + guarded
// imperative registerTool() for when the stable API ships.
// ================================================================

import {
  addLead,
  listLeads,
  updateLeadStatus,
  addNote,
  stats,
  log,
  renderLeads,
  renderTools,
} from "./app.js";

// ── Step 1: feature detection ───────────────────────────────────
// Chrome 146+ (flag #enable-webmcp-testing): navigator.modelContextTesting
// Stable spec: navigator.modelContext / document.modelContext
const mcpApi =
  navigator.modelContextTesting || navigator.modelContext || null;

const statusEl = document.getElementById("webmcp-status");

if (mcpApi) {
  statusEl.textContent = "WebMCP: ACTIVE — tools exposed to agents";
  statusEl.className = "status status--live";
  log("info", "navigator.modelContext detected — declarative tools registered by the browser");
} else {
  statusEl.textContent = "WebMCP: not detected — Local Agent Simulator active (same tool contracts)";
  statusEl.className = "status status--fallback";
  log("info", "no modelContext API — tool forms still work; simulator dispatches them directly");
}

// ── Step 2: declarative tool handlers ───────────────────────────
// The browser invokes these forms when an agent calls the tool.
// e.agentInvoked distinguishes agent calls from human clicks.

function respondToAgent(e, payload) {
  if (e.agentInvoked && typeof e.respondWith === "function") {
    e.respondWith(
      Promise.resolve({
        content: [{ type: "text", text: JSON.stringify(payload) }],
      })
    );
  }
}

document.getElementById("add-lead-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lead = addLead({
    company: f.get("company"),
    contact: f.get("contact"),
    source: f.get("source") || "inbound",
  });
  renderLeads();
  const msg = `Lead #${lead.id} "${lead.company}" added (${lead.source}). Pipeline: ${stats().total} leads.`;
  log(e.agentInvoked ? "agent" : "human", `add-lead → ${msg}`);
  respondToAgent(e, { added: lead.id, company: lead.company, total: stats().total });
  e.target.reset();
});

document.getElementById("list-leads-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const filter = (f.get("status") || "").trim();
  const rows = listLeads(filter || undefined).map((l) => ({
    id: l.id, company: l.company, contact: l.contact, status: l.status, notes: l.notes.length,
  }));
  log(e.agentInvoked ? "agent" : "human", `list-leads${filter ? ` (${filter})` : ""} → ${rows.length} rows`);
  respondToAgent(e, { count: rows.length, leads: rows });
});

document.getElementById("update-lead-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const id = Number(f.get("id"));
  const status = (f.get("status") || "").trim();
  const result = updateLeadStatus(id, status);
  renderLeads();
  if (!result) {
    log("agent", `update-lead-status(${id}, ${status}) → not found`);
    respondToAgent(e, { error: `lead ${id} not found` });
    return;
  }
  if (result.error) {
    log("agent", `update-lead-status(${id}, ${status}) → ${result.error}`);
    respondToAgent(e, result);
    return;
  }
  log(e.agentInvoked ? "agent" : "human", `update-lead-status(#${id}) → ${status}`);
  respondToAgent(e, { updated: id, status: result.status });
});

document.getElementById("add-note-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const id = Number(f.get("id"));
  const note = (f.get("note") || "").trim();
  const entry = addNote(id, note);
  renderLeads();
  if (!entry) {
    log("agent", `add-note(${id}) → not found`);
    respondToAgent(e, { error: `lead ${id} not found` });
    return;
  }
  log(e.agentInvoked ? "agent" : "human", `add-note(#${id}) → "${note}"`);
  respondToAgent(e, { noted: id, at: entry.at });
});

document.getElementById("stats-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const s = stats();
  log(e.agentInvoked ? "agent" : "human", `lead-stats → ${s.total} leads, ${s.won} won, ${s.conversionRate ?? "n/a"}% conversion`);
  respondToAgent(e, s);
});

// ── Step 3: contextual tool descriptions ────────────────────────
// The agent always sees live pipeline state inside the tool's
// description — no separate read call needed first.

const listForm = document.getElementById("list-leads-form");
function syncToolDescriptionsForAgents() {
  const s = stats();
  listForm.setAttribute(
    "tooldescription",
    `List leads in the pipeline. Current state: ${s.total} leads — ${s.new} new, ${s.contacted} contacted, ${s.won} won, ${s.lost} lost. Optional filter by status (new | contacted | won | lost).`
  );
}
// keeps tooldescription in sync for agents: lead-list mutations = state changes
new MutationObserver(syncToolDescriptionsForAgents).observe(document.getElementById("lead-list"), { childList: true });
syncToolDescriptionsForAgents();

// ── Step 4: tool registry UI (what an agent would discover) ─────

renderTools([
  { name: "add-lead", desc: "Add a new lead. Human confirms (visible form).", input: { company: "string", contact: "string", source: "string" } },
  { name: "list-leads", desc: "List/filter leads. Description carries live pipeline counts.", input: { status: "new|contacted|won|lost" } },
  { name: "update-lead-status", desc: "Move a lead through the pipeline.", input: { id: "number", status: "new|contacted|won|lost" } },
  { name: "add-note", desc: "Append a timestamped note to a lead.", input: { id: "number", note: "string" } },
  { name: "lead-stats", desc: "Counts per status + conversion rate.", input: {} },
]);

// ── Step 5: imperative API (guarded, future-ready) ──────────────

async function registerImperativeTools() {
  if (!mcpApi || typeof mcpApi.registerTool !== "function") return;
  // When Chrome ships the stable API these become first-class:
  await mcpApi.registerTool({
    name: "lead-stats",
    description: "Pipeline summary: counts per status and conversion rate.",
    inputSchema: { type: "object", properties: {} },
    execute() {
      const s = stats();
      return { content: [{ type: "text", text: JSON.stringify(s) }] };
    },
  });
  log("info", "imperative registerTool() available — stats tool dual-registered");
}
registerImperativeTools();
