import { GameEngine } from "./core/engine.js";
import { GameUI } from "./ui/game-ui.js";
import { ThemeManager } from "./ui/theme-manager.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎮 ST3 Initializing...");

  // Initialize theme manager
  const themeSelect = document.getElementById("theme-select") as HTMLSelectElement | null;
  console.log("🎨 Theme select element:", themeSelect);
  new ThemeManager(themeSelect);

  // Initialize game engine and UI
  console.log("⚙️ Creating game engine...");
  const engine = new GameEngine();

  console.log("🖥️ Creating game UI...");
  const ui = new GameUI(engine);

  console.log("🚀 Calling UI.init()...");
  ui.init();

  console.log("✅ ST3 Initialization complete");
});