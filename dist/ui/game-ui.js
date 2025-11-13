import { PLAYER_LABELS, DIFFICULTY_LABELS, BOARD_NAME_MAP, } from "../core/constants.js";
import { AiController } from "../ai/controller.js";
import { BoardRenderer } from "./components/board.js";
import { OverlayManager } from "./components/overlays.js";
import { PanelManager } from "./components/panels.js";
import { SoloStatsTracker } from "../analytics/solo-tracker.js";
import { AdaptiveLoop } from "../analytics/adaptive-loop.js";
export class GameUI {
    constructor(engine) {
        // Game state
        this.mode = "local";
        this.aiProfile = null;
        this.aiController = null;
        this.humanInputLocked = true;
        this.awaitingAiMove = false;
        this.aiMoveTimer = null;
        this.lastRecordedOutcomeSignature = null;
        this.soloStatsBar = null;
        this.soloStatsText = null;
        this.adaptiveTurnStart = null;
        this.adaptiveIllegalAttempts = 0;
        this.adaptiveTurnMoveCount = -1;
        this.engine = engine;
        // Get required DOM elements
        const boardContainer = document.getElementById("super-board");
        const turnLabel = document.getElementById("turn-label");
        const constraintLabel = document.getElementById("constraint-label");
        const resultLabel = document.getElementById("result-label");
        if (!boardContainer || !turnLabel || !constraintLabel || !resultLabel) {
            throw new Error("Missing key DOM elements.");
        }
        this.turnLabel = turnLabel;
        this.constraintLabel = constraintLabel;
        this.resultLabel = resultLabel;
        // Initialize components
        this.boardRenderer = new BoardRenderer(boardContainer);
        this.overlayManager = new OverlayManager();
        this.panelManager = new PanelManager();
        this.soloStatsBar = document.getElementById("solo-stats-bar");
        this.soloStatsText = document.getElementById("solo-stats-text");
        this.setupEventHandlers();
    }
    init() {
        this.overlayManager.showModeOverlay("players");
        this.render();
    }
    setupEventHandlers() {
        // New game button
        const newGameButton = document.getElementById("new-game");
        newGameButton === null || newGameButton === void 0 ? void 0 : newGameButton.addEventListener("click", () => {
            this.panelManager.closeIllegalDialog();
            this.overlayManager.showModeOverlay("players");
        });
        // Board cell clicks
        this.boardRenderer.setCellClickHandler((boardIndex, cellIndex) => {
            this.handleCellClick(boardIndex, cellIndex);
        });
        // Game start handler
        this.overlayManager.setGameStartHandler((mode, difficulty) => {
            this.beginGame(mode, difficulty);
        });
    }
    handleCellClick(boardIndex, cellIndex) {
        var _a;
        console.log("🖱️ CELL CLICKED:", { boardIndex, cellIndex, humanInputLocked: this.humanInputLocked });
        if (this.humanInputLocked) {
            console.log("🖱️ CELL CLICK BLOCKED - human input locked");
            return;
        }
        console.log("🖱️ CELL CLICK - Attempting move...");
        const result = this.engine.attemptMove(boardIndex, cellIndex);
        if (!result.success) {
            const reason = (_a = result.reason) !== null && _a !== void 0 ? _a : "that move breaks the rules.";
            console.log("🖱️ CELL CLICK FAILED:", reason);
            this.noteIllegalAdaptiveAttempt();
            this.panelManager.showIllegalMove(reason);
            return;
        }
        this.commitAdaptiveSample();
        console.log("🖱️ CELL CLICK SUCCESS - calling render");
        this.render();
    }
    beginGame(mode, difficulty) {
        this.mode = mode;
        this.cancelPendingAiMove();
        this.resetAdaptiveTracking();
        let startingPlayer = "X";
        if (mode === "solo") {
            const selected = difficulty !== null && difficulty !== void 0 ? difficulty : "normal";
            const adaptiveBand = this.resolveAdaptiveBand(selected);
            this.aiProfile = { difficulty: selected, adaptiveBand };
            this.aiController = new AiController(selected, adaptiveBand);
            startingPlayer = this.pickStartingPlayer();
        }
        else {
            this.aiProfile = null;
            this.aiController = null;
        }
        this.engine.reset(startingPlayer, this.overlayManager.ruleSet);
        this.overlayManager.updateRulesDescription();
        this.panelManager.closeIllegalDialog();
        this.overlayManager.hideModeOverlay();
        const humanLocked = this.mode === "solo" && startingPlayer === "O";
        this.setHumanInputLocked(humanLocked);
        this.render();
    }
    pickStartingPlayer() {
        if (this.overlayManager.startPreference === "human") {
            return "X";
        }
        if (this.overlayManager.startPreference === "ai") {
            return "O";
        }
        return Math.random() < 0.5 ? "X" : "O";
    }
    render() {
        const snapshot = this.engine.getSnapshot();
        this.handleAiFlow(snapshot);
        this.refreshAdaptiveTracking(snapshot);
        this.updateStatus(snapshot);
        this.boardRenderer.updateBoards(snapshot, this.humanInputLocked);
        this.panelManager.updateHistory(snapshot.history);
        this.trackSoloOutcome(snapshot);
        this.updateSoloStatsBar();
    }
    updateStatus(snapshot) {
        var _a;
        if (snapshot.status === "playing") {
            const playerLabel = this.formatCurrentPlayerLabel(snapshot);
            this.turnLabel.textContent = `${playerLabel} is up.`;
            if (snapshot.activeBoardIndex !== null &&
                snapshot.allowedBoards.includes(snapshot.activeBoardIndex)) {
                const boardName = (_a = BOARD_NAME_MAP[snapshot.activeBoardIndex]) !== null && _a !== void 0 ? _a : `board #${snapshot.activeBoardIndex + 1}`;
                this.constraintLabel.textContent = `Next play in ${boardName} square.`;
            }
            else {
                this.constraintLabel.textContent = "Pick any open board.";
            }
            this.resultLabel.textContent = "";
        }
        else if (snapshot.status === "won" && snapshot.winner) {
            const winnerLabel = this.formatWinnerLabel(snapshot);
            this.turnLabel.textContent = `${winnerLabel} captures the match!`;
            this.constraintLabel.textContent = "Hit New Game to play again.";
            this.resultLabel.textContent = "Three big boards in a row seals the win.";
            this.maybeShowResultOverlay(snapshot);
        }
        else {
            this.turnLabel.textContent = "It's a draw!";
            this.constraintLabel.textContent = "All boards are full.";
            this.resultLabel.textContent = "Tap New Game for a rematch.";
            this.maybeShowResultOverlay(snapshot);
        }
    }
    formatCurrentPlayerLabel(snapshot) {
        let label = `${PLAYER_LABELS[snapshot.currentPlayer]} (${snapshot.currentPlayer})`;
        if (this.mode === "solo" &&
            snapshot.currentPlayer === "O" &&
            this.aiProfile) {
            label += ` · ${DIFFICULTY_LABELS[this.aiProfile.difficulty]} AI`;
        }
        return label;
    }
    formatWinnerLabel(snapshot) {
        if (!snapshot.winner) {
            return "";
        }
        let label = `${PLAYER_LABELS[snapshot.winner]} (${snapshot.winner})`;
        if (this.mode === "solo" && snapshot.winner === "O" && this.aiProfile) {
            label += ` · ${DIFFICULTY_LABELS[this.aiProfile.difficulty]} AI`;
        }
        return label;
    }
    maybeShowResultOverlay(snapshot) {
        if (this.mode !== "solo") {
            return;
        }
        this.overlayManager.updateResultOverlay(snapshot);
    }
    handleAiFlow(snapshot) {
        if (this.mode !== "solo" ||
            !this.aiController ||
            this.overlayManager.overlayVisible) {
            this.cancelPendingAiMove();
            if (!this.overlayManager.overlayVisible) {
                this.setHumanInputLocked(false);
            }
            return;
        }
        if (snapshot.status !== "playing") {
            this.cancelPendingAiMove();
            this.setHumanInputLocked(false);
            this.maybeShowResultOverlay(snapshot);
            return;
        }
        if (snapshot.currentPlayer === "O") {
            if (this.awaitingAiMove) {
                return;
            }
            this.setHumanInputLocked(true);
            this.awaitingAiMove = true;
            this.aiMoveTimer = window.setTimeout(() => {
                this.aiMoveTimer = null;
                const latest = this.engine.getSnapshot();
                if (latest.status !== "playing" ||
                    latest.currentPlayer !== "O" ||
                    !this.aiController) {
                    this.awaitingAiMove = false;
                    if (!this.overlayManager.overlayVisible) {
                        this.setHumanInputLocked(false);
                    }
                    return;
                }
                const move = this.aiController.chooseMove(latest);
                if (!move) {
                    this.awaitingAiMove = false;
                    if (!this.overlayManager.overlayVisible) {
                        this.setHumanInputLocked(false);
                    }
                    return;
                }
                const outcome = this.engine.attemptMove(move.boardIndex, move.cellIndex);
                this.awaitingAiMove = false;
                if (!outcome.success) {
                    if (!this.overlayManager.overlayVisible) {
                        this.setHumanInputLocked(false);
                    }
                    return;
                }
                this.render();
            }, 120);
            return;
        }
        this.cancelPendingAiMove();
        if (!this.overlayManager.overlayVisible) {
            this.setHumanInputLocked(false);
        }
    }
    cancelPendingAiMove() {
        if (this.aiMoveTimer !== null) {
            window.clearTimeout(this.aiMoveTimer);
            this.aiMoveTimer = null;
        }
        this.awaitingAiMove = false;
    }
    setHumanInputLocked(locked) {
        this.humanInputLocked = locked;
        this.boardRenderer.setBoardLocked(locked);
    }
    trackSoloOutcome(snapshot) {
        var _a, _b;
        if (this.mode !== "solo") {
            this.lastRecordedOutcomeSignature = null;
            return;
        }
        if (snapshot.status === "playing") {
            this.lastRecordedOutcomeSignature = null;
            return;
        }
        const signature = `${snapshot.status}-${snapshot.moveCount}`;
        if (this.lastRecordedOutcomeSignature === signature) {
            return;
        }
        this.lastRecordedOutcomeSignature = signature;
        const difficulty = (_b = (_a = this.aiProfile) === null || _a === void 0 ? void 0 : _a.difficulty) !== null && _b !== void 0 ? _b : "normal";
        let outcome = "draw";
        if (snapshot.status === "won" && snapshot.winner) {
            outcome = snapshot.winner === "X" ? "human" : "ai";
        }
        SoloStatsTracker.record(snapshot.ruleSet, difficulty, outcome);
        if (this.isAdaptiveActive()) {
            AdaptiveLoop.recordOutcome(snapshot.ruleSet, difficulty, outcome);
        }
    }
    updateSoloStatsBar() {
        var _a;
        if (!this.soloStatsBar || !this.soloStatsText) {
            return;
        }
        const stats = SoloStatsTracker.getStats();
        const totals = (_a = stats === null || stats === void 0 ? void 0 : stats.totals) !== null && _a !== void 0 ? _a : { human: 0, ai: 0, draw: 0 };
        const totalGames = totals.human + totals.ai + totals.draw;
        this.soloStatsText.textContent = `Human wins ${totals.human} · AI wins ${totals.ai} · Draws ${totals.draw} · Total games ${totalGames}`;
        const isEmpty = totalGames === 0;
        this.soloStatsBar.classList.toggle("solo-stats-empty", isEmpty);
    }
    shouldTrackAdaptive() {
        return this.mode === "solo" && !!this.aiProfile && this.isAdaptiveActive();
    }
    refreshAdaptiveTracking(snapshot) {
        if (!this.shouldTrackAdaptive() || snapshot.status !== "playing") {
            this.resetAdaptiveTracking();
            return;
        }
        const expectingHuman = snapshot.currentPlayer === "X" && !this.humanInputLocked;
        if (!expectingHuman) {
            return;
        }
        if (snapshot.moveCount !== this.adaptiveTurnMoveCount) {
            this.adaptiveTurnStart = this.getTimestamp();
            this.adaptiveIllegalAttempts = 0;
            this.adaptiveTurnMoveCount = snapshot.moveCount;
        }
    }
    noteIllegalAdaptiveAttempt() {
        if (!this.shouldTrackAdaptive()) {
            return;
        }
        if (this.adaptiveTurnStart === null) {
            this.adaptiveTurnStart = this.getTimestamp();
        }
        this.adaptiveIllegalAttempts += 1;
    }
    commitAdaptiveSample() {
        if (!this.shouldTrackAdaptive() || this.adaptiveTurnStart === null || !this.aiProfile) {
            return;
        }
        const duration = Math.max(0, this.getTimestamp() - this.adaptiveTurnStart);
        if (this.isAdaptiveActive()) {
            AdaptiveLoop.recordHumanMove(this.overlayManager.ruleSet, this.aiProfile.difficulty, {
                durationMs: duration,
                illegalAttempts: this.adaptiveIllegalAttempts,
            });
        }
        this.adaptiveTurnStart = null;
        this.adaptiveIllegalAttempts = 0;
    }
    resetAdaptiveTracking() {
        this.adaptiveTurnStart = null;
        this.adaptiveIllegalAttempts = 0;
        this.adaptiveTurnMoveCount = -1;
    }
    getTimestamp() {
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            return performance.now();
        }
        return Date.now();
    }
    resolveAdaptiveBand(difficulty) {
        if (!this.isAdaptiveActive()) {
            return null;
        }
        return AdaptiveLoop.getSkillBucket(this.overlayManager.ruleSet, difficulty);
    }
    isAdaptiveActive() {
        return this.overlayManager.adaptiveEnabled && AdaptiveLoop.isEnabled();
    }
}
