# LeadOps — WebMCP Agent Console

A working demonstration of the **W3C WebMCP API** (`document.modelContext`): a lead-tracking console that exposes five structured tools to AI agents through the browser, with zero dependencies.

Humans and agents share one state, one UI, and one event log. The agent doesn't screen-scrape the DOM — it calls named tools with JSON-schema inputs and gets structured JSON back, exactly like a Model Context Protocol server, except the "server" is the page itself.

## Why WebMCP

WebMCP ([W3C proposal](https://webmachinelearning.github.io/webmcp/)) lets a web page register tools that agents discover and invoke through browser-mediated, secure channels:

- **Local tool handling** — no backend changes, no OAuth dance; tools run in the page using existing client-side logic.
- **Shared context** — the agent and the human look at the same UI while collaborating.
- **MCP-aligned** — tool descriptors match the MCP shape, so any MCP-compatible agent can consume them with a thin adapter.

## Quickstart

```bash
npm start            # zero dependencies, Node 18+
# → http://localhost:3210
```

For native agent registration, Chrome 146+ with the testing flag:

1. Open `chrome://flags/#enable-webmcp-testing`
2. Set **Enabled**, relaunch
3. Open the app — the header badge flips to `WebMCP: ACTIVE`

Without the flag the app runs in **Local Agent Simulator** mode: the same tool forms, the same handlers, the same structured responses — dispatched directly, so the demo works everywhere and the agent path is identical code.

## The five tools

| Tool | Registration | Input | Purpose |
|---|---|---|---|
| `add-lead` | Declarative, **visible** form | `company, contact, source` | Adds a lead. Agent pre-fills, human confirms — built-in human-in-the-loop. |
| `list-leads` | Declarative, hidden `toolautosubmit` | `status?` | Lists/filter leads. The tool's *description* carries live pipeline counts. |
| `update-lead-status` | Declarative, hidden | `id, status` | Moves a lead through `new → contacted → won/lost`. |
| `add-note` | Declarative, hidden | `id, note` | Appends a timestamped note to a lead. |
| `lead-stats` | Declarative + guarded imperative `registerTool()` | — | Counts per status + conversion rate. |

### Contextual tool descriptions

`list-leads`' `tooldescription` is rewritten on every state change (`syncToolDescriptionsForAgents`), so the agent always sees live pipeline counts without a separate read call:

```
List leads in the pipeline. Current state: 3 leads — 1 new, 1 contacted, 1 won, 0 lost. …
```

### Human-in-the-loop by construction

The visible `add-lead` form has no `toolautosubmit`: when an agent invokes it, the browser fills the fields and **waits for the user to click Add**. Structured results are returned to the agent via `e.respondWith()` only after the human confirms.

## Architecture

```
public/
  index.html    declarative tool forms (toolname / tooldescription / toolautosubmit)
  app.js        pure state + rendering (no framework)
  webmcp.js     feature detection → declarative handlers → contextual descriptions
                → registry UI → guarded imperative registerTool()
  style.css
server.js       zero-dependency static server
tests/          agent round-trip test
```

## Agent round-trip test

```bash
npm test
```

Drives the exact handler path an agent invocation takes — form submit with `agentInvoked` semantics, structured response assertion — so the tool contracts are regression-tested, not just demoed.

## License

MIT
