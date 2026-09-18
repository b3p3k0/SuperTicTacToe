import {
  GameMode,
  Difficulty,
  ModeStep,
  StartPreference,
  RuleSet,
  GameSnapshot,
} from "../../core/types.js";
import { DIFFICULTY_LABELS } from "../../core/constants.js";
import { AdaptiveLoop } from "../../analytics/adaptive-loop.js";

export class OverlayManager {
  private modeOverlay: HTMLElement | null = null;
  private resultOverlay: HTMLElement | null = null;
  private resultTitle: HTMLElement | null = null;
  private resultBody: HTMLElement | null = null;
  private settingsHeading: HTMLElement | null = null;
  private settingsCopy: HTMLElement | null = null;
  private settingsStartButton: HTMLElement | null = null;
  private rulesDescription: HTMLElement | null = null;
  private soloOnlyBlocks: HTMLElement[] = [];
  private adaptiveToggle: HTMLInputElement | null = null;

  public overlayVisible: boolean = false;
  public overlayStep: ModeStep = "players";
  public pendingMode: GameMode = "solo";
  public startPreference: StartPreference = "random";
  public ruleSet: RuleSet = "battle";
  public adaptiveEnabled: boolean = AdaptiveLoop.isEnabled();

  private onBeginGame?: (mode: GameMode, difficulty?: Difficulty) => void;

  constructor() {
    this.initModeOverlay();
    this.initResultOverlay();
  }

  setGameStartHandler(handler: (mode: GameMode, difficulty?: Difficulty) => void): void {
    this.onBeginGame = handler;
  }

