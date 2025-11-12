# Super Tic-Tac-Toe (Super T3)

A zero-dependency, browser-ready take on the 3×3 mega tic-tac-toe grid. Clone it, drop the folder onto any static host (or just open `index.html` locally), and you’re ready to play. Want to try it right now? Visit https://supert3.com for the live demo.

---

## Quick Play

1. Download or clone this repo.
2. Open `index.html` in any modern browser (double-click works via `file://`), hit **New Game**, and pick **1 Player** or **2 Players** when the overlay pops up. Choose Old (Classic) or New (Modern) rules, and if you’re in solo mode also pick Easy/Normal/Hard plus who starts (Human / AI / Random) before the board appears.

That’s it—`game.js`, `style.css`, and all other assets are already bundled, so you can drop the folder onto any static host with zero build steps.

---

## Development Setup

```bash
npm install
npm run build    # compiles game.ts → game.js
# or
npm run watch    # auto-recompile while editing
```

`game.ts` holds all logic + DOM wiring. Running the build rewrites `dist/*` plus `game.js`, which is what the browser loads. We keep those outputs in the repo for players, but contributors should re-run the build anytime they change the TypeScript.

---

## What’s Included

- **Full Super T3 rules**: forced-board routing, captured/drawn mini-boards, free-choice fallback when a destination board is full.
- **Solo or hot-seat play**: choose 1P to battle the built-in AI (Easy / Normal / Hard) or 2P for classic pass-and-play. Solo mode randomly decides who moves first (or you can force Human/AI).
- **Classic vs. Modern rules**: at the start of every match pick Old (slower, strategic) or New (faster) rules. Modern mode closes captured/dead boards; Classic keeps them playable.
- **Visual guidance**: active board highlighting, captured/drawn states, latest move glow, and a status bar describing whose turn it is plus any board constraints.
- **Move history**: chess-style log (e.g., `T12: P1BB3LB2 -> P2BB2LB5(F)`) with `(F)` indicating when the destination board was full and the next player could choose freely.
- **Rules & history toggles**: collapsible panels keep the layout tidy on smaller screens.
- **Friendly guardrails**: illegal moves trigger a modal (“Oops! can’t move there because …”) with a single “got it!” button so players know what went wrong.

---

## File Map

| File                                 | Purpose                                                             |
| ------------------------------------ | ------------------------------------------------------------------- |
| `index.html`                         | Shell markup and dialog scaffolding                                 |
| `style.css`                          | Responsive layout + color tokens (easy to reskin for future themes) |
| `game.ts`                            | TypeScript source for the rules engine and UI controller            |
| `game.js`                            | Compiled bundle that ships with the repo (rebuilt via `npm run build`) |
| `package.json` / `package-lock.json` | Tooling metadata (`typescript` dev dependency, build scripts)       |
| `tsconfig.json`                      | Compiler settings targeting ES2018/browser-friendly output          |

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

Enjoy the grid warfare! If you add features (AI, saved games, themes), re-run `npm run build` so `game.js` stays in sync.\*\*\*
