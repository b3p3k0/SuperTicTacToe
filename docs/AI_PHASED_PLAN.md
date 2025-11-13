# Super T3 AI Roadmap (Q4 2025)

## Phase 1 – Shared Evaluator + Threat Metrics
**Goal:** Centralise scoring logic so every strategy relies on the same battle-tested heuristics.

1. **Evaluator module (`src/ai/evaluator.ts`)**
   - Public API: `evaluateState(snapshot: GameSnapshot, player: Player): number`.
   - Components (toggleable via config):
     - Meta board: wins, near-wins (two owned boards + one open), opponent near-wins.
     - Sub board: ownership value, two-in-a-row threats, center control.
     - Routing impact: sending opponent to “owned”, “contested”, or “dangerous” boards.
     - Battle stability: reward boards that require ≥2 opponent moves to flip, penalise fragile ones.
   - Provide weight presets per difficulty/ruleset; keep them in a JSON or exported constant for easy tuning.

2. **Threat/Fork detection utilities**
   - Extend `AiUtils` with:
     - `countThreats(board, player)` returning (#lines with two of player + empty).
     - `hasFork(board, player)` that detects two disjoint threats created by one move.
     - Meta-level equivalents using board ownership instead of cell marks.
   - Expose structured data so evaluator can reward/penalise forks explicitly.

3. **Integration**
   - Replace ad-hoc scoring in Normal/Hard with calls to `Evaluator`.
   - Keep RuleAwareHeuristics as a lightweight layer feeding into evaluator (or merge it if redundant).
   - Unit-test evaluator components with canned board states to prevent regressions.

## Phase 2 – Strategy Refinements
**Goal:** Upgrade Normal/Hard search behaviour using the shared evaluator.

1. **Normal Strategy**
   - Implement minimax depth=2 (AI move + opponent response) with alpha-beta.
   - Use heuristic ordering to consider top N moves (e.g., 6) to control branching.
   - Retain “blunder rate” but base it on scorer ranking (e.g., pick among top 3 instead of random bucket).
   - Plug evaluator into both leaf scoring and order heuristics.

2. **Hard Strategy**
   - Add iterative deepening: depth 2 → 3 → … until node budget (e.g., 40k nodes) or time threshold.
   - Adaptive depth: start at 4, extend to 5/6 when branching factor < 12.
   - Persist transposition table across iterative passes.
   - Honour a max think time (e.g., 500ms) to keep UX snappy.
   - Use evaluator for leaf scores; add quiescence-like check for imminent forks before cutting off.
   - Split “Hard” (same search with light randomness for variety) from “Expert” (deterministic perfect play) so veterans can opt into the stricter mode without losing variety at Hard.

3. **Diagnostics Enhancements**
   - Expand `AiDiagnostics` payload with evaluator breakdown (meta vs micro vs routing).
   - Optionally post metrics to an on-screen debug panel when `st3.aiDebugOverlay` flag is set.

## Phase 3 – Opening Book + Self-Play Tooling
**Goal:** Improve early play quality and create infrastructure for automated tuning.

1. **Opening Book**
   - JSON file (`src/ai/opening-book.json`) mapping `(ruleSet, startingPlayer, historyKey)` → recommended move(s).
   - Hook in `AiController`: before calling strategy, check book if move history length ≤ 2.
   - Populate with curated sequences (center starts, counter to opponent center/corner starts).

2. **Self-Play Harness**
   - Node script (`scripts/selfplay.ts`) that:
     - Runs X games per matchup (e.g., Hard vs Normal, Hard vs Hard) for each ruleset.
     - Logs win/draw stats + per-move evaluator metrics (CSV/JSON output).
   - Use this data to tune evaluator weights (manual iteration for now).

3. **Future Hooks**
   - Keep harness extensible for data capture (e.g., saving move histories) to feed potential ML experiments.
   - Document how to run `npm run selfplay -- --games 100 --ruleset battle --matchup hard-vs-hard`.

---

### Dependencies & Sequencing
- Phase 1 must land before Phase 2 (since both Normal/Hard rely on the evaluator).
- Phase 3 can start once Phase 1 is done (book can call existing strategies), but self-play is more valuable after Phase 2.

### Open Questions
- Do we want a UI toggle for “debug overlay” in addition to the localStorage flag?
- How aggressive should Hard’s time budget be on low-power devices? Need telemetry from real hardware.
- Should self-play harness run in CI (optional job) or stay manual?
