# Super Tic-Tac-Toe

A zero-dependency browser game that brings the 3×3 mega-board twist on classic tic-tac-toe. Built with TypeScript, compiled to a single `game.js`, and ready to drop onto any static web server.

## Getting Started

```bash
npm install
npm run build
```

The build step compiles `game.ts` into `game.js` next to the HTML/CSS so everything stays copy-paste simple.

## Playing & Hosting

1. Open `index.html` in any modern browser (file:// works) or copy the whole folder into your web server directory.
2. Click **New Game** to reset anytime.
3. Use the Rules and Move History toggles to keep the layout tidy on smaller screens.

### Notation

Move history uses the chess-like shorthand requested by the project brief:

- `P1BB3LB2` → Player 1 played in Big Board 3, Little Box 2.
- `(F)` → the destination board for the opponent was already full, so they could choose anywhere.

### Illegal Moves

Attempting to play on the wrong board or in a used square pops a friendly modal dialog explaining why the move failed.

## Development Notes

- `game.ts` holds all board logic and UI wiring; it compiles straight to `game.js` (no bundler).
- Styling relies on CSS custom properties so we can add selectable themes later without rewiring the markup.
- The app highlights the active big board, marks captured/drawn boards, and tracks the last move for quick visual parsing.

Feel free to riff on the visuals—swap palettes, add fonts, or extend the UI. Just re-run `npm run build` before shipping so the latest TypeScript changes land in `game.js`.
