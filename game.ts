type Player = "X" | "O";
type CellValue = Player | null;

type GameStatus = "playing" | "won" | "draw";

type GameMode = "local" | "solo";
type Difficulty = "easy" | "normal" | "hard";
type ModeStep = "players" | "difficulty";
type ThemeName = "default" | "krayon" | "vibewave" | "insomniac" | "contrast";
type StartPreference = "human" | "ai" | "random";

interface ThemeConfig {
  label: string;
  tokens: Record<string, string>;
}

interface MiniBoardState {
  cells: CellValue[];
  winner: Player | null;
  isDraw: boolean;
  isFull: boolean;
}

interface MoveInfo {
  player: Player;
  boardIndex: number;
  cellIndex: number;
  forcedBoardFull: boolean;
}

interface HistoryEntry {
  turnNumber: number;
  p1Move?: MoveInfo | undefined;
  p2Move?: MoveInfo | undefined;
}

interface GameSnapshot {
  boards: MiniBoardState[];
  currentPlayer: Player;
  activeBoardIndex: number | null;
  allowedBoards: number[];
  status: GameStatus;
  winner: Player | null;
  moveCount: number;
  history: HistoryEntry[];
  lastMove?: MoveInfo | undefined;
}

interface MoveAttemptResult {
  success: boolean;
  reason?: string;
}

interface AiProfile {
  difficulty: Difficulty;
}

interface AiMove {
  boardIndex: number;
  cellIndex: number;
}

const WIN_PATTERNS: ReadonlyArray<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const PLAYER_LABELS: Record<Player, string> = {
  X: "P1",
  O: "P2",
};

