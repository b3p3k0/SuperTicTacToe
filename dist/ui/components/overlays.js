export class OverlayManager {
    constructor() {
        this.modeOverlay = null;
        this.resultOverlay = null;
        this.resultTitle = null;
        this.resultBody = null;
        this.settingsHeading = null;
        this.settingsCopy = null;
        this.settingsStartButton = null;
        this.rulesDescription = null;
        this.soloOnlyBlocks = [];
        this.overlayVisible = false;
        this.overlayStep = "players";
        this.pendingMode = "solo";
        this.startPreference = "random";
        this.ruleSet = "battle";
        this.initModeOverlay();
        this.initResultOverlay();
    }
    setGameStartHandler(handler) {
        this.onBeginGame = handler;
    }
    initModeOverlay() {
        var _a;
        const overlay = document.getElementById("mode-overlay");
        if (!overlay) {
            throw new Error("Missing mode selection overlay.");
        }
        this.modeOverlay = overlay;
        // Mode selection buttons
        const modeButtons = overlay.querySelectorAll("[data-mode-choice]");
        console.log("🔍 Found mode buttons:", modeButtons.length, Array.from(modeButtons));
        modeButtons.forEach((button) => {
            const modeChoice = button.dataset.modeChoice;
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
            const diff = button.dataset.difficultyChoice;
            console.log("🎯 Processing difficulty button:", button, "choice:", diff);
            if (!diff) {
                console.warn("⚠️ Difficulty button missing data-difficulty-choice:", button);
                return;
            }
            button.addEventListener("click", (event) => {
                var _a, _b, _c;
                console.log("🖱️ Difficulty button clicked:", diff, "button:", button);
                console.log("🔍 Event details:", event);
                if (button.disabled) {
                    console.log("⚠️ Difficulty button is disabled, ignoring click");
                    return;
                }
                const mode = (_a = this.pendingMode) !== null && _a !== void 0 ? _a : "solo";
                console.log("🎮 Starting game with mode:", mode, "difficulty:", diff);
                if (mode === "solo") {
                    (_b = this.onBeginGame) === null || _b === void 0 ? void 0 : _b.call(this, mode, diff);
                }
                else {
                    (_c = this.onBeginGame) === null || _c === void 0 ? void 0 : _c.call(this, mode);
                }
            });
            console.log("✅ Event listener added for difficulty:", diff);
        });
        // Back button
        const backButton = document.getElementById("difficulty-back");
        backButton === null || backButton === void 0 ? void 0 : backButton.addEventListener("click", () => this.showModeOverlay("players"));
        // Start preference radios
        const startRadios = overlay.querySelectorAll('input[name="start-mode"]');
        startRadios.forEach((radio) => {
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    this.startPreference = radio.value;
                }
            });
            if (radio.checked) {
                this.startPreference = radio.value;
            }
        });
        // Ruleset radios
        const ruleRadios = overlay.querySelectorAll('input[name="ruleset"]');
        ruleRadios.forEach((radio) => {
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    this.ruleSet = radio.value;
                    this.updateRulesDescription();
                }
            });
            if (radio.checked) {
                this.ruleSet = radio.value;
                this.updateRulesDescription();
            }
        });
        // Cache UI elements
        this.soloOnlyBlocks = Array.from(overlay.querySelectorAll(".solo-only"));
        this.settingsStartButton = document.getElementById("settings-start");
        this.settingsHeading = overlay.querySelector("[data-settings-heading]");
        this.settingsCopy = overlay.querySelector("[data-settings-copy]");
        this.rulesDescription = document.getElementById("rules-mode-description");
        (_a = this.settingsStartButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            var _a;
            (_a = this.onBeginGame) === null || _a === void 0 ? void 0 : _a.call(this, "local");
        });
    }
    initResultOverlay() {
        const overlay = document.getElementById("solo-result-overlay");
        if (!overlay) {
            throw new Error("Missing solo result overlay.");
        }
        this.resultOverlay = overlay;
        this.resultTitle = document.getElementById("solo-result-title");
        this.resultBody = document.getElementById("solo-result-body");
        const closeButton = document.getElementById("solo-result-close");
        const playAgainButton = document.getElementById("solo-result-play");
        closeButton === null || closeButton === void 0 ? void 0 : closeButton.addEventListener("click", () => this.hideResultOverlay());
        playAgainButton === null || playAgainButton === void 0 ? void 0 : playAgainButton.addEventListener("click", () => {
            this.hideResultOverlay();
            this.showModeOverlay("players");
        });
    }
    showModeOverlay(step) {
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
    hideModeOverlay() {
        if (!this.modeOverlay) {
            return;
        }
        // CRITICAL FIX: Move focus away from overlay elements BEFORE hiding
        if (document.activeElement && this.modeOverlay.contains(document.activeElement)) {
            document.activeElement.blur();
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
    showResultOverlay() {
        if (!this.resultOverlay) {
            return;
        }
        this.resultOverlay.dataset.visible = "true";
        this.resultOverlay.setAttribute("aria-hidden", "false");
    }
    hideResultOverlay() {
        if (!this.resultOverlay) {
            return;
        }
        this.resultOverlay.dataset.visible = "false";
        this.resultOverlay.setAttribute("aria-hidden", "true");
    }
    updateResultOverlay(snapshot) {
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
            }
            else {
                title = "I won!";
                body = "The AI took this round—want to try again?";
            }
        }
        else if (snapshot.status === "draw") {
            title = "We tied!";
            body = "Nobody claimed three boards. Play again?";
        }
        this.resultTitle.textContent = title;
        if (this.resultBody) {
            this.resultBody.textContent = body;
        }
        this.showResultOverlay();
    }
    refreshSettingsPanel() {
        const isSolo = this.pendingMode === "solo";
        this.soloOnlyBlocks.forEach((el) => {
            el.style.display = isSolo ? "" : "none";
        });
        if (this.settingsStartButton) {
            this.settingsStartButton.style.display = isSolo ? "none" : "inline-flex";
        }
        if (this.settingsHeading) {
            const text = isSolo
                ? this.settingsHeading.dataset.soloText
                : this.settingsHeading.dataset.localText;
            if (text) {
                this.settingsHeading.textContent = text;
            }
        }
        if (this.settingsCopy) {
            const text = isSolo
                ? this.settingsCopy.dataset.soloText
                : this.settingsCopy.dataset.localText;
            if (text) {
                this.settingsCopy.textContent = text;
            }
        }
        this.updateRulesDescription();
    }
    updateRulesDescription() {
        var _a, _b;
        if (!this.rulesDescription) {
            return;
        }
        let modeKey = "classic";
        if (this.ruleSet === "modern") {
            modeKey = "modern";
        }
        else if (this.ruleSet === "battle") {
            modeKey = "battle";
        }
        const text = (_b = (_a = this.rulesDescription.dataset[modeKey]) !== null && _a !== void 0 ? _a : this.rulesDescription.textContent) !== null && _b !== void 0 ? _b : "";
        this.rulesDescription.textContent = text;
    }
}
