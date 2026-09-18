# AI Benchmark Plan

`bench/selfplay.mjs` plays the AI against itself on the real rules engine. It reports win rates, think time, missed one-move wins, one-move blunders, illegal moves, and whether the AI's internal rules model (`AiSimulator`) agrees with `GameEngine` on every move. Results print as text and are saved as JSON under `bench/results/` (ignored by git).

## Setup

Node 22. No build step: the harness imports the committed `dist/` modules.

```bash
export PATH=~/.nvm/versions/node/v22.23.2/bin:$PATH   # only if node is not on your PATH
node bench/selfplay.mjs --help
```

## Standard runs

| Purpose | Command |
| --- | --- |
| Tactics and speed, Hard | `node bench/selfplay.mjs --games 100 --matchup hard-vs-hard --ruleset all` |
| Tactics and speed, Expert | `node bench/selfplay.mjs --games 100 --matchup expert-vs-hard --ruleset all` |
| Difficulty ladder | `node bench/selfplay.mjs --ladder --games 20` |
| Old vs new (A/B) | copy the old `dist/` to a folder, then run `--dist-x <old> --dist-o dist` and the reverse |
| Deterministic pairs (Expert vs Expert) | add `--random-opening 4` so the games differ |
| Force the time-out path | add `--time-scale 0.02` |
| Adaptive mode | add `--adaptive on --band flow` (or `struggle`, `coast`) |

Run both seat orders for any A/B comparison. X moves first and wins more often between equal AIs, so pool both orders before judging. Two deterministic AIs (Expert vs Expert) replay the same game unless you add `--random-opening`.

## How to read a result

```
hard(X) vs hard(O)   ruleset=battle adaptive=off games=100 seed=1
  by seat        X wins 65   O wins 28   draws 7
  game length    avg 67.6   min 43   max 81
  think ms       hard: avg 20.9   max 139.9   (6764 moves)
  oracle         hard: missed win-in-1 0/93   walked into loss 0/614   illegal 0
  parity         0 mismatches / 6764 moves
```

- `missed win-in-1 0/93`: 93 positions had a move that won the game on the spot; 0 were missed.
- `walked into loss 0/614`: 614 positions had both a losing move and a safe move; the AI chose a losing move 0 times.
- `parity`: every move was also applied with the AI's simulator and compared with the engine.
- The ladder prints `ordering check: OK` when every difficulty scores above 0.50 against every weaker one.

## Pass criteria

- Expert: missed win-in-1 0 and walked into loss 0 in the standard runs. Hard: at or near 0.
- Ladder ordering check: OK.
- Parity mismatches: 0.
- `npm test` green.

## Results: September 2026 review

Baseline = the shipped code before the review (after the Battle rule fix, which changed both sides equally). Final = the code in this release. 100 games per cell, seed 1.

### Missed one-move wins / walked into one-move losses

| Ruleset | Hard, baseline | Hard, final | Expert, baseline | Expert, final |
| --- | --- | --- | --- | --- |
| battle | 91/177 · 106/519 | 0/80 · 0/574 | 43/96 · 47/219 | 0/71 · 0/146 |
| classic | 88/168 · 103/470 | 0/81 · 0/451 | 47/87 · 59/277 | 0/62 · 0/159 |
| modern | 74/162 · 53/390 | 0/65 · 1/237 | 55/106 · 7/168 | 0/66 · 0/31 |

Read `91/177 · 106/519` as: 91 of 177 available wins missed; 106 losing moves chosen out of 519 positions with a safe alternative.

### Think time per move (quiet machine, 10 games)

| Matchup | Difficulty | Baseline avg / max ms | Final avg / max ms |
| --- | --- | --- | --- |
| hard-vs-hard | hard | 22 / 152 | 37 / 356 |
| expert-vs-hard | expert | 36 / 179 | 256 / 1501 |
| expert-vs-hard | hard | 23 / 100 | 57 / 372 |

Baseline times are from the 100-game Battle runs. The baseline searched only 4 plies in practice (its position cache answered deeper passes from the shallow one); the final Hard searches 4 to 5 plies for real and Expert 4 to 7.

### Final vs baseline, Hard vs Hard, both seat orders

| Ruleset | Final as O (wins-losses-draws) | Final as X (wins-losses-draws) |
| --- | --- | --- |
| battle | 69-22-9 | 85-9-6 |
| classic | 75-12-13 | 79-8-13 |
| modern | 51-23-26 | 67-10-23 |

Pooled score for the final AI: **0.79** over 600 games (0.50 = even).

### Difficulty ladder (20 games per pair per seat order)

Baseline:

```
Ladder: row score against column (1.00 = won every game, 0.50 = even)
              easy  normal    hard  expert
easy             -    0.15    0.13    0.06
normal        0.85       -    0.33    0.49
hard          0.88    0.68       -    0.60
expert        0.94    0.51    0.40       -
  ordering check: VIOLATION expert does not beat hard (0.40)
```

Final:

```
Ladder: row score against column (1.00 = won every game, 0.50 = even)
              easy  normal    hard  expert
easy             -    0.15    0.00    0.04
normal        0.85       -    0.05    0.06
hard          1.00    0.95       -    0.34
expert        0.96    0.94    0.66       -
  ordering check: OK
```

Parity: 0 mismatches over 38102 moves in the final runs.
