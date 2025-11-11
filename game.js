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
const BOARD_PRIORITY = [3, 2, 3, 2, 4, 2, 3, 2, 3];
const CELL_PRIORITY = [2, 1, 2, 1, 3, 1, 2, 1, 2];
const BOARD_NAME_MAP = [
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
const DIFFICULTY_LABELS = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
};
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
    reset(startingPlayer = "X") {
        this.boards = Array.from({ length: BOARD_COUNT }, () => this.createBoard());
        this.currentPlayer = startingPlayer;
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
        this.mode = "local";
        this.aiProfile = null;
        this.aiController = null;
        this.modeOverlay = null;
        this.resultOverlay = null;
        this.resultTitle = null;
        this.resultBody = null;
        this.overlayVisible = false;
        this.humanInputLocked = true;
        this.awaitingAiMove = false;
        this.aiMoveTimer = null;
        this.overlayStep = "players";
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
        this.initModeOverlay();
        this.initResultOverlay();
        this.showModeOverlay("players");
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
            this.closeIllegalDialog();
            this.showModeOverlay("players");
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
    initModeOverlay() {
        const overlay = document.getElementById("mode-overlay");
        if (!overlay) {
            throw new Error("Missing mode selection overlay.");
        }
        this.modeOverlay = overlay;
        const modeButtons = overlay.querySelectorAll("[data-mode-choice]");
        modeButtons.forEach((button) => {
            const modeChoice = button.dataset.modeChoice;
            if (!modeChoice) {
                return;
            }
            button.addEventListener("click", () => {
                if (modeChoice === "solo") {
                    this.showModeOverlay("difficulty");
                }
                else {
                    this.beginGame("local");
                }
            });
        });
        const diffButtons = overlay.querySelectorAll("[data-difficulty-choice]");
        diffButtons.forEach((button) => {
            const diff = button.dataset.difficultyChoice;
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
        backButton === null || backButton === void 0 ? void 0 : backButton.addEventListener("click", () => this.showModeOverlay("players"));
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
    hideModeOverlay() {
        if (!this.modeOverlay) {
            return;
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
    beginGame(mode, difficulty) {
        this.mode = mode;
        this.cancelPendingAiMove();
        let startingPlayer = "X";
        if (mode === "solo") {
            const selected = difficulty !== null && difficulty !== void 0 ? difficulty : "normal";
            this.aiProfile = { difficulty: selected };
            this.aiController = new AiController(selected);
            startingPlayer = Math.random() < 0.5 ? "X" : "O";
        }
        else {
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
    handleCellClick(boardIndex, cellIndex) {
        var _a;
        if (this.humanInputLocked) {
            return;
        }
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
        this.handleAiFlow(snapshot);
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
            this.turnLabel.textContent = "It’s a draw!";
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
    updateBoards(snapshot) {
        const allowedSet = new Set(snapshot.allowedBoards);
        this.boardContainer.classList.toggle("board-locked", this.humanInputLocked);
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
    handleAiFlow(snapshot) {
        if (this.mode !== "solo" ||
            !this.aiController ||
            this.overlayVisible) {
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
                if (latest.status !== "playing" ||
                    latest.currentPlayer !== "O" ||
                    !this.aiController) {
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
    cancelPendingAiMove() {
        if (this.aiMoveTimer !== null) {
            window.clearTimeout(this.aiMoveTimer);
            this.aiMoveTimer = null;
        }
        this.awaitingAiMove = false;
    }
    setHumanInputLocked(locked) {
        this.humanInputLocked = locked;
        this.boardContainer.classList.toggle("board-locked", locked);
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
class AiController {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
    chooseMove(snapshot) {
        switch (this.difficulty) {
            case "normal":
            default:
                return NormalAiStrategy.choose(snapshot);
        }
    }
}
class NormalAiStrategy {
    static choose(snapshot) {
        const candidates = this.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        const winningMove = this.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        const blockingMove = this.findImmediateWin(snapshot, candidates, "X");
        if (blockingMove) {
            return blockingMove;
        }
        return this.scoreAndPick(snapshot, candidates);
    }
    static collectCandidates(snapshot) {
        const candidates = [];
        snapshot.allowedBoards.forEach((boardIndex) => {
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
    static findImmediateWin(snapshot, candidates, player) {
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
    static scoreAndPick(snapshot, candidates) {
        let bestMove = candidates[0];
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
    static scoreMove(snapshot, move) {
        var _a, _b;
        const board = snapshot.boards[move.boardIndex];
        if (!board) {
            return -Infinity;
        }
        let score = 0;
        score += (_a = BOARD_PRIORITY[move.boardIndex]) !== null && _a !== void 0 ? _a : 0;
        score += (_b = CELL_PRIORITY[move.cellIndex]) !== null && _b !== void 0 ? _b : 0;
        if (!board.winner) {
            score += this.patternOpportunityScore(board.cells, "O", move.cellIndex);
            score += this.patternBlockScore(board.cells, "X", move.cellIndex);
        }
        else if (board.winner === "X") {
            score -= 2;
        }
        else if (board.winner === "O") {
            score -= 0.5;
        }
        const targetBoardIndex = move.cellIndex;
        const targetBoard = snapshot.boards[targetBoardIndex];
        if (targetBoard) {
            if (targetBoard.isFull) {
                score += 2;
            }
            else if (targetBoard.winner === "O") {
                score += 1.5;
            }
            else if (targetBoard.winner === "X") {
                score -= 1.5;
            }
            else {
                score += this.evaluateBoardComfort(targetBoard);
            }
        }
        else {
            score += 0.5;
        }
        if (this.createsMacroThreat(snapshot, move)) {
            score += 2.5;
        }
        return score + Math.random() * 0.001;
    }
    static patternOpportunityScore(cells, player, cellIndex) {
        const simulated = cells.slice();
        simulated[cellIndex] = player;
        const opponent = player === "O" ? "X" : "O";
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
            }
            else if (playerCount === 2) {
                score += 2;
            }
            else if (playerCount === 1) {
                score += 0.5;
            }
        }
        return score;
    }
    static patternBlockScore(cells, opponent, cellIndex) {
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
    static evaluateBoardComfort(board) {
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
    static createsMacroThreat(snapshot, move) {
        const board = snapshot.boards[move.boardIndex];
        if (!board || board.winner) {
            return false;
        }
        if (!this.completesLine(board.cells, move.cellIndex, "O")) {
            return false;
        }
        const futureWinners = snapshot.boards.map((mini, index) => {
            if (index === move.boardIndex) {
                return "O";
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
    static completesLine(cells, cellIndex, player) {
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
}
