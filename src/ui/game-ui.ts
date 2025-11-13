import {
  GameMode,
  Difficulty,
  GameSnapshot,
  Player,
  AiProfile,
  AdaptiveBand,
} from "../core/types.js";
import {
  PLAYER_LABELS,
  DIFFICULTY_LABELS,
  BOARD_NAME_MAP,
} from "../core/constants.js";
import { GameEngine } from "../core/engine.js";
import { AiController } from "../ai/controller.js";
import { BoardRenderer } from "./components/board.js";
import { OverlayManager } from "./components/overlays.js";
import { PanelManager } from "./components/panels.js";
import { SoloStatsTracker, SoloOutcome } from "../analytics/solo-tracker.js";
import { AdaptiveLoop } from "../analytics/adaptive-loop.js";

export class GameUI {
  private engine: GameEngine;
  private boardRenderer: BoardRenderer;
  private overlayManager: OverlayManager;
  private panelManager: PanelManager;

  private turnLabel: HTMLElement;
  private constraintLabel: HTMLElement;
  private resultLabel: HTMLElement;

  // Game state
  private mode: GameMode = "local";
  private aiProfile: AiProfile | null = null;
  private aiController: AiController | null = null;
  private humanInputLocked: boolean = true;
  private awaitingAiMove: boolean = false;
  private aiMoveTimer: number | null = null;
  private lastRecordedOutcomeSignature: string | null = null;
  private soloStatsBar: HTMLElement | null = null;
  private soloStatsText: HTMLElement | null = null;
  private adaptiveTurnStart: number | null = null;
  private adaptiveIllegalAttempts = 0;
  private adaptiveTurnMoveCount = -1;