const BOARD_COUNT = 9;
const CELLS_PER_BOARD = 9;
const BOARD_PRIORITY: number[] = [3, 2, 3, 2, 4, 2, 3, 2, 3];
const CELL_PRIORITY: number[] = [2, 1, 2, 1, 3, 1, 2, 1, 2];
const BOARD_NAME_MAP: ReadonlyArray<string> = [
  "top left",
  "top center",
  "top right",
  "middle left",
  "center",
  "middle right",
  "bottom left",
  "bottom center",
  "bottom right",
];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};
const THEME_STORAGE_KEY = "st3.theme";
const THEMES: Record<ThemeName, ThemeConfig> = {
  default: {
    label: "Default",
    tokens: {
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
      "--font-body": "\"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      "--font-heading": "\"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    },
  },
  krayon: {
    label: "Krayon",
    tokens: {
      "--bg": "#fff3d1",
      "--surface": "#fffcee",
      "--border": "#ffcf66",
      "--text": "#1d2a4f",
      "--muted": "#8c5d00",
      "--accent": "#ff5b00",
      "--accent-strong": "#ff007a",
      "--accent-shadow": "rgba(255, 91, 0, 0.45)",
      "--p1": "#0074ff",
      "--p2": "#ff0f65",
      "--capture-bg": "#d9ecff",
      "--capture-bg-p2": "#ffe0f0",
      "--draw-bg": "#fff0b3",
      "--cell-bg": "#fff4cc",
      "--last-move-glow": "rgba(0, 116, 255, 0.45)",
      "--active-board-border": "#00c853",
      "--active-board-glow": "rgba(0, 200, 83, 0.5)",
      "--active-board-glow-strong": "rgba(0, 200, 83, 0.65)",
      "--macro-line": "rgba(105, 72, 0, 0.4)",
      "--overlay-scrim": "rgba(82, 53, 8, 0.75)",
      "--font-body": "\"Baloo 2\", \"Comic Sans MS\", \"Trebuchet MS\", sans-serif",
      "--font-heading": "\"Baloo 2\", \"Comic Sans MS\", \"Trebuchet MS\", sans-serif",
    },
  },
  vibewave: {
    label: "VibeWave",
    tokens: {
      "--bg": "#0c0518",
      "--surface": "#1a0f2b",
      "--border": "#362554",
      "--text": "#f5e1ff",
      "--muted": "#b493ff",
      "--accent": "#ff4ecd",
      "--accent-strong": "#fe89f5",
      "--accent-shadow": "rgba(255, 78, 205, 0.4)",
      "--p1": "#62f4ff",
      "--p2": "#ff5efc",
      "--capture-bg": "#291846",
      "--capture-bg-p2": "#32102f",
      "--draw-bg": "#231437",
      "--cell-bg": "#291744",
      "--last-move-glow": "rgba(94, 223, 255, 0.4)",
      "--active-board-border": "#62ff95",
      "--active-board-glow": "rgba(98, 255, 149, 0.4)",
      "--active-board-glow-strong": "rgba(98, 255, 149, 0.55)",
      "--macro-line": "rgba(255, 78, 205, 0.35)",
      "--overlay-scrim": "rgba(5, 2, 12, 0.85)",
      "--font-body": "\"Orbitron\", \"Segoe UI\", system-ui, sans-serif",
      "--font-heading": "\"Orbitron\", \"Segoe UI\", system-ui, sans-serif",
    },
  },
  insomniac: {
    label: "Insomniac",
    tokens: {
      "--bg": "#050910",
      "--surface": "#0f1729",
      "--border": "#1c2638",
      "--text": "#d7dee8",
      "--muted": "#7c8a9c",
      "--accent": "#1d8cf8",
      "--accent-strong": "#1273cc",
      "--accent-shadow": "rgba(18, 115, 204, 0.35)",
      "--p1": "#4fb4ff",
      "--p2": "#ff8c66",
      "--capture-bg": "#151f32",
      "--capture-bg-p2": "#1f1b26",
      "--draw-bg": "#141c2b",
      "--cell-bg": "#10192a",
      "--last-move-glow": "rgba(79, 180, 255, 0.35)",
      "--active-board-border": "#3dd68c",
      "--active-board-glow": "rgba(61, 214, 140, 0.35)",
      "--active-board-glow-strong": "rgba(61, 214, 140, 0.5)",
      "--macro-line": "rgba(255, 255, 255, 0.15)",
      "--overlay-scrim": "rgba(2, 6, 23, 0.85)",
      "--font-body": "\"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      "--font-heading": "\"Space Grotesk\", \"Segoe UI\", system-ui, sans-serif",
    },
  },
  contrast: {
    label: "High Contrast",
    tokens: {
      "--bg": "#ffffff",
      "--surface": "#ffffff",
      "--border": "#000000",
      "--text": "#000000",
      "--muted": "#000000",
      "--accent": "#000000",
      "--accent-strong": "#000000",
      "--accent-shadow": "rgba(0, 0, 0, 0.45)",
      "--p1": "#000000",
      "--p2": "#000000",
      "--capture-bg": "#d9d9d9",
      "--capture-bg-p2": "#c0c0c0",
      "--draw-bg": "#b5b5b5",
      "--cell-bg": "#ffffff",
      "--last-move-glow": "rgba(0, 0, 0, 0.5)",
      "--active-board-border": "#000000",
      "--active-board-glow": "rgba(0, 0, 0, 0.45)",
      "--active-board-glow-strong": "rgba(0, 0, 0, 0.6)",
      "--macro-line": "rgba(0, 0, 0, 0.9)",
      "--overlay-scrim": "rgba(0, 0, 0, 0.85)",
      "--font-body": "\"Source Sans Pro\", \"Arial\", sans-serif",
      "--font-heading": "\"Source Sans Pro\", \"Arial\", sans-serif",
    },
  },
};

class GameEngine {
  private boards: MiniBoardState[] = [];
  private currentPlayer: Player = "X";
  private activeBoardIndex: number | null = null;
  private status: GameStatus = "playing";
  private winner: Player | null = null;
  private moveCount = 0;
  private history: HistoryEntry[] = [];
  private lastMove: MoveInfo | null = null;

  constructor() {
    this.reset();
  }

  public reset(startingPlayer: Player = "X"): void {
    this.boards = Array.from({ length: BOARD_COUNT }, () => this.createBoard());
    this.currentPlayer = startingPlayer;
    this.activeBoardIndex = null;
    this.status = "playing";
    this.winner = null;
    this.moveCount = 0;
    this.history = [];
    this.lastMove = null;
  }

  public getSnapshot(): GameSnapshot {
    const allowedBoards =
      this.status === "playing" ? this.getAllowedBoards() : [];

    return {
      boards: this.boards.map((board) => ({
        cells: [...board.cells],
        winner: board.winner,
        isDraw: board.isDraw,
        isFull: board.isFull,
      })),
      currentPlayer: this.currentPlayer,
      activeBoardIndex: this.activeBoardIndex,
      allowedBoards,
      status: this.status,
      winner: this.winner,
      moveCount: this.moveCount,
      history: this.history.map((entry) => ({
        turnNumber: entry.turnNumber,
        p1Move: entry.p1Move ? { ...entry.p1Move } : undefined,
        p2Move: entry.p2Move ? { ...entry.p2Move } : undefined,
      })),
      lastMove: this.lastMove ? { ...this.lastMove } : undefined,
    };
  }

  public attemptMove(boardIndex: number, cellIndex: number): MoveAttemptResult {
    if (this.status !== "playing") {
      return {
        success: false,
        reason: "this game is over—start a new one to keep playing.",
      };
    }

    if (!this.isValidIndex(boardIndex) || !this.isValidIndex(cellIndex)) {
      return {
        success: false,
        reason: "that spot is outside the board. Try 1 through 9.",
      };
    }

    const allowedBoards = this.getAllowedBoards();
    if (!allowedBoards.includes(boardIndex)) {
      const reason =
        this.activeBoardIndex !== null &&
        !this.boardAt(this.activeBoardIndex).isFull
          ? `board #${this.activeBoardIndex + 1} is the active board right now.`
          : `board #${boardIndex + 1} is already full—pick another.`;
      return {
        success: false,
        reason,
      };
    }

    const board = this.boardAt(boardIndex);
    if (board.cells[cellIndex] !== null) {
      return {
        success: false,
        reason: `little box ${cellIndex + 1} in board #${
          boardIndex + 1
        } is taken.`,
      };
    }

    board.cells[cellIndex] = this.currentPlayer;
    this.moveCount += 1;
    this.evaluateBoardState(boardIndex);
    this.updateMacroState();

    const forcedBoardIndex = cellIndex;
    const forcedBoardFull = this.boardAt(forcedBoardIndex).isFull;

    this.activeBoardIndex = forcedBoardFull ? null : forcedBoardIndex;

    const moveInfo: MoveInfo = {
      player: this.currentPlayer,
      boardIndex,
      cellIndex,
      forcedBoardFull,
    };

    this.recordMove(moveInfo);
    this.lastMove = moveInfo;

    if (this.status === "playing") {
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    } else {
      this.activeBoardIndex = null;
    }

    return { success: true };
  }

  private createBoard(): MiniBoardState {
    return {
      cells: Array<CellValue>(CELLS_PER_BOARD).fill(null),
      winner: null,
      isDraw: false,
      isFull: false,
    };
  }

  private boardAt(index: number): MiniBoardState {
    const board = this.boards[index];
    if (!board) {
      throw new Error(`Board index ${index} is out of bounds.`);
    }
    return board;
  }

  private evaluateBoardState(boardIndex: number): void {
    const board = this.boardAt(boardIndex);
    if (!board.winner) {
      const winner = this.findWinner(board.cells);
      if (winner) {
        board.winner = winner;
      }
    }
    board.isFull = board.cells.every((cell) => cell !== null);
    board.isDraw = !board.winner && board.isFull;
  }

  private updateMacroState(): void {
    const macroWinner = this.findMacroWinner();
    if (macroWinner) {
      this.status = "won";
      this.winner = macroWinner;
      return;
    }

    const allFull = this.boards.every((board) => board.isFull);
    if (allFull) {
      this.status = "draw";
    }
  }

  private findMacroWinner(): Player | null {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      const boardA = this.boards[a];
      const boardB = this.boards[b];
      const boardC = this.boards[c];
      if (!boardA || !boardB || !boardC) {
        continue;
      }
      const first = boardA.winner;
      if (first && first === boardB.winner && first === boardC.winner) {
        return first;
      }
    }
    return null;
  }

  private findWinner(cells: CellValue[]): Player | null {
    for (const [a, b, c] of WIN_PATTERNS) {
      const mark = cells[a];
      if (mark && mark === cells[b] && mark === cells[c]) {
        return mark;
      }
    }
    return null;
  }

  private getAllowedBoards(): number[] {
    if (this.status !== "playing") {
      return [];
    }

    if (this.activeBoardIndex !== null) {
      const targetBoard = this.boardAt(this.activeBoardIndex);
      if (!targetBoard.isFull) {
        return [this.activeBoardIndex];
      }
      this.activeBoardIndex = null;
    }

    const available: number[] = [];
    this.boards.forEach((board, index) => {
      if (!board.isFull) {
        available.push(index);
      }
    });
    return available;
  }

  private recordMove(move: MoveInfo): void {
    const moveCopy: MoveInfo = { ...move };
    if (move.player === "X") {
      const entry: HistoryEntry = {
        turnNumber: this.history.length + 1,
        p1Move: moveCopy,
      };
      this.history.push(entry);
    } else {
      const latest = this.history[this.history.length - 1];
      if (!latest) {
        this.history.push({
          turnNumber: 1,
          p2Move: moveCopy,
        });
        return;
      }
      if (latest.p2Move) {
        this.history.push({
          turnNumber: this.history.length + 1,
          p2Move: moveCopy,
        });
      } else {
        latest.p2Move = moveCopy;
      }
    }
  }

  private isValidIndex(value: number): boolean {
    return Number.isInteger(value) && value >= 0 && value < CELLS_PER_BOARD;
  }
}

