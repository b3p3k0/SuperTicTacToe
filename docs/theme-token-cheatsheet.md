# Theme Token Cheatsheet

Themes live in `src/core/constants.ts`. Each one is just a label plus a set of CSS custom properties (tokens) the UI reads at runtime. Tweak the values below to remix the entire vibe without touching any logic.

| Token | What it controls |
| --- | --- |
| `--bg` | Main page background behind every panel. |
| `--surface` | Card surfaces like the board panel, info panels, and Learn Hub cards. |
| `--border` | Default borders for panels, mini-boards, and idle cells. |
| `--text` | Primary copy: headers, status text, and button labels. |
| `--muted` | Softer helper text (tips, subheadlines, captions). |
| `--accent` | Primary action color for buttons, hovered cells, and links. |
| `--accent-strong` | Bolder accent used for toggles or emphasized text. |
| `--accent-shadow` | Shadow/glow cast by accent buttons so they pop. |
| `--p1` | Player 1’s X color (marks and captured borders). |
| `--p2` | Player 2’s O color (marks and captured borders). |
| `--capture-bg` | Background for a mini-board after Player 1 captures it. |
| `--capture-bg-p2` | Background for a mini-board after Player 2 captures it. |
| `--draw-bg` | Background for a mini-board that ended in a draw. |
| `--cell-bg` | Idle cell fill before anyone plays there. |
| `--cell-hover-bg` | Temporary fill while a cell is hovered (falls back to `--cell-bg`). |
| `--cell-hover-shadow` | Hover glow around a cell to highlight the click target. |
| `--last-move-glow` | Outline that marks the most recent move. |
| `--active-board-border` | Border color on the mini-board you must play in next. |
| `--active-board-glow` | Glow around the active mini-board. |
| `--active-board-glow-strong` | Extra glow when the active board is also captured/drawn. |
| `--macro-line` | The thin grid lines that split the mega-board into its nine regions. |
| `--overlay-scrim` | Darkened backdrop behind overlays/modals like the result dialog. |
| `--panel-shadow` | Drop shadow for panels/cards so they feel lifted. |
| `--bg-pattern` | Optional pattern or gradient layered on top of `--bg`. |
| `--font-body` | Font stack for body text. |
| `--font-heading` | Font stack for headings and panel titles. |

## Tips

- Add a new theme by copying any `THEMES` entry, changing the label, and editing the token colors.
- If you leave a token out, the CSS falls back to the default theme’s value, so feel free to experiment incrementally.
- After editing tokens, run `npm run build` (or `npm run watch`) and reload `index.html` to see your changes.
