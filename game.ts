type Player = "X" | "O";
type CellValue = Player | null;

type GameStatus = "playing" | "won" | "draw";

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

  public reset(): void {
    this.boards = Array.from({ length: BOARD_COUNT }, () => this.createBoard());
    this.currentPlayer = "X";
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
      this.engine.reset();
      this.closeIllegalDialog();
      this.render();
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

  private handleCellClick(boardIndex: number, cellIndex: number): void {
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
  }

  private updateStatus(snapshot: GameSnapshot): void {
    if (snapshot.status === "playing") {
      const playerLabel = `${PLAYER_LABELS[snapshot.currentPlayer]} (${snapshot.currentPlayer})`;
      this.turnLabel.textContent = `${playerLabel} is up.`;
      if (
        snapshot.activeBoardIndex !== null &&
        snapshot.allowedBoards.includes(snapshot.activeBoardIndex)
      ) {
        this.constraintLabel.textContent = `Play in board #${
          snapshot.activeBoardIndex + 1
        }.`;
      } else {
        this.constraintLabel.textContent = "Pick any open board.";
      }
      this.resultLabel.textContent = "";
    } else if (snapshot.status === "won" && snapshot.winner) {
      const winnerLabel = `${PLAYER_LABELS[snapshot.winner]} (${snapshot.winner})`;
      this.turnLabel.textContent = `${winnerLabel} captures the match!`;
      this.constraintLabel.textContent = "Hit New Game to play again.";
      this.resultLabel.textContent = "Three big boards in a row seals the win.";
    } else {
      this.turnLabel.textContent = "It’s a draw!";
      this.constraintLabel.textContent = "All boards are full.";
      this.resultLabel.textContent = "Tap New Game for a rematch.";
    }
  }

  private updateBoards(snapshot: GameSnapshot): void {
    const allowedSet = new Set(snapshot.allowedBoards);
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

document.addEventListener("DOMContentLoaded", () => {
  const engine = new GameEngine();
  const ui = new GameUI(engine);
  ui.init();
});