class GameUI {
  private boardContainer: HTMLElement;
  private turnLabel: HTMLElement;
  private constraintLabel: HTMLElement;
  private resultLabel: HTMLElement;
  private historyList: HTMLOListElement;
  private rulesPanel: HTMLElement;
  private historyPanel: HTMLElement;
  private illegalDialog: HTMLDialogElement | null;
  private illegalMessage: HTMLElement | null;
  private miniBoards: HTMLElement[] = [];
  private cellButtons: HTMLButtonElement[][] = [];
  private mode: GameMode = "local";
  private aiProfile: AiProfile | null = null;
  private aiController: AiController | null = null;
  private modeOverlay: HTMLElement | null = null;
  private resultOverlay: HTMLElement | null = null;
  private resultTitle: HTMLElement | null = null;
  private resultBody: HTMLElement | null = null;
  private startPreference: StartPreference = "random";
  private overlayVisible = false;
  private humanInputLocked = true;
  private awaitingAiMove = false;
  private aiMoveTimer: number | null = null;
  private overlayStep: ModeStep = "players";

  constructor(private engine: GameEngine) {
    const boardContainer = document.getElementById("super-board");
    const turnLabel = document.getElementById("turn-label");
    const constraintLabel = document.getElementById("constraint-label");
    const resultLabel = document.getElementById("result-label");
    const historyList = document.getElementById("history-list");
    const rulesPanel = document.getElementById("rules-panel");
    const historyPanel = document.getElementById("history-panel");

    if (
      !boardContainer ||
      !turnLabel ||
      !constraintLabel ||
      !resultLabel ||
      !historyList ||
      !rulesPanel ||
      !historyPanel
    ) {
      throw new Error("Missing key DOM elements.");
    }

    this.boardContainer = boardContainer;
    this.turnLabel = turnLabel;
    this.constraintLabel = constraintLabel;
    this.resultLabel = resultLabel;
    this.historyList = historyList as HTMLOListElement;
    this.rulesPanel = rulesPanel;
    this.historyPanel = historyPanel;
    this.illegalDialog = document.getElementById(
      "illegal-move-dialog",
    ) as HTMLDialogElement | null;
    this.illegalMessage = document.getElementById("illegal-move-message");
  }

