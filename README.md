# Super Tic-Tac-Toe (Super T3)

A zero-dependency, browser-ready take on the 3×3 mega tic-tac-toe grid. Clone it, drop the folder onto any static host (or just open `index.html` locally), and you’re ready to play.

---

## Quick Play
1. Download or clone this repo.
2. Open `index.html` in any modern browser (double-click works via `file://`).
3. Hit **New Game** and start trading moves.

No web server or build step is required for players—all compiled assets (`game.js`, `style.css`, `index.html`) ship in the repo.

---

## Development Setup
```bash
npm install
npm run build    # compiles game.ts → game.js
# or
npm run watch    # auto-recompile while editing
```

`game.ts` holds all logic + DOM wiring. Running the build rewrites `game.js`, which is what the browser loads. Keep both files committed so new users can either play immediately or rebuild if they’re hacking on the TypeScript.

---

## What’s Included
- **Full Super T3 rules**: forced-board routing, captured/drawn mini-boards, free-choice fallback when a destination board is full.
- **Two-player hot seat**: X always starts; no AI (yet) and no network logic.
- **Visual guidance**: active board highlighting, captured/drawn states, latest move glow, and a status bar describing whose turn it is plus any board constraints.
- **Move history**: chess-style log (e.g., `T12: P1BB3LB2 -> P2BB2LB5(F)`) with `(F)` indicating when the destination board was full and the next player could choose freely.
- **Rules & history toggles**: collapsible panels keep the layout tidy on smaller screens.
- **Friendly guardrails**: illegal moves trigger a modal (“Oops! can’t move there because …”) with a single “got it!” button so players know what went wrong.

---

## File Map
| File | Purpose |
| --- | --- |
| `index.html` | Shell markup and dialog scaffolding |
| `style.css` | Responsive layout + color tokens (easy to reskin for future themes) |
| `game.ts` | TypeScript source for the rules engine and UI controller |
| `game.js` | Compiled bundle served to the browser |
| `package.json` / `package-lock.json` | Tooling metadata (`typescript` dev dependency, build scripts) |
| `tsconfig.json` | Compiler settings targeting ES2018/browser-friendly output |

---

## Deployment Tips
- To self-host, copy the entire folder into your web server’s document root (Apache, Nginx, GitHub Pages, etc.). No backend required.
- For kiosks/classrooms, keep the repo synced and just launch `index.html` locally; it runs offline.
- Want multiple visual themes later? Override the CSS custom properties at the top of `style.css` or wire up a selector that swaps them on the fly—everything else already references those tokens.

Enjoy the grid warfare! If you add features (AI, saved games, themes), re-run `npm run build` so the distributable `game.js` stays in sync.***
