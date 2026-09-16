// ================================================================
// LeadOps — application state + rendering (pure, no framework)
// ================================================================

let leads = [];
let nextId = 1;

export function addLead({ company, contact = "", source = "inbound" }) {
  const lead = {
    id: nextId++,
    company,
    contact,
    source,
    status: "new",
    notes: [],
    added: new Date().toISOString().slice(0, 10),
  };
  leads.push(lead);
  return lead;
}

export function listLeads(statusFilter) {
  return statusFilter ? leads.filter((l) => l.status === statusFilter) : [...leads];
}

export function getLead(id) {
  return leads.find((l) => l.id === Number(id));
}

export function updateLeadStatus(id, status) {
  const lead = getLead(id);
  if (!lead) return null;
  if (!["new", "contacted", "won", "lost"].includes(status)) return { error: `invalid status "${status}"` };
  lead.status = status;
  return lead;
}

export function addNote(id, note) {
  const lead = getLead(id);
  if (!lead) return null;
  const entry = { at: new Date().toISOString().slice(0, 16).replace("T", " "), text: note };
  lead.notes.push(entry);
  return entry;
}

export function stats() {
  const count = (s) => leads.filter((l) => l.status === s).length;
  const total = leads.length;
  const won = count("won");
  const closed = won + count("lost");
  return {
    total,
    new: count("new"),
    contacted: count("contacted"),
    won,
    lost: count("lost"),
    conversionRate: closed ? +(won / closed * 100).toFixed(1) : null,
  };
}

// ── rendering ───────────────────────────────────────────────────

export function log(kind, text) {
  const box = document.getElementById("event-log");
  const line = document.createElement("p");
  line.className = `log-line log-${kind}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

export function renderTools(tools) {
  const ul = document.getElementById("tool-registry");
  ul.innerHTML = "";
  for (const t of tools) {
    const li = document.createElement("li");
    const params = t.input
      ? Object.keys(t.input)
          .map((k) => `<code>${k}</code>`)
          .join(" ")
      : "—";
    li.innerHTML = `<div class="tool-name">${t.name}</div><div class="tool-desc">${t.desc}</div><div class="tool-params">${params}</div>`;
    ul.appendChild(li);
  }
}

export function renderLeads() {
  const ul = document.getElementById("lead-list");
  ul.innerHTML = "";
  document.getElementById("lead-count").textContent = leads.length;
  document.getElementById("empty-message").style.display = leads.length ? "none" : "block";
  for (const l of leads) {
    const li = document.createElement("li");
    li.className = `lead lead--${l.status}`;
    li.innerHTML = `
      <div class="lead-main">
        <strong>#${l.id} ${l.company}</strong>
        <span class="lead-contact">${l.contact || "—"}</span>
      </div>
      <div class="lead-meta">
        <span class="pill pill--${l.status}">${l.status}</span>
        <span class="lead-source">${l.source}</span>
        ${l.notes.length ? `<span class="lead-notes">${l.notes.length} note${l.notes.length > 1 ? "s" : ""}</span>` : ""}
      </div>`;
    ul.appendChild(li);
  }
}