  public init(): void {
    this.buildBoards();
    this.attachControls();
    this.initModeOverlay();
    this.initResultOverlay();
    this.showModeOverlay("players");
    this.render();
  }

  private buildBoards(): void {
    for (let boardIndex = 0; boardIndex < BOARD_COUNT; boardIndex += 1) {
      const miniBoard = document.createElement("div");
      miniBoard.className = "mini-board";
      miniBoard.dataset.boardIndex = boardIndex.toString();
      miniBoard.setAttribute("role", "grid");
      miniBoard.setAttribute(
        "aria-label",
        `Big Board ${boardIndex + 1} (cells 1-9)`,
      );

      const buttons: HTMLButtonElement[] = [];
      for (let cellIndex = 0; cellIndex < CELLS_PER_BOARD; cellIndex += 1) {
        const cellButton = document.createElement("button");
        cellButton.type = "button";
        cellButton.className = "cell";
        cellButton.dataset.boardIndex = boardIndex.toString();
        cellButton.dataset.cellIndex = cellIndex.toString();
        cellButton.setAttribute(
          "aria-label",
          `Board ${boardIndex + 1}, Square ${cellIndex + 1}`,
        );
        cellButton.addEventListener("click", () =>
          this.handleCellClick(boardIndex, cellIndex),
        );
        miniBoard.appendChild(cellButton);
        buttons.push(cellButton);
      }

      this.boardContainer.appendChild(miniBoard);
      this.miniBoards.push(miniBoard);
      this.cellButtons.push(buttons);
    }
  }

