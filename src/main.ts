import { GameEngine } from "./core/engine.js";
import { GameUI } from "./ui/game-ui.js";
import { ThemeManager } from "./ui/theme-manager.js";

document.addEventListener("DOMContentLoaded", () => {

  // Initialize theme manager
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement | null;
  new ThemeManager(themeSelect);

  // Initialize game engine and UI
  const engine = new GameEngine();

  const ui = new GameUI(engine);

  ui.init();

});