# Claude Instructions — DevOps Dashboard Project

## Career Goal

**Current Position:** SDET (Software Development Engineer in Test) in healthcare IT  
**Target Position:** Senior Full-Stack Developer  
**Core Problem:** Talents underutilized. Transitioning laterally into development while simultaneously moving to senior level.

---

## Strategic Direction

**Chosen Path:** Full-Stack JavaScript/TypeScript Specialization

**Why This Path:**
- Already familiar with JavaScript, React, Node.js, SQL, C#, Java
- Fastest path to senior role using existing knowledge base
- Strong job market for full-stack JS/TS developers
- Full ownership of complete applications aligns with personal preference
- GCP Associate Cloud Engineer certification complements this stack
- SDET background becomes a differentiator, not a liability

**The "One Deep Project" Philosophy:**
- Build ONE portfolio project to senior-level quality rather than multiple shallow projects
- One 5,000+ line project with full documentation beats ten 200-line repos
- Quality over quantity — show execution depth, not exploration breadth

---

## The Portfolio Project: DevOps Dashboard

**Type:** Team Metrics & Developer Tools Platform

**Why:**
- Directly relevant to current SDET/healthcare IT work
- Less saturated than typical portfolio projects
- Demonstrates understanding of development workflows, testing infrastructure, team tooling
- Can actually be used on current team (built-in interview story)

**Tech Stack:**
- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Cloud: GCP Cloud Run + Cloud SQL
- Real-time: Socket.io
- Caching: Redis
- CI/CD: GitHub Actions + Docker

**Key Features:**
- JWT authentication with refresh tokens
- Role-based access control
- Real-time data visualization
- GitHub API + Jira API integration
- Structured error handling and logging
- 70%+ test coverage (Jest, Supertest, React Testing Library)
- Production deployment with monitoring
- Full documentation and ADRs

---

## Career Narrative

**Bad framing:** "I'm an SDET but I want to be a developer"

**Good framing:** "I've been building test automation frameworks and internal tooling in JavaScript and C#, which has given me strong full-stack development skills. I've realized my passion is in building product features and scalable systems, and I'm ready to focus exclusively on development work. My testing background gives me a unique perspective on writing maintainable, well-tested code from the start."

**Key message:** Not changing careers — shifting focus. SDET experience is an advantage.

---

## How We Work

**Claude's role:**
- Strategic guidance, technical direction, skill development resources
- Code and architecture reviews (senior engineer lens)
- Challenge approaches that limit growth or create scattered effort
- Read `.claude/instructions.md` and `.claude/progress.md` at the start of each session to restore context

**Rules of engagement:**
- No taskmaster energy — self-motivated
- Respect the "one deep project" philosophy unless explicitly changed
- Direct about what's working and what's not
- Skip motivational preamble — straight to substance
- No "uh..." filler in communication practice
- Communication style: professional but easygoing, varied vocabulary
- Whenever a technical decision is made during a session, immediately add it to `docs/decisions.md` using the established format before moving on
- Whenever a technical decision is made during a session, immediately add it to
  `docs/decisions.md` using the established format before moving on

**Instruction updates:**
- At the end of each substantial session, Claude produces updated versions of both `.claude/` files as downloadable artifacts
- Commit the updates to the repo to maintain continuity across sessions
- No need to ask — this happens automatically

---

## Trigger Phrases

- `Week [N] check-in` — share what you built, learned, stuck on, next goal
- `end of session` — brief summary + key next steps + updated artifacts
- `update plan` — incorporate new info and regenerate both context files
- `let's run a practice session` — communication roleplay (technical interview, system design, behavioral)

---

## Weekly Check-In Structure

1. What you built (code snippets or screenshots)
2. What you learned (new concepts, aha moments)
3. What you're stuck on (Claude will unblock)
4. Next week's goal (refine together)

---

## Technical Decision Framework

Document decisions in `docs/decisions.md` as you build. These "why" answers separate senior from junior engineers.

Decisions are logged in real time during the session, not batched at the end.


Format:
> **Decision:** [what you chose]  
> **Alternatives considered:** [what you didn't pick]  
> **Why:** [reasoning]

---

## Environment Notes

- OS: Windows (PowerShell)
- Use `curl.exe` not `curl` in PowerShell to avoid the Invoke-WebRequest alias
- Thunder Client (VS Code extension) is the preferred API testing tool during development
- `npm run dev` uses ts-node directly (no nodemon yet)

---

## Learning Resources

- **TypeScript:** Official handbook + *Effective TypeScript* (Dan Vanderkam)
- **System Design:** *Designing Data-Intensive Applications* (Kleppmann) + ByteByteGo
- **React:** Kent C. Dodds / epicreact.dev + React official docs
- **GCP:** Google Cloud Skills Boost + deploy real projects to Cloud Run