  private attachControls(): void {
    const newGameButton = document.getElementById("new-game");
    newGameButton?.addEventListener("click", () => {
      this.closeIllegalDialog();
      this.showModeOverlay("players");
    });

    const panelButtons = document.querySelectorAll<HTMLButtonElement>(
      ".panel-toggle",
    );
    panelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        if (!targetId) return;
        const panel = document.getElementById(targetId);
        if (!panel) return;
        const expanded = panel.dataset.expanded === "true";
        panel.dataset.expanded = (!expanded).toString();
        button.textContent = expanded ? "Show" : "Hide";
        button.setAttribute("aria-expanded", (!expanded).toString());
      });
    });

    const dialogClose = document.getElementById("illegal-move-close");
    dialogClose?.addEventListener("click", () => this.closeIllegalDialog());
    this.illegalDialog?.addEventListener("close", () =>
      this.illegalDialog?.classList.remove("open"),
    );
  }

  private initModeOverlay(): void {
    const overlay = document.getElementById("mode-overlay");
    if (!overlay) {
      throw new Error("Missing mode selection overlay.");
    }
    this.modeOverlay = overlay;
    const modeButtons =
      overlay.querySelectorAll<HTMLButtonElement>("[data-mode-choice]");
    modeButtons.forEach((button) => {
      const modeChoice = button.dataset.modeChoice as
        | GameMode
        | undefined;
      if (!modeChoice) {
        return;
      }
      button.addEventListener("click", () => {
        if (modeChoice === "solo") {
          this.showModeOverlay("difficulty");
        } else {
          this.beginGame("local");
        }
      });
    });

    const diffButtons = overlay.querySelectorAll<HTMLButtonElement>(
      "[data-difficulty-choice]",
    );
    diffButtons.forEach((button) => {
      const diff = button.dataset.difficultyChoice as Difficulty | undefined;
      if (!diff) {
        return;
      }
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }
        this.beginGame("solo", diff);
      });
    });

    const backButton = document.getElementById("difficulty-back");
    backButton?.addEventListener("click", () => this.showModeOverlay("players"));

    const startRadios = overlay.querySelectorAll<HTMLInputElement>(
      'input[name="start-mode"]',
    );
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

  private showModeOverlay(step: ModeStep): void {
    if (!this.modeOverlay) {
      return;
    }
    this.overlayVisible = true;
    this.overlayStep = step;
    this.modeOverlay.dataset.step = step;
    this.modeOverlay.dataset.visible = "true";
    this.modeOverlay.setAttribute("aria-hidden", "false");
    this.cancelPendingAiMove();
    this.setHumanInputLocked(true);
  }

  private hideModeOverlay(): void {
    if (!this.modeOverlay) {
      return;
    }
    this.overlayVisible = false;
    this.modeOverlay.dataset.visible = "false";
    this.modeOverlay.setAttribute("aria-hidden", "true");
  }

  private showResultOverlay(): void {
    if (!this.resultOverlay) {
      return;
    }
    this.resultOverlay.dataset.visible = "true";
    this.resultOverlay.setAttribute("aria-hidden", "false");
  }

  private hideResultOverlay(): void {
    if (!this.resultOverlay) {
      return;
    }
    this.resultOverlay.dataset.visible = "false";
    this.resultOverlay.setAttribute("aria-hidden", "true");
  }

  private beginGame(mode: GameMode, difficulty?: Difficulty): void {
    this.mode = mode;
    this.cancelPendingAiMove();
    let startingPlayer: Player = "X";
    if (mode === "solo") {
      const selected = difficulty ?? "normal";
      this.aiProfile = { difficulty: selected };
      this.aiController = new AiController(selected);
      startingPlayer = this.pickStartingPlayer();
    } else {
      this.aiProfile = null;
      this.aiController = null;
    }
    this.engine.reset(startingPlayer);
    this.closeIllegalDialog();
    this.hideModeOverlay();
    const humanLocked = this.mode === "solo" && startingPlayer === "O";
    this.setHumanInputLocked(humanLocked);
    this.render();
  }

  private pickStartingPlayer(): Player {
    if (this.startPreference === "human") {
      return "X";
    }
    if (this.startPreference === "ai") {
      return "O";
    }
    return Math.random() < 0.5 ? "X" : "O";
  }

  private handleCellClick(boardIndex: number, cellIndex: number): void {
    if (this.humanInputLocked) {
      return;
    }
    const result = this.engine.attemptMove(boardIndex, cellIndex);
    if (!result.success) {
      const reason = result.reason ?? "that move breaks the rules.";
      this.showIllegalMove(reason);
      return;
    }
    this.render();
  }

  private render(): void {
    const snapshot = this.engine.getSnapshot();
    this.updateStatus(snapshot);
    this.updateBoards(snapshot);
    this.updateHistory(snapshot.history);
    this.handleAiFlow(snapshot);
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
      this.turnLabel.textContent = "It’s a draw!";
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
    if (this.mode !== "solo" || !this.resultOverlay || !this.resultTitle) {
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

  private updateBoards(snapshot: GameSnapshot): void {
    const allowedSet = new Set(snapshot.allowedBoards);
    this.boardContainer.classList.toggle("board-locked", this.humanInputLocked);
    this.miniBoards.forEach((boardEl, index) => {
      const state = snapshot.boards[index];
      if (!state) {
        return;
      }
      boardEl.classList.toggle(
        "active-board",
        snapshot.activeBoardIndex === index && allowedSet.has(index),
      );
      boardEl.classList.toggle(
        "free-choice",
        snapshot.activeBoardIndex === null && allowedSet.has(index),
      );
      boardEl.classList.toggle("captured-p1", state.winner === "X");
      boardEl.classList.toggle("captured-p2", state.winner === "O");
      boardEl.classList.toggle(
        "drawn",
        state.isDraw && !state.winner,
      );
      boardEl.classList.toggle(
        "disabled",
        snapshot.status !== "playing" || (!allowedSet.has(index) && state.isFull),
      );

      const cells = this.cellButtons[index];
      if (!cells) {
        return;
      }
      cells.forEach((button, cellIdx) => {
        const value = state.cells[cellIdx];
        button.textContent = value ?? "";
        button.classList.toggle("p1", value === "X");
        button.classList.toggle("p2", value === "O");
        const shouldDisable =
          value !== null ||
          snapshot.status !== "playing" ||
          !allowedSet.has(index);
        button.disabled = shouldDisable;
        const isLastMove =
          !!snapshot.lastMove &&
          snapshot.lastMove.boardIndex === index &&
          snapshot.lastMove.cellIndex === cellIdx;
        button.classList.toggle("last-move", isLastMove);
      });
    });
  }

  private updateHistory(history: HistoryEntry[]): void {
    this.historyList.innerHTML = "";
    if (history.length === 0) {
      const placeholder = document.createElement("li");
      placeholder.textContent = "No moves yet.";
      placeholder.style.color = "var(--muted)";
      this.historyList.appendChild(placeholder);
      return;
    }

    history.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = this.formatHistoryEntry(entry);
      this.historyList.appendChild(item);
    });
  }

  private handleAiFlow(snapshot: GameSnapshot): void {
    if (
      this.mode !== "solo" ||
      !this.aiController ||
      this.overlayVisible
    ) {
      this.cancelPendingAiMove();
      if (!this.overlayVisible) {
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
          if (!this.overlayVisible) {
            this.setHumanInputLocked(false);
          }
          return;
        }
        const move = this.aiController.chooseMove(latest);
        if (!move) {
          this.awaitingAiMove = false;
          if (!this.overlayVisible) {
            this.setHumanInputLocked(false);
          }
          return;
        }
        const outcome = this.engine.attemptMove(move.boardIndex, move.cellIndex);
        this.awaitingAiMove = false;
        if (!outcome.success) {
          if (!this.overlayVisible) {
            this.setHumanInputLocked(false);
          }
          return;
        }
        this.render();
      }, 120);
      return;
    }

    this.cancelPendingAiMove();
    if (!this.overlayVisible) {
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
    this.boardContainer.classList.toggle("board-locked", locked);
  }

  private formatHistoryEntry(entry: HistoryEntry): string {
    const left = entry.p1Move ? this.describeMove(entry.p1Move) : "";
    const right = entry.p2Move ? this.describeMove(entry.p2Move) : "";
    if (left && right) {
      return `T${entry.turnNumber}: ${left} -> ${right}`;
    }
    if (left) {
      return `T${entry.turnNumber}: ${left}`;
    }
    if (right) {
      return `T${entry.turnNumber}: -> ${right}`;
    }
    return `T${entry.turnNumber}:`;
  }

  private describeMove(move: MoveInfo): string {
    const boardLabel = move.boardIndex + 1;
    const cellLabel = move.cellIndex + 1;
    const suffix = move.forcedBoardFull ? "(F)" : "";
    return `${PLAYER_LABELS[move.player]}BB${boardLabel}LB${cellLabel}${suffix}`;
  }

  private showIllegalMove(reason: string): void {
    const message = `Oops! can't move there because ${reason}`;
    if (this.illegalDialog && typeof this.illegalDialog.showModal === "function") {
      if (this.illegalMessage) {
        this.illegalMessage.textContent = message;
      }
      if (!this.illegalDialog.open) {
        this.illegalDialog.showModal();
      } else if (this.illegalMessage) {
        this.illegalDialog.close();
        this.illegalDialog.showModal();
      }
      return;
    }
    window.alert(message);
  }

  private closeIllegalDialog(): void {
    if (this.illegalDialog?.open) {
      this.illegalDialog.close();
    }
  }
}

