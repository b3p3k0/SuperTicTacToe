# Backlog

Items from the September 2026 review that were not done in that pass. Each is one problem and one fix. File references point at the source, not the compiled `game.js`.

## UI polish

- **"Thinking…" status text.** The AI answers in about 20 ms, so this is comfort, not a fix. Set the status text before the 120 ms timer in `src/ui/game-ui.ts` fires. A Web Worker is not recommended: Chrome blocks Blob workers on `file://`.
- **No keyboard focus ring.** `style.css` has no `:focus` rules. Add one `:focus-visible` rule for cells and buttons.
- **No reduced-motion support.** Add one `@media (prefers-reduced-motion: reduce)` block that disables transitions and the flash animation.
- **Cell labels never update.** `src/ui/components/board.ts` sets `aria-label` once at build time. Refresh it on render with the mark and board state.
- **Invalid ARIA grid.** `role="grid"` has no `role="row"` / `role="gridcell"` children. Either add them or drop the grid role.
- **Overlays are not dialogs.** No `role="dialog"`, no focus trap, no Escape, no focus restore. `hideModeOverlay` leaves a permanent `tabIndex=0` on the board.
- **Draw text in Modern.** `game-ui.ts` says "All boards are full." In Modern the boards are closed, not full.
- **Solo stats bar shows in 2-player games.** Hide it when the mode is local.
- **Duplicate CSS.** `body[data-theme="wopr"] .super-board` is declared twice in `style.css`.
- **Touch targets.** At 360 px wide the 81 cells are under 44 px. Consider a minimum cell size with horizontal scroll on tiny screens.

## Features

- **Hint button** for solo play. Needs seat-neutral strategies (below).
- **Undo** for solo play. Needs `GameEngine.loadSnapshot(snapshot)`.
- **Ladder check in `npm test`.** Run `node bench/selfplay.mjs --ladder --games 10` and fail if the ordering check reports a violation.
- **Self-tuning weights.** Hill-climb `BASE_WEIGHTS` in `src/ai/evaluator.ts` with the harness. Good lesson material.

## Engine and AI

- **Seat-neutral strategies.** `hard.ts`, `normal.ts`, `easy.ts` hardcode `"O"` as the AI seat. The harness mirrors the board to work around it. Making the strategies take the seat from `options.player` would remove the mirror and unlock the Hint button.
- **`getSnapshot()` has a side effect.** `src/core/engine.ts` nulls `activeBoardIndex` inside a getter. Move that into `attemptMove`.
- **Early draw detection.** Classic and Battle play until all 81 cells fill even when no big line is possible.
- **History pairing when O starts.** `recordMove` always opens a new row for X, so an AI-first game shows row 1 as O-only.
- **Adaptive presets need re-measuring.** `src/ai/adaptive-tuning.ts` raises `depthAdjustment` by 1 or 2 and the time budget to 1.2-2.2 s in the flow and coast bands. Those values were tuned when the deeper search passes were free (the old cache answered them). With real depth they will hit the time cap often. Measure with `--adaptive on --band flow` and retune.
- **Transposition table.** Deleted in the review pass if it measured slower than no cache; if search depth is raised later, add an exact-only table keyed on remaining depth.

## Tooling and docs

- **`learn/theme.js` duplicates theme data.** It hardcodes `THEME_VERSION` and the default tokens from `src/core/constants.ts`. Three places must be bumped together. Generate it from constants at build time.
- **`AiTelemetry` has one listener slot.** A second consumer silently replaces the first.
- **`st3.soloStats` has no schema version.** `mergeBuckets` accepts any value type.
- **Five Learn Hub lessons still need the "say it once" trim:** punch-cards, how-web-games-work, coding-with-ai-partners, how-games-and-ai-think, from-pixels-to-play.
