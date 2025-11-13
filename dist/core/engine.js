import { WIN_PATTERNS, BOARD_COUNT, CELLS_PER_BOARD, } from "./constants.js";
export class GameEngine {
    constructor() {
        this.boards = [];
        this.currentPlayer = "X";
        this.activeBoardIndex = null;
        this.status = "playing";
        this.winner = null;
        this.moveCount = 0;
        this.history = [];
        this.lastMove = null;
        this.ruleSet = "classic";
        this.reset();
    }
    reset(startingPlayer = "X", ruleSet) {
        if (ruleSet) {
            this.ruleSet = ruleSet;
        }
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
            ruleSet: this.ruleSet,
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
                !this.isBoardClosed(this.activeBoardIndex)
                ? `board #${this.activeBoardIndex + 1} is the active board right now.`
                : `board #${boardIndex + 1} is closed—pick another.`;
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
        // Execute the move
        board.cells[cellIndex] = this.currentPlayer;
        this.moveCount += 1;
        const beforeWinner = board.winner;
        this.evaluateBoardState(boardIndex, this.currentPlayer);
        const afterWinner = board.winner;
        const ownershipChanged = afterWinner !== beforeWinner && afterWinner === this.currentPlayer;
        const capturedBoard = ownershipChanged;
        const recapturedBoard = capturedBoard && !!beforeWinner;
        const deadBoard = !capturedBoard && board.isDraw;
        this.updateMacroState();
        const forcedBoardIndex = cellIndex;
        const forcedBoardFull = this.isBoardClosed(forcedBoardIndex);
        this.activeBoardIndex = forcedBoardFull ? null : forcedBoardIndex;
        const moveInfo = {
            player: this.currentPlayer,
            boardIndex,
            cellIndex,
            forcedBoardFull,
            capturedBoard,
            recapturedBoard,
            deadBoard,
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
    isBoardClosed(index) {
        const board = this.boards[index];
        if (!board) {
            return true;
        }
        if (board.isFull) {
            return true;
        }
        if (this.ruleSet === "modern") {
            return !!board.winner || board.isDraw;
        }
        return false;
    }
    evaluateBoardState(boardIndex, priorityPlayer) {
        const board = this.boardAt(boardIndex);
        const boardNowFull = board.cells.every((cell) => cell !== null);
        const preferredPlayer = this.ruleSet === "battle" ? priorityPlayer : undefined;
        const winner = this.findWinner(board.cells, preferredPlayer);
        if (winner && (!board.winner || this.ruleSet === "battle")) {
            board.winner = winner;
        }
        board.isFull = boardNowFull;
        board.isDraw = !board.winner && board.isFull;
    }
    updateMacroState() {
        const macroWinner = this.findMacroWinner();
        if (macroWinner) {
            this.status = "won";
            this.winner = macroWinner;
            return;
        }
        const allClosed = this.boards.every((_, idx) => this.isBoardClosed(idx));
        if (allClosed) {
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
    findWinner(cells, priorityPlayer) {
        if (priorityPlayer) {
            if (this.hasLine(cells, priorityPlayer)) {
                return priorityPlayer;
            }
            const opponent = priorityPlayer === "X" ? "O" : "X";
            if (this.hasLine(cells, opponent)) {
                return opponent;
            }
            return null;
        }
        for (const [a, b, c] of WIN_PATTERNS) {
            const mark = cells[a];
            if (mark && mark === cells[b] && mark === cells[c]) {
                return mark;
            }
        }
        return null;
    }
    hasLine(cells, player) {
        return WIN_PATTERNS.some(([a, b, c]) => {
            return cells[a] === player && cells[b] === player && cells[c] === player;
        });
    }
    getAllowedBoards() {
        if (this.status !== "playing") {
            return [];
        }
        if (this.activeBoardIndex !== null) {
            if (!this.isBoardClosed(this.activeBoardIndex)) {
                return [this.activeBoardIndex];
            }
            this.activeBoardIndex = null;
        }
        const available = [];
        this.boards.forEach((_, index) => {
            if (!this.isBoardClosed(index)) {
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