class ThemeManager {
  private current: ThemeName = "default";

  constructor(private select: HTMLSelectElement | null) {
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

  public applyTheme(name: string, persist = true): void {
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

  public getCurrentTheme(): ThemeName {
    return this.current;
  }
}

class AiUtils {
  public static collectCandidates(snapshot: GameSnapshot): AiMove[] {
    if (snapshot.status !== "playing") {
      return [];
    }
    const candidates: AiMove[] = [];
    const boardIndexes =
      snapshot.allowedBoards.length > 0
        ? snapshot.allowedBoards
        : snapshot.boards
            .map((board, index) => (!board.isFull ? index : -1))
            .filter((index) => index >= 0);
    boardIndexes.forEach((boardIndex) => {
      const board = snapshot.boards[boardIndex];
      if (!board) {
        return;
      }
      board.cells.forEach((value, cellIndex) => {
        if (value === null) {
          candidates.push({ boardIndex, cellIndex });
        }
      });
    });
    return candidates;
  }

  public static findImmediateWin(
    snapshot: GameSnapshot,
    candidates: AiMove[],
    player: Player,
  ): AiMove | null {
    for (const move of candidates) {
      const board = snapshot.boards[move.boardIndex];
      if (!board || board.winner) {
        continue;
      }
      if (this.completesLine(board.cells, move.cellIndex, player)) {
        return move;
      }
    }
    return null;
  }

  public static patternOpportunityScore(
    cells: CellValue[],
    player: Player,
    cellIndex: number,
  ): number {
    const simulated = cells.slice();
    simulated[cellIndex] = player;
    const opponent = this.getOpponent(player);
    let score = 0;
    for (const pattern of WIN_PATTERNS) {
      if (!pattern.includes(cellIndex)) {
        continue;
      }
      const marks = pattern.map((idx) => simulated[idx]);
      if (marks.includes(opponent)) {
        continue;
      }
      const playerCount = marks.filter((mark) => mark === player).length;
      if (playerCount === 3) {
        score += 5;
      } else if (playerCount === 2) {
        score += 2;
      } else if (playerCount === 1) {
        score += 0.5;
      }
    }
    return score;
  }

  public static patternBlockScore(
    cells: CellValue[],
    opponent: Player,
    cellIndex: number,
  ): number {
    let score = 0;
    for (const pattern of WIN_PATTERNS) {
      if (!pattern.includes(cellIndex)) {
        continue;
      }
      const marks = pattern.map((idx) => cells[idx]);
      const opponentCount = marks.filter((mark) => mark === opponent).length;
      const emptyCount = marks.filter((mark) => mark === null).length;
      if (opponentCount === 2 && emptyCount === 1) {
        score += 2.5;
      }
    }
    return score;
  }

  public static evaluateBoardComfort(board: MiniBoardState): number {
    let score = 0;
    for (const pattern of WIN_PATTERNS) {
      const marks = pattern.map((idx) => board.cells[idx]);
      const ours = marks.filter((mark) => mark === "O").length;
      const theirs = marks.filter((mark) => mark === "X").length;
      if (theirs === 0) {
        score += ours * 0.4;
      }
      if (ours === 0 && theirs === 2) {
        score -= 1.5;
      }
    }
    return score;
  }

  public static createsMacroThreat(
    snapshot: GameSnapshot,
    move: AiMove,
  ): boolean {
    const board = snapshot.boards[move.boardIndex];
    if (!board || board.winner) {
      return false;
    }
    if (!this.completesLine(board.cells, move.cellIndex, "O")) {
      return false;
    }
    const futureWinners = snapshot.boards.map((mini, index) => {
      if (index === move.boardIndex) {
        return "O" as Player;
      }
      return mini.winner;
    });
    return WIN_PATTERNS.some((pattern) => {
      const wins = pattern.map((idx) => futureWinners[idx]);
      const oCount = wins.filter((mark) => mark === "O").length;
      const blanks = wins.filter((mark) => !mark).length;
      return oCount === 2 && blanks === 1;
    });
  }

  public static completesLine(
    cells: CellValue[],
    cellIndex: number,
    player: Player,
  ): boolean {
    return WIN_PATTERNS.some((pattern) => {
      if (!pattern.includes(cellIndex)) {
        return false;
      }
      return pattern.every((idx) => {
        if (idx === cellIndex) {
          return true;
        }
        return cells[idx] === player;
      });
    });
  }

  public static boardPotential(cells: CellValue[], player: Player): number {
    let score = 0;
    const opponent = this.getOpponent(player);
    for (const pattern of WIN_PATTERNS) {
      let blocked = false;
      let marks = 0;
      for (const idx of pattern) {
        if (cells[idx] === opponent) {
          blocked = true;
          break;
        }
        if (cells[idx] === player) {
          marks += 1;
        }
      }
      if (blocked) {
        continue;
      }
      if (marks === 3) {
        score += 5;
      } else if (marks === 2) {
        score += 1.5;
      } else if (marks === 1) {
        score += 0.4;
      } else {
        score += 0.1;
      }
    }
    return score;
  }

  public static getOpponent(player: Player): Player {
    return player === "X" ? "O" : "X";
  }

  public static findWinner(cells: CellValue[]): Player | null {
    for (const [a, b, c] of WIN_PATTERNS) {
      const mark = cells[a];
      if (mark && mark === cells[b] && mark === cells[c]) {
        return mark;
      }
    }
    return null;
  }

  public static findMacroWinner(boards: MiniBoardState[]): Player | null {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      const first = boards[a]?.winner;
      if (first && first === boards[b]?.winner && first === boards[c]?.winner) {
        return first;
      }
    }
    return null;
  }
}

class AiSimulator {
  public static applyMove(
    snapshot: GameSnapshot,
    move: AiMove,
    player: Player,
  ): GameSnapshot | null {
    const boards = snapshot.boards.map((board) => ({
      cells: [...board.cells],
      winner: board.winner,
      isDraw: board.isDraw,
      isFull: board.isFull,
    }));
    const board = boards[move.boardIndex];
    if (!board || board.cells[move.cellIndex] !== null) {
      return null;
    }
    board.cells[move.cellIndex] = player;
    if (!board.winner) {
      const winner = AiUtils.findWinner(board.cells);
      if (winner) {
        board.winner = winner;
      }
    }
    board.isFull = board.cells.every((cell) => cell !== null);
    board.isDraw = !board.winner && board.isFull;

    const result: GameSnapshot = {
      boards,
      currentPlayer: AiUtils.getOpponent(player),
      activeBoardIndex: null,
      allowedBoards: [],
      status: "playing",
      winner: null,
      moveCount: snapshot.moveCount + 1,
      history: snapshot.history,
      lastMove: {
        player,
        boardIndex: move.boardIndex,
        cellIndex: move.cellIndex,
        forcedBoardFull: false,
      },
    };

    const forcedIndex = move.cellIndex;
    const forcedBoard = boards[forcedIndex];
    const forcedFull = !forcedBoard || forcedBoard.isFull;
    result.lastMove!.forcedBoardFull = forcedFull;
    if (!forcedFull && forcedBoard) {
      result.activeBoardIndex = forcedIndex;
      result.allowedBoards = [forcedIndex];
    } else {
      result.activeBoardIndex = null;
      result.allowedBoards = boards
        .map((mini, idx) => (!mini.isFull ? idx : -1))
        .filter((idx) => idx >= 0);
    }

    const macroWinner = AiUtils.findMacroWinner(boards);
    if (macroWinner) {
      result.status = "won";
      result.winner = macroWinner;
      result.allowedBoards = [];
      result.activeBoardIndex = null;
    } else if (boards.every((mini) => mini.isFull)) {
      result.status = "draw";
      result.allowedBoards = [];
      result.activeBoardIndex = null;
    }

    return result;
  }
}

class EasyAiStrategy {
  public static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }
    const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
    if (winningMove) {
      return winningMove;
    }
    if (Math.random() < 0.45) {
      const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
      if (blockingMove) {
        return blockingMove;
      }
    }
    const scored = candidates.map((move) => {
      const priority =
        (CELL_PRIORITY[move.cellIndex] ?? 0) +
        (BOARD_PRIORITY[move.boardIndex] ?? 0);
      return {
        move,
        score: priority + Math.random() * 4 - 2,
      };
    });
    scored.sort((a, b) => b.score - a.score);
    return (scored[0] ?? { move: candidates[0]! }).move;
  }
}

