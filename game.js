"use strict";
const WIN_PATTERNS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
const PLAYER_LABELS = {
    X: "P1",
    O: "P2",
};
const BOARD_COUNT = 9;
const CELLS_PER_BOARD = 9;
class GameEngine {
    constructor() {
        this.boards = [];
        this.currentPlayer = "X";
        this.activeBoardIndex = null;
        this.status = "playing";
        this.winner = null;
        this.moveCount = 0;
        this.history = [];
        this.lastMove = null;
        this.reset();
    }
    reset() {
        this.boards = Array.from({ length: BOARD_COUNT }, () => this.createBoard());
        this.currentPlayer = "X";
        this.activeBoardIndex = null;
        this.status = "playing";
        this.winner = null;
        this.moveCount = 0;
        this.history = [];
        this.lastMove = null;
    }
    getSnapshot() {
        const allowedBoards = this.status === "playing" ? this.getAllowedBoards() : [];
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
    attemptMove(boardIndex, cellIndex) {
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
            const reason = this.activeBoardIndex !== null &&
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
                reason: `little box ${cellIndex + 1} in board #${boardIndex + 1} is taken.`,
            };
        }
        board.cells[cellIndex] = this.currentPlayer;
        this.moveCount += 1;
        this.evaluateBoardState(boardIndex);
        this.updateMacroState();
        const forcedBoardIndex = cellIndex;
        const forcedBoardFull = this.boardAt(forcedBoardIndex).isFull;
        this.activeBoardIndex = forcedBoardFull ? null : forcedBoardIndex;
        const moveInfo = {
            player: this.currentPlayer,
            boardIndex,
            cellIndex,
            forcedBoardFull,
        };
        this.recordMove(moveInfo);
        this.lastMove = moveInfo;
        if (this.status === "playing") {
            this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        }
        else {
            this.activeBoardIndex = null;
        }
        return { success: true };
    }
    createBoard() {
        return {
            cells: Array(CELLS_PER_BOARD).fill(null),
            winner: null,
            isDraw: false,
            isFull: false,
        };
    }
    boardAt(index) {
        const board = this.boards[index];
        if (!board) {
            throw new Error(`Board index ${index} is out of bounds.`);
        }
        return board;
    }
    evaluateBoardState(boardIndex) {
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
    updateMacroState() {
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
    findMacroWinner() {
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
    findWinner(cells) {
        for (const [a, b, c] of WIN_PATTERNS) {
            const mark = cells[a];
            if (mark && mark === cells[b] && mark === cells[c]) {
                return mark;
            }
        }
        return null;
    }
    getAllowedBoards() {
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
        const available = [];
        this.boards.forEach((board, index) => {
            if (!board.isFull) {
                available.push(index);
            }
        });
        return available;
    }
    recordMove(move) {
        const moveCopy = { ...move };
        if (move.player === "X") {
            const entry = {
                turnNumber: this.history.length + 1,
                p1Move: moveCopy,
            };
            this.history.push(entry);
        }
        else {
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
            }
            else {
                latest.p2Move = moveCopy;
            }
        }
    }
    isValidIndex(value) {
        return Number.isInteger(value) && value >= 0 && value < CELLS_PER_BOARD;
    }
}
class GameUI {
    constructor(engine) {
        this.engine = engine;
        this.miniBoards = [];
        this.cellButtons = [];
        const boardContainer = document.getElementById("super-board");
        const turnLabel = document.getElementById("turn-label");
        const constraintLabel = document.getElementById("constraint-label");
        const resultLabel = document.getElementById("result-label");
        const historyList = document.getElementById("history-list");
        const rulesPanel = document.getElementById("rules-panel");
        const historyPanel = document.getElementById("history-panel");
        if (!boardContainer ||
            !turnLabel ||
            !constraintLabel ||
            !resultLabel ||
            !historyList ||
            !rulesPanel ||
            !historyPanel) {
            throw new Error("Missing key DOM elements.");
        }
        this.boardContainer = boardContainer;
        this.turnLabel = turnLabel;
        this.constraintLabel = constraintLabel;
        this.resultLabel = resultLabel;
        this.historyList = historyList;
        this.rulesPanel = rulesPanel;
        this.historyPanel = historyPanel;
        this.illegalDialog = document.getElementById("illegal-move-dialog");
        this.illegalMessage = document.getElementById("illegal-move-message");
    }
    init() {
        this.buildBoards();
        this.attachControls();
        this.render();
    }
    buildBoards() {
        for (let boardIndex = 0; boardIndex < BOARD_COUNT; boardIndex += 1) {
            const miniBoard = document.createElement("div");
            miniBoard.className = "mini-board";
            miniBoard.dataset.boardIndex = boardIndex.toString();
            miniBoard.setAttribute("role", "grid");
            miniBoard.setAttribute("aria-label", `Big Board ${boardIndex + 1} (cells 1-9)`);
            const buttons = [];
            for (let cellIndex = 0; cellIndex < CELLS_PER_BOARD; cellIndex += 1) {
                const cellButton = document.createElement("button");
                cellButton.type = "button";
                cellButton.className = "cell";
                cellButton.dataset.boardIndex = boardIndex.toString();
                cellButton.dataset.cellIndex = cellIndex.toString();
                cellButton.setAttribute("aria-label", `Board ${boardIndex + 1}, Square ${cellIndex + 1}`);
                cellButton.addEventListener("click", () => this.handleCellClick(boardIndex, cellIndex));
                miniBoard.appendChild(cellButton);
                buttons.push(cellButton);
            }
            this.boardContainer.appendChild(miniBoard);
            this.miniBoards.push(miniBoard);
            this.cellButtons.push(buttons);
        }
    }
    attachControls() {
        var _a;
        const newGameButton = document.getElementById("new-game");
        newGameButton === null || newGameButton === void 0 ? void 0 : newGameButton.addEventListener("click", () => {
            this.engine.reset();
            this.closeIllegalDialog();
            this.render();
        });
        const panelButtons = document.querySelectorAll(".panel-toggle");
        panelButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.dataset.target;
                if (!targetId)
                    return;
                const panel = document.getElementById(targetId);
                if (!panel)
                    return;
                const expanded = panel.dataset.expanded === "true";
                panel.dataset.expanded = (!expanded).toString();
                button.textContent = expanded ? "Show" : "Hide";
                button.setAttribute("aria-expanded", (!expanded).toString());
            });
        });
        const dialogClose = document.getElementById("illegal-move-close");
        dialogClose === null || dialogClose === void 0 ? void 0 : dialogClose.addEventListener("click", () => this.closeIllegalDialog());
        (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.addEventListener("close", () => { var _a; return (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.classList.remove("open"); });
    }
    handleCellClick(boardIndex, cellIndex) {
        var _a;
        const result = this.engine.attemptMove(boardIndex, cellIndex);
        if (!result.success) {
            const reason = (_a = result.reason) !== null && _a !== void 0 ? _a : "that move breaks the rules.";
            this.showIllegalMove(reason);
            return;
        }
        this.render();
    }
    render() {
        const snapshot = this.engine.getSnapshot();
        this.updateStatus(snapshot);
        this.updateBoards(snapshot);
        this.updateHistory(snapshot.history);
    }
    updateStatus(snapshot) {
        if (snapshot.status === "playing") {
            const playerLabel = `${PLAYER_LABELS[snapshot.currentPlayer]} (${snapshot.currentPlayer})`;
            this.turnLabel.textContent = `${playerLabel} is up.`;
            if (snapshot.activeBoardIndex !== null &&
                snapshot.allowedBoards.includes(snapshot.activeBoardIndex)) {
                this.constraintLabel.textContent = `Play in board #${snapshot.activeBoardIndex + 1}.`;
            }
            else {
                this.constraintLabel.textContent = "Pick any open board.";
            }
            this.resultLabel.textContent = "";
        }
        else if (snapshot.status === "won" && snapshot.winner) {
            const winnerLabel = `${PLAYER_LABELS[snapshot.winner]} (${snapshot.winner})`;
            this.turnLabel.textContent = `${winnerLabel} captures the match!`;
            this.constraintLabel.textContent = "Hit New Game to play again.";
            this.resultLabel.textContent = "Three big boards in a row seals the win.";
        }
        else {
            this.turnLabel.textContent = "It’s a draw!";
            this.constraintLabel.textContent = "All boards are full.";
            this.resultLabel.textContent = "Tap New Game for a rematch.";
        }
    }
    updateBoards(snapshot) {
        const allowedSet = new Set(snapshot.allowedBoards);
        this.miniBoards.forEach((boardEl, index) => {
            const state = snapshot.boards[index];
            if (!state) {
                return;
            }
            boardEl.classList.toggle("active-board", snapshot.activeBoardIndex === index && allowedSet.has(index));
            boardEl.classList.toggle("free-choice", snapshot.activeBoardIndex === null && allowedSet.has(index));
            boardEl.classList.toggle("captured-p1", state.winner === "X");
            boardEl.classList.toggle("captured-p2", state.winner === "O");
            boardEl.classList.toggle("drawn", state.isDraw && !state.winner);
            boardEl.classList.toggle("disabled", snapshot.status !== "playing" || (!allowedSet.has(index) && state.isFull));
            const cells = this.cellButtons[index];
            if (!cells) {
                return;
            }
            cells.forEach((button, cellIdx) => {
                const value = state.cells[cellIdx];
                button.textContent = value !== null && value !== void 0 ? value : "";
                button.classList.toggle("p1", value === "X");
                button.classList.toggle("p2", value === "O");
                const shouldDisable = value !== null ||
                    snapshot.status !== "playing" ||
                    !allowedSet.has(index);
                button.disabled = shouldDisable;
                const isLastMove = !!snapshot.lastMove &&
                    snapshot.lastMove.boardIndex === index &&
                    snapshot.lastMove.cellIndex === cellIdx;
                button.classList.toggle("last-move", isLastMove);
            });
        });
    }
    updateHistory(history) {
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
    formatHistoryEntry(entry) {
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
    describeMove(move) {
        const boardLabel = move.boardIndex + 1;
        const cellLabel = move.cellIndex + 1;
        const suffix = move.forcedBoardFull ? "(F)" : "";
        return `${PLAYER_LABELS[move.player]}BB${boardLabel}LB${cellLabel}${suffix}`;
    }
    showIllegalMove(reason) {
        const message = `Oops! can't move there because ${reason}`;
        if (this.illegalDialog && typeof this.illegalDialog.showModal === "function") {
            if (this.illegalMessage) {
                this.illegalMessage.textContent = message;
            }
            if (!this.illegalDialog.open) {
                this.illegalDialog.showModal();
            }
            else if (this.illegalMessage) {
                this.illegalDialog.close();
                this.illegalDialog.showModal();
            }
            return;
        }
        window.alert(message);
    }
    closeIllegalDialog() {
        var _a;
        if ((_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.open) {
            this.illegalDialog.close();
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const engine = new GameEngine();
    const ui = new GameUI(engine);
    ui.init();
});
