# SWE Training Curriculum — Session Tracking

> This file is for training context only. Remove before presenting the project.
> Location: `.claude/curriculum_tracking.md`

---

## Schedule
| Day | Track |
|-----|-------|
| Monday | Track 1 — Algorithms + LeetCode |
| Wednesday | Track 1 — Algorithms revisit + new problem |
| Tuesday | Track 2 or 3 — SWE Concepts or Stack Deep Dive |
| Thursday | Track 2 or 3 — SWE Concepts or Stack Deep Dive |
| Friday | Flexible |
| Weekends | Off |

**Every session includes one LeetCode problem + one concept.**

---

## LeetCode Progress

| # | Problem | Pattern | Difficulty | Status |
|---|---------|---------|------------|--------|
| 1 | Two Sum | Hash map | Easy | ✅ |
| 125 | Valid Palindrome | Two pointers | Easy | ✅ |
| 167 | Two Sum II | Two pointers (sorted) | Medium | ✅ |
| 217 | Contains Duplicate | Hash map / Set | Easy | ✅ |
| 121 | Best Time to Buy and Sell Stock | Sliding window | Easy | ✅ |
| 3 | Longest Substring Without Repeating Characters | Sliding window + Set | Medium | ✅ |
| 643 | Maximum Average Subarray I | Sliding window (fixed) | Easy | ✅ |
| 509 | Fibonacci Number | Recursion | Easy | ✅ |

**Total solved:** 8
**Current pace:** ~4 problems per week

---

## Patterns Covered

### Hash Map
- Store what you've seen as you walk forward
- Check existence with `.has()`, retrieve with `.get()`
- O(n) time, O(n) space
- Use when you need to remember what you've seen
- Problems: Two Sum, Contains Duplicate

### Two Pointers
- One pointer at each end moving inward, or two moving in the same direction
- O(n) time, O(1) space
- Use when comparing positions in a sequence
- Sorting unlocks two pointers — move based on whether sum is too big or too small
- Problems: Valid Palindrome, Two Sum II

### Sliding Window
- Left and right pointer defining a window that moves forward
- Fixed size: window slides one step, subtract element leaving, add element entering
- Variable size: right expands, left contracts when condition breaks
- O(n) time, O(1) or O(n) space depending on what's tracked inside window
- Problems: Best Time to Buy and Sell Stock, Longest Substring, Maximum Average Subarray

### Recursion
- Function calls itself with a smaller version of the problem
- Two required parts: base case (stops recursion) and recursive case (moves toward base)
- Return sends value back up to caller, not back into itself
- Call stack unwinds from innermost call outward
- Problems: Fibonacci Number

---

## Concepts Covered

### Track 3 — TypeScript
- **Type system fundamentals** — primitives, arrays, function signatures, return types
- **Union types** — `string | undefined`, `"admin" | "viewer"`
- **Interfaces vs type aliases** — interface for objects, type for unions/compositions
- **Optional properties** (`?`) and `readonly`
- **Type inference** — let TypeScript infer where it can
- **`any` vs `unknown`** — never use `any`, use `unknown` and narrow with typeof checks
- **Non-null assertion** (`!`) — tells compiler value isn't undefined. Use sparingly.
- **Optional chaining** (`?.`) — safely access properties that might be undefined
- **Generics** — type placeholder `<T>` filled in at call time, inferred from arguments
- **Generic constraints** (`extends`) — guarantees T has certain properties
- **Utility types:**
  - `Partial<T>` — makes all properties optional. Use for update endpoints.
  - `Pick<T, K>` — keep only specified properties. Use for API responses.
  - `Omit<T, K>` — remove specified properties. Use for create operations.
  - `Record<K, V>` — typed object with fixed key set. K = keys, V = value type.

### Track 2 — SWE Concepts
- **REST API design** — URLs are nouns, methods are verbs, collections are plural
- **HTTP methods** — GET, POST, PUT, PATCH, DELETE and when to use each
- **Status codes** — 200, 201, 400, 401, 403, 404, 500. Key: 401 = not authenticated, 403 = not authorized
- **Nested resources** — one level deep max (`/deployments/:id/jobs`)
- **Response shape consistency** — `ApiResponse<T>` wrapper across all endpoints
- **Connecting to project** — identified inconsistent response shapes in `auth.controller.ts` and `console.log` usage to replace with logger

---

## Dashboard Code Work

### src/types/api.ts — Added
- New shared `ApiResponse<T>` interface — `{ status: 'success' | 'error', data?: T, message?: string }`
- Used across all controllers as the single source of truth for response shape

### auth.controller.ts — Complete
- Applied `ApiResponse<T>` wrapper with `satisfies` to all responses
- Replaced all `console.log` with `logger.debug` / `logger.info`
- Moved `source: 'cache'` from response body to logger

### user.controller.ts — Complete
- Applied `ApiResponse<T>` wrapper to `getUserById`, `updateUser`, `getMe`
- `createUser` was already correct
- `deleteUser` returns 204 with no body — correct, no wrapper needed

### github.controller.ts — Complete
- Applied `ApiResponse<T>` wrapper to `getWorkflowRuns` and `getCommitActivity`

### repo.controller.ts — Complete
- Applied `ApiResponse<T>` wrapper to `getTrackedRepo`, `upsertTrackedRepo`
- `deleteTrackedRepo` uses `message` field on `ApiResponse<never>`

### DashboardPage.tsx — Fixed
- Updated workflow runs and commit activity fetch calls to unwrap `.data` from response

### SettingsPage.tsx — Fixed
- Updated `GET /api/repos` fetch to unwrap `.data` from response
- `handleSave` and `handleDelete` unaffected — only check `res.ok`

### Lesson Learned
- Changing API response shape requires updating all frontend fetch calls that consume those endpoints
- `satisfies` keyword is the correct way to apply type checking to `res.json()`

---

## Key Learner Insights
- Hash map pattern: "moving along the array but retaining what it already iterated over to compare to"
- Two pointers: "walks one side of the array at a time depending on if it finds a match"
- TypeScript type system: "structured in a way that works like guardrails"
- Sliding window: "I was looking for the best combination in the array"
- Recursion: "the if statement keeps it going — the return tells it to stop and unwind"
- REST API: status codes are specific to each outcome in a single endpoint

## Common Mistakes Made
- Pasting TypeScript into C++ editor on LeetCode
- `foreach` syntax (C# habit) — TypeScript uses `for...of`
- Single `=` for comparison instead of `===`
- Accessing Map with bracket notation instead of `.has()` / `.get()`
- Returning `false` inside a loop — exits before checking all elements
- Returning inside the outer loop on sliding window — max tracking must happen every iteration

---

## Next Up
- Apply `ApiResponse<T>` wrapper to `auth.controller.ts`
- Replace `console.log` with logger in `auth.controller.ts`
- Algorithm: continue recursion or return to sliding window
- Big O notation — dedicated session planned
