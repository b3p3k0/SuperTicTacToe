const THEME_KEY = "st3.theme";
const TOKENS_KEY = "st3.themeTokens";
const THEME_VERSION_KEY = "st3.themeVersion";
const THEME_VERSION = "2025.11-hotfix";
const DEFAULT_THEME_TOKENS = {
  "--bg": "#f3f4f8",
  "--surface": "#ffffff",
  "--border": "#d7d9e0",
  "--text": "#1f2430",
  "--muted": "#5b6275",
  "--accent": "#ff6b6b",
  "--accent-strong": "#ff3d57",
  "--accent-shadow": "rgba(255, 107, 107, 0.25)",
  "--p1": "#2463eb",
  "--p2": "#f97316",
  "--capture-bg": "#eef2ff",
  "--capture-bg-p2": "#fff4ec",
  "--draw-bg": "#f2f4f7",
  "--cell-bg": "#f8f9ff",
  "--last-move-glow": "rgba(36, 99, 235, 0.3)",
  "--active-board-border": "#00d600",
  "--active-board-glow": "rgba(0, 214, 0, 0.35)",
  "--active-board-glow-strong": "rgba(0, 214, 0, 0.5)",
  "--macro-line": "rgba(0, 0, 0, 0.35)",
  "--overlay-scrim": "rgba(20, 24, 35, 0.85)",
  "--font-body": '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "--font-heading": '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "--bg-pattern":
    "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.65) 0, transparent 45%), radial-gradient(circle at 80% 0%, rgba(173, 194, 255, 0.35) 0, transparent 35%)",
  "--panel-shadow": "0 25px 60px rgba(31, 36, 48, 0.08)",
  "--cell-hover-shadow": "0 10px 25px rgba(36, 99, 235, 0.25)",
  "--cell-hover-bg": "#ffffff",
};

(function initLearnTheme() {
  let themeName = "default";
  try {
    const storedName = window.localStorage.getItem(THEME_KEY);
    if (storedName) {
      themeName = storedName;
    }
  } catch (error) {
    console.warn("Unable to read stored theme:", error);
  }

  let tokens = DEFAULT_THEME_TOKENS;
  try {
    const storedVersion = window.localStorage.getItem(THEME_VERSION_KEY);
    if (storedVersion === THEME_VERSION) {
      const storedTokens = window.localStorage.getItem(TOKENS_KEY);
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens);
        if (parsed && typeof parsed === "object") {
          tokens = parsed;
        }
      }
    } else {
      window.localStorage.removeItem(TOKENS_KEY);
      window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
    }
  } catch (error) {
    console.warn("Unable to read stored theme tokens:", error);
  }

  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  document.body.dataset.theme = themeName;

  document.querySelectorAll("[data-learn-close]").forEach((button) => {
    button.addEventListener("click", () => {
      if (window.opener && !window.opener.closed) {
        window.close();
        return;
      }

      window.close();
      window.setTimeout(() => {
        window.location.href = "../index.html";
      }, 100);
    });
  });
})();