  constructor(engine: GameEngine) {
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

  init(): void {
    this.overlayManager.showModeOverlay("players");
    this.render();
  }

  private setupEventHandlers(): void {
    // New game button
    const newGameButton = document.getElementById("new-game");
    newGameButton?.addEventListener("click", () => {
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

  private handleCellClick(boardIndex: number, cellIndex: number): void {
    console.log("🖱️ CELL CLICKED:", { boardIndex, cellIndex, humanInputLocked: this.humanInputLocked });

    if (this.humanInputLocked) {
      console.log("🖱️ CELL CLICK BLOCKED - human input locked");
      return;
    }

    console.log("🖱️ CELL CLICK - Attempting move...");
    const result = this.engine.attemptMove(boardIndex, cellIndex);
    if (!result.success) {
      const reason = result.reason ?? "that move breaks the rules.";
      console.log("🖱️ CELL CLICK FAILED:", reason);
      this.noteIllegalAdaptiveAttempt();
      this.panelManager.showIllegalMove(reason);
      return;
    }

    this.commitAdaptiveSample();
    console.log("🖱️ CELL CLICK SUCCESS - calling render");
    this.render();
  }

  private beginGame(mode: GameMode, difficulty?: Difficulty): void {
    this.mode = mode;
    this.cancelPendingAiMove();
    this.resetAdaptiveTracking();

    let startingPlayer: Player = "X";

    if (mode === "solo") {
      const selected = difficulty ?? "normal";
      const adaptiveActive = this.isAdaptiveActive();
      const adaptiveBand = adaptiveActive ? this.resolveAdaptiveBand(selected) : null;
      this.aiProfile = { difficulty: selected, adaptiveBand };
      this.aiController = new AiController(selected, adaptiveBand, adaptiveActive);
      startingPlayer = this.pickStartingPlayer();
    } else {
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

  private pickStartingPlayer(): Player {
    if (this.overlayManager.startPreference === "human") {
      return "X";
    }
    if (this.overlayManager.startPreference === "ai") {
      return "O";
    }
    return Math.random() < 0.5 ? "X" : "O";
  }

  private render(): void {
    const snapshot = this.engine.getSnapshot();
    this.handleAiFlow(snapshot);
    this.refreshAdaptiveTracking(snapshot);
    this.updateStatus(snapshot);
    this.boardRenderer.updateBoards(snapshot, this.humanInputLocked);
    this.panelManager.updateHistory(snapshot.history);
    this.trackSoloOutcome(snapshot);
    this.updateSoloStatsBar();
  }

  private updateStatus(snapshot: GameSnapshot): void {
    if (snapshot.status === "playing") {
      const playerLabel = this.formatCurrentPlayerLabel(snapshot);
      this.turnLabel.textContent = `${playerLabel} is up.`;

      if (
        snapshot.activeBoardIndex !== null &&
        snapshot.allowedBoards.includes(snapshot.activeBoardIndex)
      ) {
        const boardName =
          BOARD_NAME_MAP[snapshot.activeBoardIndex] ??
          `board #${snapshot.activeBoardIndex + 1}`;
        this.constraintLabel.textContent = `Next play in ${boardName} square.`;
      } else {
        this.constraintLabel.textContent = "Pick any open board.";
      }

      this.resultLabel.textContent = "";
    } else if (snapshot.status === "won" && snapshot.winner) {
      const winnerLabel = this.formatWinnerLabel(snapshot);
      this.turnLabel.textContent = `${winnerLabel} captures the match!`;
      this.constraintLabel.textContent = "Hit New Game to play again.";
      this.resultLabel.textContent = "Three big boards in a row seals the win.";

      this.maybeShowResultOverlay(snapshot);
    } else {
      this.turnLabel.textContent = "It's a draw!";
      this.constraintLabel.textContent = "All boards are full.";
      this.resultLabel.textContent = "Tap New Game for a rematch.";

      this.maybeShowResultOverlay(snapshot);
    }
  }

  private formatCurrentPlayerLabel(snapshot: GameSnapshot): string {
    let label = `${PLAYER_LABELS[snapshot.currentPlayer]} (${snapshot.currentPlayer})`;

    if (
      this.mode === "solo" &&
      snapshot.currentPlayer === "O" &&
      this.aiProfile
    ) {
      label += ` · ${DIFFICULTY_LABELS[this.aiProfile.difficulty]} AI`;
    }

    return label;
  }

  private formatWinnerLabel(snapshot: GameSnapshot): string {
    if (!snapshot.winner) {
      return "";
    }

    let label = `${PLAYER_LABELS[snapshot.winner]} (${snapshot.winner})`;

    if (this.mode === "solo" && snapshot.winner === "O" && this.aiProfile) {
      label += ` · ${DIFFICULTY_LABELS[this.aiProfile.difficulty]} AI`;
    }

    return label;
  }

  private maybeShowResultOverlay(snapshot: GameSnapshot): void {
    if (this.mode !== "solo") {
      return;
    }
    this.overlayManager.updateResultOverlay(snapshot);
  }

  private handleAiFlow(snapshot: GameSnapshot): void {
    if (
      this.mode !== "solo" ||
      !this.aiController ||
      this.overlayManager.overlayVisible
    ) {
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

        if (
          latest.status !== "playing" ||
          latest.currentPlayer !== "O" ||
          !this.aiController
        ) {
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

  private cancelPendingAiMove(): void {
    if (this.aiMoveTimer !== null) {
      window.clearTimeout(this.aiMoveTimer);
      this.aiMoveTimer = null;
    }
    this.awaitingAiMove = false;
  }

  private setHumanInputLocked(locked: boolean): void {
    this.humanInputLocked = locked;
    this.boardRenderer.setBoardLocked(locked);
  }

  private trackSoloOutcome(snapshot: GameSnapshot): void {
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

    const difficulty = this.aiProfile?.difficulty ?? "normal";
    let outcome: SoloOutcome = "draw";

    if (snapshot.status === "won" && snapshot.winner) {
      outcome = snapshot.winner === "X" ? "human" : "ai";
    }

    SoloStatsTracker.record(snapshot.ruleSet, difficulty, outcome);
    if (this.isAdaptiveActive()) {
      AdaptiveLoop.recordOutcome(snapshot.ruleSet, difficulty, outcome);
      this.refreshAiControllerBand();
    }
  }

  private updateSoloStatsBar(): void {
    if (!this.soloStatsBar || !this.soloStatsText) {
      return;
    }

    const stats = SoloStatsTracker.getStats();
    const totals = stats?.totals ?? { human: 0, ai: 0, draw: 0 };
    const totalGames = totals.human + totals.ai + totals.draw;

    this.soloStatsText.textContent = `Human wins ${totals.human} · AI wins ${totals.ai} · Draws ${totals.draw} · Total games ${totalGames}`;

    const isEmpty = totalGames === 0;
    this.soloStatsBar.classList.toggle("solo-stats-empty", isEmpty);
  }

  private shouldTrackAdaptive(): boolean {
    return this.mode === "solo" && !!this.aiProfile && this.isAdaptiveActive();
  }

  private refreshAdaptiveTracking(snapshot: GameSnapshot): void {
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

  private noteIllegalAdaptiveAttempt(): void {
    if (!this.shouldTrackAdaptive()) {
      return;
    }
    if (this.adaptiveTurnStart === null) {
      this.adaptiveTurnStart = this.getTimestamp();
    }
    this.adaptiveIllegalAttempts += 1;
  }

  private commitAdaptiveSample(): void {
    if (!this.shouldTrackAdaptive() || this.adaptiveTurnStart === null || !this.aiProfile) {
      return;
    }
    const duration = Math.max(0, this.getTimestamp() - this.adaptiveTurnStart);
    if (this.isAdaptiveActive()) {
      AdaptiveLoop.recordHumanMove(this.overlayManager.ruleSet, this.aiProfile.difficulty, {
        durationMs: duration,
        illegalAttempts: this.adaptiveIllegalAttempts,
      });
      this.refreshAiControllerBand();
    }
    this.adaptiveTurnStart = null;
    this.adaptiveIllegalAttempts = 0;
  }

  private resetAdaptiveTracking(): void {
    this.adaptiveTurnStart = null;
    this.adaptiveIllegalAttempts = 0;
    this.adaptiveTurnMoveCount = -1;
  }

  private getTimestamp(): number {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  private resolveAdaptiveBand(difficulty: Difficulty): AdaptiveBand | null {
    if (!this.isAdaptiveActive()) {
      return null;
    }
    return AdaptiveLoop.getSkillBucket(this.overlayManager.ruleSet, difficulty);
  }

  private isAdaptiveActive(): boolean {
    return this.overlayManager.adaptiveEnabled && AdaptiveLoop.isEnabled();
  }

  private refreshAiControllerBand(): void {
    if (!this.aiController || !this.aiProfile) {
      return;
    }
    const band = this.isAdaptiveActive()
      ? AdaptiveLoop.getSkillBucket(this.overlayManager.ruleSet, this.aiProfile.difficulty)
      : null;
    this.aiProfile.adaptiveBand = band;
    this.aiController.updateAdaptiveBand(band);
  }
}
