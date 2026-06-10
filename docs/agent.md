# Claude AI Agent

A natural language interface embedded in the DevOps Dashboard. Ask questions about your pipeline, commits, repo config, and system health in plain English — Claude reasons over your live data and answers directly.

## How It Works

The agent runs a standard tool-use loop using the Anthropic API:

1. User types a message in the chat window
2. Frontend sends the message + full conversation history to `POST /api/agent/chat`
3. Express calls the Anthropic API with the message and tool definitions
4. Claude decides which tool(s) to call based on the question
5. Express executes the tool (queries DB, GitHub API, or Redis)
6. Tool result is returned to Claude
7. Claude returns a natural language answer
8. Frontend displays the answer in the chat window

The backend is stateless — conversation history is sent from the client on every request. No server-side session storage required.

## Tools

### `get_pipeline_health`
Returns recent GitHub Actions workflow runs for the user's configured repo.

**Data:** run name, status, conclusion, duration, timestamp, link to GitHub Actions  
**Source:** GitHub REST API (cached in Redis, 5-min TTL)  
**Example questions:** "How many deployments failed this week?", "What's my pipeline success rate?", "When did the last run finish?"

---

### `get_commit_activity`
Returns commit counts for the last 90 days for the user's configured repo.

**Data:** date-keyed commit counts over a 90-day window  
**Source:** GitHub REST API (cached in Redis, 5-min TTL)  
**Example questions:** "How active have I been this month?", "What was my busiest week?", "How many commits did I make last week?"

---

### `get_repo_config`
Returns the repo the authenticated user has configured in the dashboard.

**Data:** owner, repo name (PAT excluded from agent responses)  
**Source:** PostgreSQL via Prisma  
**Example questions:** "What repo am I tracking?", "What's my configured repository?"

---

### `get_system_health`
Returns the current health status of the API and its dependencies.

**Data:** API status, database connectivity, Redis connectivity  
**Source:** Live dependency checks (DB SELECT 1 + Redis PING)  
**Example questions:** "Is the API healthy?", "Is Redis up?", "Are there any system issues?"

---

## Architecture

```
ChatWindow.tsx (React)
    │
    │  POST /api/agent/chat
    │  { message, history }
    ▼
agent.routes.ts
    │
    │  authenticate middleware
    ▼
agent.controller.ts
    │
    ├── Anthropic API (tool definitions + conversation)
    │
    └── Tool execution:
        ├── get_pipeline_health  → github.controller logic
        ├── get_commit_activity  → github.controller logic
        ├── get_repo_config      → prisma (TrackedRepo)
        └── get_system_health    → health check logic
```

## Design Decisions

**Read-only tools only** — write actions (trigger workflow, update config) add UX complexity around confirmation and error handling with no demo value. The agent answers questions; it doesn't take actions.

**Stateless backend** — conversation history lives in React component state and is sent up with each request. No new storage layer needed. Claude has no memory between sessions — each page load starts a fresh conversation.

**Own API key** — the Anthropic API key is server-side only, stored as an environment variable. Never exposed to the client. Portfolio traffic is negligible so cost risk is near zero; user-supplied keys would add setup friction to the demo.

**Floating chat window** — accessible from any dashboard page without navigation. Feels like a tool, not a destination.

## Adding New Tools

1. Define the tool in `agent.controller.ts` in the `tools` array (Anthropic tool definition format)
2. Add a case to the `executeTool` function that calls the appropriate data source
3. Update this file

Tools should be read-only and scoped to the authenticated user's data.

## Environment Variables

```
ANTHROPIC_API_KEY=your_api_key_here
```

Add to `.env` for local development. Add to Cloud Run environment variables for production.
