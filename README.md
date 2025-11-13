# Super Tic-Tac-Toe (Super T3)

A zero-dependency, browser-ready take on the 3×3 mega tic-tac-toe grid. Clone it, drop the folder onto any static host (or just open `index.html` locally), and you’re ready to play.

---

## Quick Play

1. Clone this repo or [download the latest release](https://github.com/b3p3k0/SuperTicTacToe/releases/latest).
2. Open `index.html` in any modern browser (double-click works via `file:///`), hit **New Game**, and pick **1 Player** or **2 Players** when the overlay pops up. Choose Classic, Modern, or Battle rules, and if you’re in solo mode also pick Easy / Normal / Hard / Expert plus who starts (Human / AI / Random) before the board appears. Flip on **Adaptive difficulty (beta)** if you want the client-side AI to nudge its strength based on how the current set is going.

That’s it—`game.js`, `style.css`, and all other assets are already bundled, so you can drop the folder onto any static host with zero build steps.

---

## Development Setup

```bash
npm install
npm run build    # compiles game.ts → game.js
# or
npm run watch    # auto-recompile while editing
```

All TypeScript source lives under `src/` (split into `core`, `ai`, `ui`, and `main` modules). Running the build rewrites `dist/*` plus `game.js`, which is what the browser loads. We keep those outputs in the repo for players, but contributors should re-run the build anytime they change the TypeScript.

---

## What’s Included

- **Full Super T3 rules**: forced-board routing, captured/drawn mini-boards, free-choice fallback when a destination board is full.
- **Solo or hot-seat play**: choose 1P to battle the built-in AI (Easy / Normal / Hard / Expert) or 2P for classic pass-and-play. Solo mode randomly decides who moves first (or you can force Human/AI).
- **Three rule sets**: pick Battle Mode (default; captured boards stay live and can be stolen), Classic (captured boards stay playable but ownership sticks), or Modern (captured/dead boards lock immediately).
- **Visual guidance**: active board highlighting, captured/drawn states, latest move glow, and a status bar describing whose turn it is plus any board constraints.
- **Move history**: chess-style log (e.g., `T12: P1BB3LB2 -> P2BB2LB5(F)`) with `(F)` indicating when the destination board was full and the next player could choose freely.
- **Solo analytics & debugging**: every 1P game updates browser-side win/draw counters by rule set + difficulty (rendered in the bar beneath the board), and you can flip on AI diagnostic logs via DevTools when tuning.
- **Adaptive solo mode (beta)**: optional toggle in the solo settings trims or boosts AI aggression on the fly using only local telemetry, keeping experienced players challenged while helping new players stay in the flow—all data stays on the device.
- **Rules & history toggles**: collapsible panels keep the layout tidy on smaller screens.

---

## File Map

| File                                 | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `index.html`                         | Shell markup and dialog scaffolding                                    |
| `style.css`                          | Responsive layout + color tokens (easy to reskin for future themes)    |
| `src/core/*`                         | Pure game logic, rule definitions, types, and constants                |
| `src/ai/*`                           | AI controller, simulator, and difficulty strategies                    |
| `src/ui/*`                           | UI orchestration, overlays, panels, and theme manager                  |
| `src/main.ts`                        | Entry point that wires the engine/UI/theme manager                     |
| `game.js`                            | Compiled bundle that ships with the repo (rebuilt via `npm run build`) |
| `package.json` / `package-lock.json` | Tooling metadata (`typescript` dev dependency, build scripts)          |
| `tsconfig.json`                      | Compiler settings targeting ES2018/browser-friendly output             |

---

## Customize Themes (No Coding Degree Needed)

Want your own color vibe? Follow these three simple steps:

1. Open `src/core/constants.ts` and scroll to the `THEMES` section. Copy any existing theme block (everything between `{ … }`) and paste it below the others.
2. Change the `label` plus the color tokens inside `tokens` (e.g., `--bg`, `--surface`, `--p1`, `--p2`). Think of each token as a paint bucket for part of the UI—backgrounds, buttons, or player marks.
3. Run `npm run build` so the new theme ships into `game.js`. Reload `index.html`, pick your theme from the dropdown, and you’re done.

Optional polish: if you want special fonts or effects for that theme, add a CSS rule like `body[data-theme="mytheme"] { … }` near the end of `style.css`.

---

## Deployment Tips

- To self-host, copy the entire folder into your web server’s document root (Apache, Nginx, GitHub Pages, etc.). No backend required.
- For kiosks/classrooms, keep the repo synced and just launch `index.html` locally; it runs offline.
- Want multiple visual themes later? Override the CSS custom properties at the top of `style.css` or wire up a selector that swaps them on the fly—everything else already references those tokens.

---

## AI Telemetry & Stats

- **Solo outcome log**: peek at `localStorage.st3.soloStats` to see aggregate Human / AI / Draw counts for each rule set and difficulty (reset with `localStorage.removeItem("st3.soloStats")`).
- **Diagnostics toggle**: run `localStorage.setItem("st3.aiDebug", "1")` in DevTools and refresh to see per-move candidate tables for Normal/Hard. Disable with `"0"` (or remove the key) when you’re done profiling.

Enjoy the grid warfare!
