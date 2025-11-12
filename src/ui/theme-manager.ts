import { ThemeName } from "../core/types.js";
import { THEME_STORAGE_KEY, THEMES } from "../core/constants.js";

export class ThemeManager {
  private select: HTMLSelectElement | null;
  private current: ThemeName = "default";

  constructor(select: HTMLSelectElement | null) {
    this.select = select;
    this.populateOptions();

    const initialTheme = this.getStoredTheme();
    this.applyTheme(initialTheme, false);

    this.select?.addEventListener("change", () => {
      const value = (this.select?.value ?? "default") as ThemeName;
      this.applyTheme(value, true);
    });
  }

  private populateOptions(): void {
    if (!this.select) {
      return;
    }

    const existingValues = new Set<string>();
    Array.from(this.select.options).forEach((option) => {
      existingValues.add(option.value);
      const theme = THEMES[option.value as ThemeName];
      if (theme) {
        option.textContent = theme.label;
      }
    });

    Object.entries(THEMES).forEach(([key, theme]) => {
      if (!existingValues.has(key)) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = theme.label;
        this.select!.append(option);
      }
    });
  }

  private getStoredTheme(): ThemeName {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && stored in THEMES) {
        return stored as ThemeName;
      }
    } catch (error) {
      console.warn("Unable to read saved theme:", error);
    }
    return "default";
  }

  applyTheme(name: ThemeName, persist: boolean = true): void {
    const themeName = (name in THEMES ? name : "default") as ThemeName;
    const theme = THEMES[themeName];

    Object.entries(theme.tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    document.body.dataset.theme = themeName;

    if (this.select) {
      this.select.value = themeName;
    }

    this.current = themeName;

    if (persist) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
      } catch (error) {
        console.warn("Unable to save theme preference:", error);
      }
    }
  }

  getCurrentTheme(): ThemeName {
    return this.current;
  }
}