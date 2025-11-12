import {
  GameMode,
  Difficulty,
  ModeStep,
  StartPreference,
  RuleSet,
  GameSnapshot,
} from "../../core/types.js";
import { DIFFICULTY_LABELS } from "../../core/constants.js";

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

  public overlayVisible: boolean = false;
  public overlayStep: ModeStep = "players";
  public pendingMode: GameMode = "solo";
  public startPreference: StartPreference = "random";
  public ruleSet: RuleSet = "classic";

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
    console.log("🔍 Found mode buttons:", modeButtons.length, Array.from(modeButtons));
    modeButtons.forEach((button) => {
      const modeChoice = (button as HTMLElement).dataset.modeChoice as GameMode;
      console.log("🎯 Processing mode button:", button, "choice:", modeChoice);
      if (!modeChoice) {
        console.warn("⚠️ Mode button missing data-mode-choice:", button);
        return;
      }
      button.addEventListener("click", () => {
        console.log("🖱️ Mode button clicked:", modeChoice);
        this.pendingMode = modeChoice;
        this.showModeOverlay("difficulty");
      });
      console.log("✅ Event listener added for mode:", modeChoice);
    });

    // Difficulty buttons
    const diffButtons = overlay.querySelectorAll("[data-difficulty-choice]");
    console.log("🔍 Found difficulty buttons:", diffButtons.length, Array.from(diffButtons));
    diffButtons.forEach((button) => {
      const diff = (button as HTMLElement).dataset.difficultyChoice as Difficulty;
      console.log("🎯 Processing difficulty button:", button, "choice:", diff);
      if (!diff) {
        console.warn("⚠️ Difficulty button missing data-difficulty-choice:", button);
        return;
      }
      button.addEventListener("click", (event) => {
        console.log("🖱️ Difficulty button clicked:", diff, "button:", button);
        console.log("🔍 Event details:", event);

        if ((button as HTMLButtonElement).disabled) {
          console.log("⚠️ Difficulty button is disabled, ignoring click");
          return;
        }

        const mode = this.pendingMode ?? "solo";
        console.log("🎮 Starting game with mode:", mode, "difficulty:", diff);
        if (mode === "solo") {
          this.onBeginGame?.(mode, diff);
        } else {
          this.onBeginGame?.(mode);
        }
      });
      console.log("✅ Event listener added for difficulty:", diff);
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
    console.log("📋 showModeOverlay called with step:", step);
    if (!this.modeOverlay) {
      console.warn("⚠️ Mode overlay element not found");
      return;
    }

    this.overlayVisible = true;
    this.overlayStep = step;
    this.modeOverlay.dataset.step = step;
    this.modeOverlay.dataset.visible = "true";
    this.modeOverlay.setAttribute("aria-hidden", "false");

    console.log("📋 Overlay step set to:", step, "dataset:", this.modeOverlay.dataset);
    this.refreshSettingsPanel();
    console.log("✅ showModeOverlay complete");
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

  updateResultOverlay(snapshot: GameSnapshot): void {
    if (!this.resultOverlay || !this.resultTitle) {
      return;
    }

    if (snapshot.status === "playing") {
      this.hideResultOverlay();
      return;
    }

    let title = "We tied!";
    let body = "Want a rematch or head back to the menu?";

    if (snapshot.status === "won" && snapshot.winner) {
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

    this.updateRulesDescription();
  }

  updateRulesDescription(): void {
    if (!this.rulesDescription) {
      return;
    }

    const modeKey = this.ruleSet === "classic" ? "classic" : "modern";
    const text = (this.rulesDescription as any).dataset[modeKey] ?? this.rulesDescription.textContent ?? "";
    this.rulesDescription.textContent = text;
  }
}