  private initModeOverlay(): void {
    const overlay = document.getElementById("mode-overlay");

    if (!overlay) {
      throw new Error("Missing mode selection overlay.");
    }

    this.modeOverlay = overlay;

    // Mode selection buttons
    const modeButtons = overlay.querySelectorAll("[data-mode-choice]");
    modeButtons.forEach((button) => {
      const modeChoice = (button as HTMLElement).dataset.modeChoice as GameMode;
      if (!modeChoice) {
        console.warn("⚠️ Mode button missing data-mode-choice:", button);
        return;
      }
      button.addEventListener("click", () => {
        this.pendingMode = modeChoice;
        this.showModeOverlay("difficulty");
      });
    });

    // Difficulty buttons
    const diffButtons = overlay.querySelectorAll("[data-difficulty-choice]");
    diffButtons.forEach((button) => {
      const diff = (button as HTMLElement).dataset.difficultyChoice as Difficulty;
      if (!diff) {
        console.warn("⚠️ Difficulty button missing data-difficulty-choice:", button);
        return;
      }
      button.addEventListener("click", (event) => {

        if ((button as HTMLButtonElement).disabled) {
          return;
        }

        const mode = this.pendingMode ?? "solo";
        if (mode === "solo") {
          this.onBeginGame?.(mode, diff);
        } else {
          this.onBeginGame?.(mode);
        }
      });
    });

    // Back button
    const backButton = document.getElementById("difficulty-back");
    backButton?.addEventListener("click", () => this.showModeOverlay("players"));

    // Start preference radios
    const startRadios = overlay.querySelectorAll('input[name="start-mode"]') as NodeListOf<HTMLInputElement>;
    startRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          this.startPreference = radio.value as StartPreference;
        }
      });
      if (radio.checked) {
        this.startPreference = radio.value as StartPreference;
      }
    });

    // Ruleset radios
    const ruleRadios = overlay.querySelectorAll('input[name="ruleset"]') as NodeListOf<HTMLInputElement>;
    ruleRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          this.ruleSet = radio.value as RuleSet;
          this.updateRulesDescription();
        }
      });
      if (radio.checked) {
        this.ruleSet = radio.value as RuleSet;
        this.updateRulesDescription();
      }
    });

    // Adaptive difficulty toggle
    this.adaptiveToggle = document.getElementById("adaptive-difficulty-toggle") as HTMLInputElement | null;
    if (this.adaptiveToggle) {
      this.adaptiveToggle.checked = this.adaptiveEnabled;
      this.adaptiveToggle.addEventListener("change", () => {
        const enabled = this.adaptiveToggle?.checked ?? false;
        this.adaptiveEnabled = enabled;
        AdaptiveLoop.setEnabled(enabled);
      });
    }

    // Cache UI elements
    this.soloOnlyBlocks = Array.from(overlay.querySelectorAll(".solo-only"));
    this.settingsStartButton = document.getElementById("settings-start");
    this.settingsHeading = overlay.querySelector("[data-settings-heading]");
    this.settingsCopy = overlay.querySelector("[data-settings-copy]");
    this.rulesDescription = document.getElementById("rules-mode-description");

    this.settingsStartButton?.addEventListener("click", () => {
      this.onBeginGame?.("local");
    });
  }

  private initResultOverlay(): void {
    const overlay = document.getElementById("solo-result-overlay");
    if (!overlay) {
      throw new Error("Missing solo result overlay.");
    }

    this.resultOverlay = overlay;
    this.resultTitle = document.getElementById("solo-result-title");
    this.resultBody = document.getElementById("solo-result-body");

    const closeButton = document.getElementById("solo-result-close");
    const playAgainButton = document.getElementById("solo-result-play");

    closeButton?.addEventListener("click", () => this.hideResultOverlay());
    playAgainButton?.addEventListener("click", () => {
      this.hideResultOverlay();
      this.showModeOverlay("players");
    });
  }

  showModeOverlay(step: ModeStep): void {
    if (!this.modeOverlay) {
      console.warn("⚠️ Mode overlay element not found");
      return;
    }

    this.overlayVisible = true;
    this.overlayStep = step;
    this.modeOverlay.dataset.step = step;
    this.modeOverlay.dataset.visible = "true";
    this.modeOverlay.setAttribute("aria-hidden", "false");

    this.refreshSettingsPanel();
  }

  hideModeOverlay(): void {
    if (!this.modeOverlay) {
      return;
    }

    // CRITICAL FIX: Move focus away from overlay elements BEFORE hiding
    if (document.activeElement && this.modeOverlay.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
      // Move focus to game container for immediate accessibility
      const gameContainer = document.getElementById('super-board');
      if (gameContainer) {
        gameContainer.tabIndex = 0; // Make focusable
        gameContainer.focus();
      }
    }

    this.overlayVisible = false;
    this.modeOverlay.dataset.visible = "false";
    this.modeOverlay.setAttribute("aria-hidden", "true");
  }

  showResultOverlay(): void {
    if (!this.resultOverlay) {
      return;
    }

    this.resultOverlay.dataset.visible = "true";
    this.resultOverlay.setAttribute("aria-hidden", "false");
  }

  hideResultOverlay(): void {
    if (!this.resultOverlay) {
      return;
    }

    this.resultOverlay.dataset.visible = "false";
    this.resultOverlay.setAttribute("aria-hidden", "true");
  }

  updateResultOverlay(snapshot: GameSnapshot, mode: GameMode = "solo"): void {
    if (!this.resultOverlay || !this.resultTitle) {
      return;
    }

    if (snapshot.status === "playing") {
      this.hideResultOverlay();
      return;
    }

    let title = "We tied!";
    let body = "Want a rematch or head back to the menu?";

    if (mode === "local") {
      if (snapshot.status === "won" && snapshot.winner) {
        title = snapshot.winner === "X" ? "Player 1 (X) wins!" : "Player 2 (O) wins!";
        body = "Three big boards in a row seals it. Rematch?";
      } else {
        title = "It's a draw!";
        body = "Nobody claimed three boards. Play again?";
      }
    } else if (snapshot.status === "won" && snapshot.winner) {
      if (snapshot.winner === "X") {
        title = "You won!";
        body = "Nice work! Try a rematch or bump the difficulty once it's ready.";
      } else {
        title = "I won!";
        body = "The AI took this round—want to try again?";
      }
    } else if (snapshot.status === "draw") {
      title = "We tied!";
      body = "Nobody claimed three boards. Play again?";
    }

    this.resultTitle.textContent = title;
    if (this.resultBody) {
      this.resultBody.textContent = body;
    }

    this.showResultOverlay();
  }

  private refreshSettingsPanel(): void {
    const isSolo = this.pendingMode === "solo";

    this.soloOnlyBlocks.forEach((el) => {
      el.style.display = isSolo ? "" : "none";
    });

    if (this.settingsStartButton) {
      this.settingsStartButton.style.display = isSolo ? "none" : "inline-flex";
    }

    if (this.settingsHeading) {
      const text = isSolo
        ? (this.settingsHeading as any).dataset.soloText
        : (this.settingsHeading as any).dataset.localText;
      if (text) {
        this.settingsHeading.textContent = text;
      }
    }

    if (this.settingsCopy) {
      const text = isSolo
        ? (this.settingsCopy as any).dataset.soloText
        : (this.settingsCopy as any).dataset.localText;
      if (text) {
        this.settingsCopy.textContent = text;
      }
    }

    if (this.adaptiveToggle) {
      this.adaptiveToggle.disabled = !isSolo;
    }

    this.updateRulesDescription();
  }

  updateRulesDescription(): void {
    if (!this.rulesDescription) {
      return;
    }

    let modeKey: "classic" | "modern" | "battle" = "classic";
    if (this.ruleSet === "modern") {
      modeKey = "modern";
    } else if (this.ruleSet === "battle") {
      modeKey = "battle";
    }
    const text = (this.rulesDescription as any).dataset[modeKey] ?? this.rulesDescription.textContent ?? "";
    this.rulesDescription.textContent = text;
  }
}