class NormalAiStrategy {
  public static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }
    const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
    if (winningMove) {
      return winningMove;
    }
    const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
    if (blockingMove) {
      return blockingMove;
    }
    return this.scoreAndPick(snapshot, candidates);
  }

  private static scoreAndPick(
    snapshot: GameSnapshot,
    candidates: AiMove[],
  ): AiMove {
    let bestMove = candidates[0]!;
    let bestScore = -Infinity;
    for (const move of candidates) {
      const score = this.scoreMove(snapshot, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  private static scoreMove(snapshot: GameSnapshot, move: AiMove): number {
    const board = snapshot.boards[move.boardIndex];
    if (!board) {
      return -Infinity;
    }
    let score = 0;
    score += BOARD_PRIORITY[move.boardIndex] ?? 0;
    score += CELL_PRIORITY[move.cellIndex] ?? 0;

    if (!board.winner) {
      score += AiUtils.patternOpportunityScore(board.cells, "O", move.cellIndex);
      score += AiUtils.patternBlockScore(board.cells, "X", move.cellIndex);
    } else if (board.winner === "X") {
      score -= 2;
    } else if (board.winner === "O") {
      score -= 0.5;
    }

    const targetBoardIndex = move.cellIndex;
    const targetBoard = snapshot.boards[targetBoardIndex];
    if (targetBoard) {
      if (targetBoard.isFull) {
        score += 2;
      } else if (targetBoard.winner === "O") {
        score += 1.5;
      } else if (targetBoard.winner === "X") {
        score -= 1.5;
      } else {
        score += AiUtils.evaluateBoardComfort(targetBoard);
      }
    } else {
      score += 0.5;
    }

    if (AiUtils.createsMacroThreat(snapshot, move)) {
      score += 2.5;
    }

    return score + Math.random() * 0.001;
  }
}

class HardAiStrategy {
  private static readonly MAX_DEPTH = 3;

  public static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }
    let bestMove: AiMove | null = null;
    let bestScore = -Infinity;
    for (const move of candidates) {
      const next = AiSimulator.applyMove(snapshot, move, "O");
      if (!next) {
        continue;
      }
      const score = this.minimax(next, 1, this.MAX_DEPTH);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove ?? candidates[0]!;
  }

  private static minimax(
    state: GameSnapshot,
    depth: number,
    maxDepth: number,
  ): number {
    const terminal = this.evaluateTerminal(state, depth);
    if (terminal !== null) {
      return terminal;
    }
    if (depth >= maxDepth) {
      return this.evaluateState(state);
    }
    const candidates = AiUtils.collectCandidates(state);
    if (candidates.length === 0) {
      return this.evaluateState(state);
    }
    const maximizing = state.currentPlayer === "O";
    let bestScore = maximizing ? -Infinity : Infinity;
    for (const move of candidates) {
      const next = AiSimulator.applyMove(state, move, state.currentPlayer);
      if (!next) {
        continue;
      }
      const value = this.minimax(next, depth + 1, maxDepth);
      if (maximizing) {
        if (value > bestScore) {
          bestScore = value;
        }
      } else if (value < bestScore) {
        bestScore = value;
      }
    }
    return bestScore;
  }

  private static evaluateTerminal(
    state: GameSnapshot,
    depth: number,
  ): number | null {
    if (state.status === "won" && state.winner) {
      return state.winner === "O" ? 100 - depth * 2 : depth * 2 - 100;
    }
    if (state.status === "draw") {
      return 0;
    }
    return null;
  }

  private static evaluateState(state: GameSnapshot): number {
    let score = 0;
    state.boards.forEach((board) => {
      if (board.winner === "O") {
        score += 8;
      } else if (board.winner === "X") {
        score -= 8;
      } else {
        score += AiUtils.boardPotential(board.cells, "O") * 0.8;
        score -= AiUtils.boardPotential(board.cells, "X") * 0.8;
      }
    });
    score += this.evaluateMacro(state.boards) * 5;
    return score;
  }

  private static evaluateMacro(boards: MiniBoardState[]): number {
    let score = 0;
    for (const pattern of WIN_PATTERNS) {
      const winners = pattern.map((idx) => boards[idx]?.winner ?? null);
      const aiWins = winners.filter((mark) => mark === "O").length;
      const humanWins = winners.filter((mark) => mark === "X").length;
      if (humanWins === 0) {
        score += aiWins;
      } else if (aiWins === 0) {
        score -= humanWins;
      }
    }
    return score;
  }
}

class AiController {
  constructor(private difficulty: Difficulty) {}

  public chooseMove(snapshot: GameSnapshot): AiMove | null {
    switch (this.difficulty) {
      case "easy":
        return EasyAiStrategy.choose(snapshot);
      case "hard":
        return HardAiStrategy.choose(snapshot);
      case "normal":
      default:
        return NormalAiStrategy.choose(snapshot);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById(
    "theme-select",
  ) as HTMLSelectElement | null;
  new ThemeManager(themeSelect);
  const engine = new GameEngine();
  const ui = new GameUI(engine);
  ui.init();
});
