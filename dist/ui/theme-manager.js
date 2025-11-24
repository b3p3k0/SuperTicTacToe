import { THEME_STORAGE_KEY, THEME_TOKENS_KEY, THEME_VERSION_KEY, THEME_VERSION, THEMES, } from "../core/constants.js";
export class ThemeManager {
    constructor(select) {
        var _a;
        this.current = "default";
        this.select = select;
        this.maybeUpgradeThemeTokens();
        this.populateOptions();
        const initialTheme = this.getStoredTheme();
        this.applyTheme(initialTheme, false);
        (_a = this.select) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => {
            var _a, _b;
            const value = ((_b = (_a = this.select) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "default");
            this.applyTheme(value, true);
        });
    }
    populateOptions() {
        if (!this.select) {
            return;
        }
        const existingValues = new Set();
        Array.from(this.select.options).forEach((option) => {
            existingValues.add(option.value);
            const theme = THEMES[option.value];
            if (theme) {
                option.textContent = theme.label;
            }
        });
        Object.entries(THEMES).forEach(([key, theme]) => {
            if (!existingValues.has(key)) {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = theme.label;
                this.select.append(option);
            }
        });
    }
    getStoredTheme() {
        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (stored && stored in THEMES) {
                return stored;
            }
        }
        catch (error) {
            console.warn("Unable to read saved theme:", error);
        }
        return "default";
    }
    applyTheme(name, persist = true) {
        const themeName = (name in THEMES ? name : "default");
        const theme = THEMES[themeName];
        Object.entries(theme.tokens).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
        document.body.dataset.theme = themeName;
        if (this.select) {
            this.select.value = themeName;
        }
        this.current = themeName;
        this.persistThemePreference(themeName, theme.tokens, persist);
    }
    getCurrentTheme() {
        return this.current;
    }
    persistThemePreference(name, tokens, logErrors) {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, name);
            window.localStorage.setItem(THEME_TOKENS_KEY, JSON.stringify(tokens));
            window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
        }
        catch (error) {
            if (logErrors) {
                console.warn("Unable to save theme preference:", error);
            }
        }
    }
    maybeUpgradeThemeTokens() {
        try {
            const version = window.localStorage.getItem(THEME_VERSION_KEY);
            if (version === THEME_VERSION) {
                return;
            }
            window.localStorage.removeItem(THEME_TOKENS_KEY);
            window.localStorage.setItem(THEME_VERSION_KEY, THEME_VERSION);
        }
        catch (error) {
            console.warn("Unable to sync theme version:", error);
        }
    }
}
