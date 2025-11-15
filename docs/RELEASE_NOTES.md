# Release Notes - Super Tic-Tac-Toe v2.5.1

_November 15, 2025_

This minor release focuses on polishing the Learn Hub so every lesson feels intentional and the layout stays balanced on any screen.

## 🧠 Learn Hub Refresh
- **New consolidated lesson**: “How Games and AI Think” merges the overlapping “How Games Think” and “How the AI Opponent Works” guides into a single story that ties rule variants, decision trees, and AI personas together. The README, docs, and in-game Learn Hub now link to the new article so players find the latest information immediately.
- **Dedupe & cleanup**: Retired the redundant markdown/HTML files from the repo to keep the learning catalog lean for future contributions.

## 📱 Responsive Grid Polish
- Rebuilt the Learn Hub card layout using a wrapping flexbox so partial rows are automatically centered. Whether you view the page as 4×2 on desktop or 2×3 on mobile, the last card no longer hugs the left edge.

## 🔢 Version Sync
- Updated the in-game footer to advertise v2.5.1 so the shipped build, repo metadata, and upcoming GitHub release stay in lockstep.

---

# Release Notes - Super Tic-Tac-Toe v1.1

## 🎯 Major Architecture Overhaul - Modular TypeScript Refactor

This release represents a complete architectural transformation from a monolithic 1,855-line `game.ts` file into a clean, maintainable modular system with **15 focused TypeScript modules**. The final bundled output maintains identical functionality while providing significantly improved developer experience.

### 📁 New Modular Structure

```
src/
├── core/                    # Pure game logic and definitions
│   ├── types.ts             # All TypeScript interfaces and types
│   ├── constants.ts         # Game constants, win patterns, themes
│   └── engine.ts            # GameEngine class - pure game state management
├── ai/                      # AI system components
│   ├── controller.ts        # AiController orchestration
│   ├── utils.ts            # Shared AI evaluation functions
│   ├── simulator.ts        # Game state simulation for AI planning
│   └── strategies/         # Individual AI implementations
│       ├── easy.ts         # EasyAiStrategy (45% win blocking, random play)
│       ├── normal.ts       # NormalAiStrategy (full heuristics)
│       └── hard.ts         # HardAiStrategy (minimax with alpha-beta pruning)
├── ui/                     # User interface components
│   ├── game-ui.ts          # Main UI controller and game orchestration
│   ├── theme-manager.ts    # Theme switching and persistence
│   └── components/         # Focused UI component modules
│       ├── board.ts        # Board rendering and cell interactions
│       ├── overlays.ts     # Mode selection and result overlays
│       └── panels.ts       # Rules and history panels, illegal move dialog
└── main.ts                 # Application entry point and initialization
```

## ✨ Feature Enhancements

### 🤖 AI System Improvements
- **Three distinct AI personalities** with carefully tuned difficulty progression:
  - **Easy**: Beginner-friendly AI that sometimes misses obvious blocks (45% chance), uses randomized priorities for more natural play
  - **Normal**: Balanced strategic play with full heuristic evaluation and board comfort analysis
  - **Hard**: Advanced minimax algorithm with alpha-beta pruning and variable search depth based on game complexity

### 🎮 Enhanced Game Experience
- **Solo mode improvements**: Smart starting player selection (Human/AI/Random) with clear difficulty indicators
- **Visual polish**: Enhanced macro grid visuals with better active board highlighting
- **Move history enhancements**:
  - Annotated captures and dead boards in chess-style notation
  - Stable panel height when rules are expanded/collapsed
  - Clear indicators for forced moves and free choice scenarios

### 🎨 Theme System Expansion
- **Five complete theme presets**:
  - Default: Clean, modern interface
  - Krayon: Playful, colorful design
  - VibeWave: Cyberpunk-inspired dark theme
  - Insomniac: Professional dark mode
  - High Contrast: Accessibility-focused design
- **Persistent theme selection** with localStorage integration

### ⚙️ Settings & UX Improvements
- **Polished settings flow** with intuitive mode selection
- **Live demo integration**: Direct link to https://supert3.com for instant play
- **Improved rule selection**: Default to Classic rules with clear explanations
- **Enhanced capture shading**: Better visual distinction for captured boards in High Contrast theme

## 🛠️ Developer Experience

### Build System Enhancements
- **Modular development** with TypeScript modules in `src/`
- **Preserved deployment model**: Still compiles to single `game.js` bundle
- **Enhanced build pipeline**:
  - `npm run build` - Full TypeScript compilation + bundling
  - `npm run build-modules` - TypeScript compilation only
  - `npm run watch` - Development watch mode

### Code Quality Improvements
- **Strict TypeScript configuration** with comprehensive error checking
- **Clear separation of concerns**: Game logic, AI, and UI completely isolated
- **Focused modules**: Each file under 200 lines with single responsibility
- **Easy extensibility**: Add new AI strategies, UI components, or themes without touching core logic

## 📈 Benefits Achieved

### Maintainability
✅ **Focused modules**: Easy to locate and modify specific functionality
✅ **Clear dependencies**: Isolated systems with minimal coupling
✅ **Easier debugging**: Trace issues to specific components quickly

### Extensibility
✅ **New AI strategies**: Simply add files to `ai/strategies/` and register in controller
✅ **UI components**: Extend `ui/components/` without affecting game logic
✅ **Theme system**: Add themes to `constants.ts` with automatic UI integration

### Testing & Collaboration
✅ **Unit testable**: Each module can be tested in isolation
✅ **Parallel development**: Multiple developers can work on different modules
✅ **Better code review**: Smaller, focused changes in logical modules

## 🔧 Technical Details

### Preserved Functionality
- **Identical gameplay**: All game rules, AI behavior, and UI interactions unchanged
- **Same deployment model**: Single HTML + CSS + JS file structure maintained
- **All themes functional**: Complete compatibility with existing theme system
- **Consistent performance**: Final bundle size similar to original (1,732 vs 1,855 lines)

### Breaking Changes
- **None for end users**: Game plays identically to previous version
- **Developer workflow**: Source code now lives in `src/` directory structure

## 🎉 What's Next

This modular foundation enables exciting future enhancements:
- **New AI strategies** can be added as simple plugin modules
- **Additional themes** integrate seamlessly with the existing system
- **UI components** can be extended without touching core game logic
- **Testing framework** can now be added with module-level coverage

---

**Full Changelog**: [View on GitHub](https://github.com/your-repo/compare/v1.0...v1.1)

**Try it now**: Visit [supert3.com](https://supert3.com) or download and open `index.html` in any modern browser.
