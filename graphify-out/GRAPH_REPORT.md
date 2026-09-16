# Graph Report - webmcp-leadops  (2026-09-16)

## Corpus Check
- 6 files · ~2,336 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 42 nodes · 50 edges · 6 communities (4 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- package.json
- webmcp.js
- app.js
- server.js
- LeadOps — WebMCP Agent Console
- agent-roundtrip.test.mjs

## God Nodes (most connected - your core abstractions)
1. `LeadOps — WebMCP Agent Console` - 7 edges
2. `stats()` - 4 edges
3. `scripts` - 3 edges
4. `getLead()` - 3 edges
5. `updateLeadStatus()` - 3 edges
6. `addNote()` - 3 edges
7. `log()` - 3 edges
8. `registerImperativeTools()` - 3 edges
9. `The five tools` - 3 edges
10. `addLead()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `registerImperativeTools()` --calls--> `stats()`  [EXTRACTED]
  public/webmcp.js → public/app.js
- `syncToolDescriptionsForAgents()` --calls--> `stats()`  [EXTRACTED]
  public/webmcp.js → public/app.js
- `registerImperativeTools()` --calls--> `log()`  [EXTRACTED]
  public/webmcp.js → public/app.js

## Import Cycles
- None detected.

## Communities (6 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.22
Nodes (8): description, license, name, scripts, start, test, type, version

### Community 1 - "webmcp.js"
Cohesion: 0.31
Nodes (7): addLead(), log(), stats(), listForm, registerImperativeTools(), statusEl, syncToolDescriptionsForAgents()

### Community 2 - "app.js"
Cohesion: 0.32
Nodes (7): addNote(), getLead(), leads, listLeads(), renderLeads(), renderTools(), updateLeadStatus()

### Community 4 - "LeadOps — WebMCP Agent Console"
Cohesion: 0.20
Nodes (9): Agent round-trip test, Architecture, Contextual tool descriptions, Human-in-the-loop by construction, LeadOps — WebMCP Agent Console, License, Quickstart, The five tools (+1 more)

## Knowledge Gaps
- **20 isolated node(s):** `name`, `version`, `description`, `type`, `start` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 23 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `version`, `description` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._