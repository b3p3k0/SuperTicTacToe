"use strict";

// === dist/core/constants.js ===
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
const THEME_STORAGE_KEY = "st3.theme";
const THEMES = {
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
            "--font-body": `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
            "--font-heading": `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.65) 0, transparent 45%), radial-gradient(circle at 80% 0%, rgba(173, 194, 255, 0.35) 0, transparent 35%)",
            "--panel-shadow": "0 25px 60px rgba(31, 36, 48, 0.08)",
            "--cell-hover-shadow": "0 10px 25px rgba(36, 99, 235, 0.25)",
            "--cell-hover-bg": "#ffffff",
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
            "--font-body": `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
            "--font-heading": `"Space Grotesk", "Segoe UI", system-ui, sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 40% 0%, rgba(61, 214, 140, 0.25) 0, transparent 55%), radial-gradient(circle at 85% 20%, rgba(29, 140, 248, 0.2) 0, transparent 45%)",
            "--panel-shadow": "0 25px 65px rgba(5, 9, 16, 0.65)",
            "--cell-hover-shadow": "0 10px 26px rgba(61, 214, 140, 0.3)",
            "--cell-hover-bg": "#0c1423",
        },
    },
    krayon: {
        label: "Krayon",
        tokens: {
            "--bg": "#fff257",
            "--surface": "#e8fff4",
            "--border": "#ff3b59",
            "--text": "#122055",
            "--muted": "#ff7c39",
            "--accent": "#ff2b53",
            "--accent-strong": "#ff0062",
            "--accent-shadow": "rgba(255, 43, 83, 0.45)",
            "--p1": "#0085ff",
            "--p2": "#00c853",
            "--capture-bg": "#c6f0ff",
            "--capture-bg-p2": "#d8ffcb",
            "--draw-bg": "#bfffe6",
            "--cell-bg": "#e6ffe8",
            "--last-move-glow": "rgba(0, 98, 255, 0.45)",
            "--active-board-border": "#05d66f",
            "--active-board-glow": "rgba(5, 214, 111, 0.55)",
            "--active-board-glow-strong": "rgba(5, 214, 111, 0.75)",
            "--macro-line": "rgba(0, 133, 255, 0.35)",
            "--overlay-scrim": "rgba(255, 116, 0, 0.75)",
            "--font-body": `"Fredoka", "Baloo 2", "Comic Sans MS", "Trebuchet MS", sans-serif`,
            "--font-heading": `"Fredoka", "Baloo 2", "Comic Sans MS", "Trebuchet MS", sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.7) 0, transparent 45%), radial-gradient(circle at 80% 0, rgba(0, 214, 169, 0.35) 0, transparent 40%), radial-gradient(circle at 50% 80%, rgba(0, 150, 255, 0.35) 0, transparent 35%)",
            "--panel-shadow": "0 25px 65px rgba(255, 163, 0, 0.35)",
            "--cell-hover-shadow": "0 14px 26px rgba(0, 149, 255, 0.35)",
            "--cell-hover-bg": "#d6ffe2",
        },
    },
    retro: {
        label: "Retro Term",
        tokens: {
            "--bg": "#030b04",
            "--surface": "#0f1f12",
            "--border": "#1f3b23",
            "--text": "#dfffd8",
            "--muted": "#7abb8d",
            "--accent": "#6bff8e",
            "--accent-strong": "#b8ff5a",
            "--accent-shadow": "rgba(107, 255, 142, 0.4)",
            "--p1": "#6bff8e",
            "--p2": "#ffca58",
            "--capture-bg": "#122b18",
            "--capture-bg-p2": "#2c230f",
            "--draw-bg": "#101b13",
            "--cell-bg": "#08140a",
            "--last-move-glow": "rgba(107, 255, 142, 0.4)",
            "--active-board-border": "#6bff8e",
            "--active-board-glow": "rgba(107, 255, 142, 0.35)",
            "--active-board-glow-strong": "rgba(107, 255, 142, 0.55)",
            "--macro-line": "rgba(255, 202, 88, 0.15)",
            "--overlay-scrim": "rgba(1, 5, 3, 0.9)",
            "--font-body": `"Source Code Pro", "Courier New", monospace`,
            "--font-heading": `"VT323", "Source Code Pro", monospace`,
            "--bg-pattern": "radial-gradient(circle at 50% -20%, rgba(107, 255, 142, 0.2) 0, transparent 50%)",
            "--panel-shadow": "0 25px 55px rgba(0, 0, 0, 0.65)",
            "--cell-hover-shadow": "0 0 25px rgba(107, 255, 142, 0.45)",
            "--cell-hover-bg": "rgba(10, 20, 12, 0.95)",
        },
    },
    sakura: {
        label: "Sakura Neon",
        tokens: {
            "--bg": "#ffe8f2",
            "--surface": "#fff9fb",
            "--border": "#f8c8dc",
            "--text": "#2b0d28",
            "--muted": "#a04c74",
            "--accent": "#ff4fa7",
            "--accent-strong": "#ff1e83",
            "--accent-shadow": "rgba(255, 79, 167, 0.45)",
            "--p1": "#ff7aa2",
            "--p2": "#1fb6ff",
            "--capture-bg": "#ffe0ec",
            "--capture-bg-p2": "#e4f4ff",
            "--draw-bg": "#ffddea",
            "--cell-bg": "#fff4f8",
            "--last-move-glow": "rgba(255, 79, 167, 0.35)",
            "--active-board-border": "#ff6fb7",
            "--active-board-glow": "rgba(255, 111, 183, 0.4)",
            "--active-board-glow-strong": "rgba(255, 111, 183, 0.55)",
            "--macro-line": "rgba(255, 111, 183, 0.4)",
            "--overlay-scrim": "rgba(32, 7, 24, 0.85)",
            "--font-body": `"Noto Sans JP", "Inter", system-ui, sans-serif`,
            "--font-heading": `"Zen Kurenaido", "Noto Sans JP", "Inter", sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.8) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255, 199, 219, 0.8) 0, transparent 45%)",
            "--panel-shadow": "0 25px 60px rgba(255, 111, 165, 0.25)",
            "--cell-hover-shadow": "0 12px 28px rgba(255, 79, 167, 0.35)",
            "--cell-hover-bg": "#ffeef5",
        },
    },
    sunset: {
        label: "Sunset Arcade",
        tokens: {
            "--bg": "#ffb347",
            "--surface": "#2a1032",
            "--border": "#ff8c5a",
            "--text": "#ffe5d6",
            "--muted": "#ffba99",
            "--accent": "#ff7b39",
            "--accent-strong": "#ff4b1f",
            "--accent-shadow": "rgba(255, 94, 98, 0.45)",
            "--p1": "#1dd3b0",
            "--p2": "#ffbc5b",
            "--capture-bg": "#36153d",
            "--capture-bg-p2": "#3d2313",
            "--draw-bg": "#3a1d3d",
            "--cell-bg": "#2f123a",
            "--last-move-glow": "rgba(255, 124, 64, 0.4)",
            "--active-board-border": "#ff7b39",
            "--active-board-glow": "rgba(255, 124, 64, 0.45)",
            "--active-board-glow-strong": "rgba(255, 124, 64, 0.6)",
            "--macro-line": "rgba(255, 188, 91, 0.25)",
            "--overlay-scrim": "rgba(15, 5, 22, 0.85)",
            "--font-body": `"Nunito", "Segoe UI", system-ui, sans-serif`,
            "--font-heading": `"Chakra Petch", "Nunito", "Segoe UI", sans-serif`,
            "--bg-pattern": "linear-gradient(135deg, #ffb347 0%, #ffcc33 35%, #ff5f6d 75%, #ffcc33 100%)",
            "--panel-shadow": "0 25px 60px rgba(255, 91, 109, 0.35)",
            "--cell-hover-shadow": "0 12px 28px rgba(255, 124, 64, 0.4)",
            "--cell-hover-bg": "#3d1a47",
        },
    },
    twotone: {
        label: "Two Tone",
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
            "--capture-bg": "#ededed",
            "--capture-bg-p2": "#b0b0b0",
            "--draw-bg": "#8c8c8c",
            "--cell-bg": "#ffffff",
            "--last-move-glow": "rgba(0, 0, 0, 0.5)",
            "--active-board-border": "#000000",
            "--active-board-glow": "rgba(0, 0, 0, 0.45)",
            "--active-board-glow-strong": "rgba(0, 0, 0, 0.6)",
            "--macro-line": "rgba(0, 0, 0, 0.9)",
            "--overlay-scrim": "rgba(0, 0, 0, 0.85)",
            "--font-body": `"Source Sans Pro", "Arial", sans-serif`,
            "--font-heading": `"Source Sans Pro", "Arial", sans-serif`,
            "--bg-pattern": "none",
            "--panel-shadow": "none",
            "--cell-hover-shadow": "none",
            "--cell-hover-bg": "#ffffff",
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
            "--font-body": `"Orbitron", "Segoe UI", system-ui, sans-serif`,
            "--font-heading": `"Orbitron", "Segoe UI", system-ui, sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 25% 25%, rgba(255, 78, 205, 0.35) 0, transparent 45%), radial-gradient(circle at 80% 0, rgba(98, 244, 255, 0.25) 0, transparent 40%)",
            "--panel-shadow": "0 25px 70px rgba(98, 255, 149, 0.25)",
            "--cell-hover-shadow": "0 0 25px rgba(255, 78, 205, 0.55)",
            "--cell-hover-bg": "#381453",
        },
    },
};


// === dist/core/engine.js ===

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


// === dist/ai/utils.js ===

class AiUtils {
    static collectCandidates(snapshot) {
        if (snapshot.status !== "playing") {
            return [];
        }
        const candidates = [];
        const boardIndexes = snapshot.allowedBoards.length > 0
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
    static findImmediateWin(snapshot, candidates, player) {
        const isBattle = snapshot.ruleSet === "battle";
        for (const move of candidates) {
            const board = snapshot.boards[move.boardIndex];
            const boardLocked = (board === null || board === void 0 ? void 0 : board.winner) && (!isBattle || board.isFull);
            if (!board || boardLocked) {
                continue;
            }
            if (this.completesLine(board.cells, move.cellIndex, player)) {
                return move;
            }
        }
        return null;
    }
    static patternOpportunityScore(cells, player, cellIndex) {
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
        const isBattle = snapshot.ruleSet === "battle";
        const boardLocked = (board === null || board === void 0 ? void 0 : board.winner) && (!isBattle || board.isFull);
        if (!board || boardLocked) {
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
    static boardPotential(cells, player) {
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
            }
            else if (marks === 2) {
                score += 1.5;
            }
            else if (marks === 1) {
                score += 0.4;
            }
            else {
                score += 0.1;
            }
        }
        return score;
    }
    static getOpponent(player) {
        return player === "X" ? "O" : "X";
    }
    static findWinner(cells, priorityPlayer) {
        if (priorityPlayer) {
            if (this.hasLine(cells, priorityPlayer)) {
                return priorityPlayer;
            }
            const opponent = this.getOpponent(priorityPlayer);
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
    static findMacroWinner(boards) {
        var _a, _b, _c;
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            const first = (_a = boards[a]) === null || _a === void 0 ? void 0 : _a.winner;
            if (first && first === ((_b = boards[b]) === null || _b === void 0 ? void 0 : _b.winner) && first === ((_c = boards[c]) === null || _c === void 0 ? void 0 : _c.winner)) {
                return first;
            }
        }
        return null;
    }
    static hasLine(cells, player) {
        return WIN_PATTERNS.some(([a, b, c]) => {
            return cells[a] === player && cells[b] === player && cells[c] === player;
        });
    }
}


// === dist/ai/simulator.js ===

class AiSimulator {
    static applyMove(snapshot, move, player) {
        var _a;
        const boards = snapshot.boards.map((board) => ({
            cells: [...board.cells],
            winner: board.winner,
            isDraw: board.isDraw,
            isFull: board.isFull,
        }));
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "modern";
        const board = boards[move.boardIndex];
        if (!board || board.cells[move.cellIndex] !== null) {
            return null;
        }
        const beforeWinner = board.winner;
        board.cells[move.cellIndex] = player;
        const preferredPlayer = ruleSet === "battle" ? player : undefined;
        const winner = AiUtils.findWinner(board.cells, preferredPlayer);
        if (winner && (!board.winner || ruleSet === "battle")) {
            board.winner = winner;
        }
        board.isFull = board.cells.every((cell) => cell !== null);
        board.isDraw = !board.winner && board.isFull;
        const isClosed = (mini) => {
            if (!mini) {
                return true;
            }
            if (mini.isFull) {
                return true;
            }
            if (ruleSet === "modern") {
                return !!mini.winner || mini.isDraw;
            }
            return false;
        };
        const afterWinner = board.winner;
        const ownershipChanged = afterWinner === player && beforeWinner !== afterWinner;
        const recaptured = ownershipChanged && !!beforeWinner;
        const deadBoard = !ownershipChanged && board.isDraw;
        const result = {
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
                capturedBoard: ownershipChanged,
                recapturedBoard: recaptured,
                deadBoard,
            },
            ruleSet,
        };
        const forcedIndex = move.cellIndex;
        const forcedBoard = boards[forcedIndex];
        const forcedFull = isClosed(forcedBoard);
        if (result.lastMove) {
            result.lastMove.forcedBoardFull = forcedFull;
        }
        if (!forcedFull && forcedBoard) {
            result.activeBoardIndex = forcedIndex;
            result.allowedBoards = [forcedIndex];
        }
        else {
            result.activeBoardIndex = null;
            result.allowedBoards = boards
                .map((mini, idx) => (!isClosed(mini) ? idx : -1))
                .filter((idx) => idx >= 0);
        }
        const macroWinner = AiUtils.findMacroWinner(boards);
        if (macroWinner) {
            result.status = "won";
            result.winner = macroWinner;
            result.allowedBoards = [];
            result.activeBoardIndex = null;
        }
        else if (boards.every((mini) => isClosed(mini))) {
            result.status = "draw";
            result.allowedBoards = [];
            result.activeBoardIndex = null;
        }
        return result;
    }
}


// === dist/ai/strategies/easy.js ===


class EasyAiStrategy {
    static choose(snapshot) {
        var _a;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        // Sometimes block opponent wins (45% chance)
        if (Math.random() < 0.45) {
            const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
            if (blockingMove) {
                return blockingMove;
            }
        }
        // Otherwise pick based on priority + randomness
        const scored = candidates.map((move) => {
            var _a, _b;
            const priority = ((_a = CELL_PRIORITY[move.cellIndex]) !== null && _a !== void 0 ? _a : 0) +
                ((_b = BOARD_PRIORITY[move.boardIndex]) !== null && _b !== void 0 ? _b : 0);
            return {
                move,
                score: priority + Math.random() * 4 - 2,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        return ((_a = scored[0]) === null || _a === void 0 ? void 0 : _a.move) || null;
    }
}


// === dist/ai/strategies/normal.js ===


class NormalAiStrategy {
    static choose(snapshot) {
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        // Always block opponent wins
        const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
        if (blockingMove) {
            return blockingMove;
        }
        // Use scoring heuristics for other moves
        return this.scoreAndPick(snapshot, candidates);
    }
    static scoreAndPick(snapshot, candidates) {
        if (candidates.length === 0) {
            throw new Error("No candidates available");
        }
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
        const isBattle = snapshot.ruleSet === "battle";
        const contestedBoard = Boolean(board.winner && isBattle && !board.isFull);
        // Base priority scores
        score += (_a = BOARD_PRIORITY[move.boardIndex]) !== null && _a !== void 0 ? _a : 0;
        score += (_b = CELL_PRIORITY[move.cellIndex]) !== null && _b !== void 0 ? _b : 0;
        // Board-level scoring
        if (!board.winner || contestedBoard) {
            score += AiUtils.patternOpportunityScore(board.cells, "O", move.cellIndex);
            score += AiUtils.patternBlockScore(board.cells, "X", move.cellIndex);
        }
        else if (board.winner === "X") {
            score -= isBattle ? 0.75 : 2;
        }
        else if (board.winner === "O") {
            score -= isBattle ? 0.25 : 0.5;
        }
        // Target board evaluation
        const targetBoardIndex = move.cellIndex;
        const targetBoard = snapshot.boards[targetBoardIndex];
        if (targetBoard) {
            if (targetBoard.isFull) {
                score += 2; // Sending opponent to full board is good
            }
            else if (targetBoard.winner === "O") {
                score += isBattle ? 0.75 : 1.5; // Still decent in battle, but riskier
            }
            else if (targetBoard.winner === "X") {
                score -= isBattle ? 0.75 : 1.5; // Smaller penalty in battle—they're vulnerable too
            }
            else {
                score += AiUtils.evaluateBoardComfort(targetBoard);
            }
        }
        else {
            score += 0.5;
        }
        // Macro-level threat creation
        if (AiUtils.createsMacroThreat(snapshot, move)) {
            score += 2.5;
        }
        // Add tiny random factor for tie-breaking
        return score + Math.random() * 0.001;
    }
}


// === dist/ai/strategies/hard.js ===



class HardAiStrategy {
    static choose(snapshot) {
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        const depthLimit = candidates.length <= this.HIGH_BRANCH_THRESHOLD
            ? this.EXTENDED_DEPTH
            : this.BASE_DEPTH;
        let bestMove = null;
        let bestScore = -Infinity;
        const ordered = this.orderCandidates(snapshot, candidates, "O");
        for (const { move } of ordered) {
            const next = AiSimulator.applyMove(snapshot, move, "O");
            if (!next) {
                continue;
            }
            const score = this.minimax(next, 1, depthLimit, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove || null;
    }
    static minimax(state, depth, maxDepth, alpha, beta) {
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
        const ordered = this.orderCandidates(state, candidates, state.currentPlayer);
        for (const { move } of ordered) {
            const next = AiSimulator.applyMove(state, move, state.currentPlayer);
            if (!next) {
                continue;
            }
            const value = this.minimax(next, depth + 1, maxDepth, alpha, beta);
            if (maximizing) {
                if (value > bestScore) {
                    bestScore = value;
                }
                alpha = Math.max(alpha, value);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
            else {
                if (value < bestScore) {
                    bestScore = value;
                }
                beta = Math.min(beta, value);
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }
        }
        return bestScore;
    }
    static evaluateTerminal(state, depth) {
        if (state.status === "won" && state.winner) {
            return state.winner === "O" ? 100 - depth * 2 : depth * 2 - 100;
        }
        if (state.status === "draw") {
            return 0;
        }
        return null;
    }
    static evaluateState(state) {
        let score = 0;
        // Evaluate individual boards
        state.boards.forEach((board) => {
            if (board.winner === "O") {
                score += 9;
            }
            else if (board.winner === "X") {
                score -= 9;
            }
            else {
                score += AiUtils.boardPotential(board.cells, "O") * 1.1;
                score -= AiUtils.boardPotential(board.cells, "X") * 0.9;
            }
        });
        // Macro-level evaluation
        score += this.evaluateMacro(state.boards) * 6;
        // Directed target evaluation
        score += this.evaluateDirectedTargets(state) * 3;
        return score;
    }
    static evaluateMacro(boards) {
        let score = 0;
        for (const pattern of WIN_PATTERNS) {
            const winners = pattern.map((idx) => { var _a, _b; return (_b = (_a = boards[idx]) === null || _a === void 0 ? void 0 : _a.winner) !== null && _b !== void 0 ? _b : null; });
            const aiWins = winners.filter((mark) => mark === "O").length;
            const humanWins = winners.filter((mark) => mark === "X").length;
            if (humanWins === 0) {
                score += aiWins;
            }
            else if (aiWins === 0) {
                score -= humanWins;
            }
        }
        return score;
    }
    static evaluateDirectedTargets(state) {
        if (!state.lastMove) {
            return 0;
        }
        const targetIndex = state.activeBoardIndex;
        if (targetIndex === null) {
            return 0;
        }
        const targetBoard = state.boards[targetIndex];
        if (!targetBoard) {
            return 0;
        }
        const aiPotential = AiUtils.boardPotential(targetBoard.cells, "O");
        const humanPotential = AiUtils.boardPotential(targetBoard.cells, "X");
        return (aiPotential - humanPotential) * 0.6;
    }
    static orderCandidates(snapshot, moves, player) {
        return moves
            .map((move) => {
            var _a, _b;
            const board = snapshot.boards[move.boardIndex];
            const cellScore = ((_a = CELL_PRIORITY[move.cellIndex]) !== null && _a !== void 0 ? _a : 0) +
                ((_b = BOARD_PRIORITY[move.boardIndex]) !== null && _b !== void 0 ? _b : 0);
            const potential = board
                ? AiUtils.patternOpportunityScore(board.cells, player, move.cellIndex)
                : 0;
            const block = board
                ? AiUtils.patternBlockScore(board.cells, player === "O" ? "X" : "O", move.cellIndex)
                : 0;
            const heuristic = cellScore + potential * 1.5 + block;
            return { move, score: heuristic };
        })
            .sort((a, b) => b.score - a.score);
    }
}
HardAiStrategy.BASE_DEPTH = 3;
HardAiStrategy.EXTENDED_DEPTH = 4;
HardAiStrategy.HIGH_BRANCH_THRESHOLD = 18;


// === dist/ai/controller.js ===



class AiController {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
    chooseMove(snapshot) {
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


// === dist/ui/theme-manager.js ===

class ThemeManager {
    constructor(select) {
        var _a;
        this.current = "default";
        this.select = select;
        this.populateOptions();
        const initialTheme = this.getStoredTheme();
        this.applyTheme(initialTheme, false);
        (_a = this.select) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => {
            var _a, _b;
            const value = ((_b = (_a = this.select) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "default");
            this.applyTheme(value, true);
        });
    }
    populateOptions() {
        if (!this.select) {
            return;
        }
        const existingValues = new Set();
        Array.from(this.select.options).forEach((option) => {
            existingValues.add(option.value);
            const theme = THEMES[option.value];
            if (theme) {
                option.textContent = theme.label;
            }
        });
        Object.entries(THEMES).forEach(([key, theme]) => {
            if (!existingValues.has(key)) {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = theme.label;
                this.select.append(option);
            }
        });
    }
    getStoredTheme() {
        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (stored && stored in THEMES) {
                return stored;
            }
        }
        catch (error) {
            console.warn("Unable to read saved theme:", error);
        }
        return "default";
    }
    applyTheme(name, persist = true) {
        const themeName = (name in THEMES ? name : "default");
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
            }
            catch (error) {
                console.warn("Unable to save theme preference:", error);
            }
        }
    }
    getCurrentTheme() {
        return this.current;
    }
}


// === dist/ui/components/panels.js ===

class PanelManager {
    constructor() {
        this.illegalDialog = null;
        this.illegalMessage = null;
        const historyList = document.getElementById("history-list");
        if (!historyList) {
            throw new Error("Missing history list element.");
        }
        this.historyList = historyList;
        this.illegalDialog = document.getElementById("illegal-move-dialog");
        this.illegalMessage = document.getElementById("illegal-move-message");
        this.initPanelToggles();
        this.initIllegalDialog();
    }
    initPanelToggles() {
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
    }
    initIllegalDialog() {
        var _a;
        const dialogClose = document.getElementById("illegal-move-close");
        dialogClose === null || dialogClose === void 0 ? void 0 : dialogClose.addEventListener("click", () => this.closeIllegalDialog());
        (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.addEventListener("close", () => {
            var _a;
            (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.classList.remove("open");
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
        const tags = [];
        if (move.forcedBoardFull) {
            tags.push("F");
        }
        if (move.capturedBoard) {
            tags.push("C");
            if (move.recapturedBoard) {
                tags.push("R");
            }
        }
        else if (move.deadBoard) {
            tags.push("D");
        }
        const suffix = tags.length ? `(${tags.join("")})` : "";
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
        // Fallback to alert
        window.alert(message);
    }
    closeIllegalDialog() {
        var _a;
        if ((_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.open) {
            this.illegalDialog.close();
        }
    }
}


// === dist/ui/components/board.js ===

class BoardRenderer {
    constructor(boardContainer) {
        this.miniBoards = [];
        this.cellButtons = [];
        console.log("🎯 BoardRenderer constructor starting...");
        console.log("🔍 Board container:", boardContainer);
        this.boardContainer = boardContainer;
        this.buildBoards();
        console.log("✅ BoardRenderer constructor complete");
    }
    setCellClickHandler(handler) {
        console.log("🎯 Setting cell click handler...");
        this.onCellClick = handler;
    }
    setBoardLocked(locked) {
        this.boardContainer.classList.toggle("board-locked", locked);
    }
    buildBoards() {
        console.log("🏗️ Building game boards...");
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
                cellButton.addEventListener("click", () => {
                    var _a;
                    console.log("🖱️ CELL EVENT FIRED:", { boardIndex, cellIndex, hasHandler: !!this.onCellClick });
                    (_a = this.onCellClick) === null || _a === void 0 ? void 0 : _a.call(this, boardIndex, cellIndex);
                });
                miniBoard.appendChild(cellButton);
                buttons.push(cellButton);
            }
            this.boardContainer.appendChild(miniBoard);
            this.miniBoards.push(miniBoard);
            this.cellButtons.push(buttons);
        }
    }
    updateBoards(snapshot, humanInputLocked) {
        console.log("🎯 BOARD UPDATE START");
        console.log("🎯 BOARD - humanInputLocked:", humanInputLocked);
        console.log("🎯 BOARD - snapshot.allowedBoards:", snapshot.allowedBoards);
        console.log("🎯 BOARD - snapshot.status:", snapshot.status);
        const allowedSet = new Set(snapshot.allowedBoards);
        console.log("🎯 BOARD - Setting board-locked class:", humanInputLocked);
        this.setBoardLocked(humanInputLocked);
        this.miniBoards.forEach((boardEl, index) => {
            const state = snapshot.boards[index];
            if (!state) {
                return;
            }
            // Update board classes
            boardEl.classList.toggle("active-board", snapshot.activeBoardIndex === index && allowedSet.has(index));
            boardEl.classList.toggle("free-choice", snapshot.activeBoardIndex === null && allowedSet.has(index));
            boardEl.classList.toggle("captured-p1", state.winner === "X");
            boardEl.classList.toggle("captured-p2", state.winner === "O");
            boardEl.classList.toggle("drawn", state.isDraw && !state.winner);
            boardEl.classList.toggle("disabled", snapshot.status !== "playing" || (!allowedSet.has(index) && state.isFull));
            // Update cell buttons
            const cells = this.cellButtons[index];
            if (!cells) {
                console.warn("🎯 BOARD - No cell buttons found for board", index);
                return;
            }
            let enabledCells = 0;
            let disabledCells = 0;
            cells.forEach((button, cellIdx) => {
                const value = state.cells[cellIdx];
                button.textContent = value !== null && value !== void 0 ? value : "";
                button.classList.toggle("p1", value === "X");
                button.classList.toggle("p2", value === "O");
                const shouldDisable = value !== null ||
                    snapshot.status !== "playing" ||
                    !allowedSet.has(index);
                button.disabled = shouldDisable;
                if (shouldDisable) {
                    disabledCells++;
                }
                else {
                    enabledCells++;
                }
                const isLastMove = !!snapshot.lastMove &&
                    snapshot.lastMove.boardIndex === index &&
                    snapshot.lastMove.cellIndex === cellIdx;
                button.classList.toggle("last-move", isLastMove);
                // Check if this cell should be clickable for human
                if (!shouldDisable && !humanInputLocked) {
                    // Log a sample cell that should be clickable
                    if (cellIdx === 0) {
                        console.log("🎯 BOARD - Sample clickable cell:", {
                            board: index,
                            cell: cellIdx,
                            hasEventHandler: !!this.onCellClick,
                            buttonDisabled: button.disabled,
                            humanInputLocked
                        });
                    }
                }
            });
            console.log(`🎯 BOARD - Board ${index}: enabled=${enabledCells}, disabled=${disabledCells}`);
        });
        console.log("🎯 BOARD - Event handler available:", !!this.onCellClick);
        console.log("🎯 BOARD UPDATE COMPLETE");
    }
}


// === dist/ui/components/overlays.js ===
class OverlayManager {
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
        this.ruleSet = "classic";
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


// === dist/ui/game-ui.js ===





class GameUI {
    constructor(engine) {
        // Game state
        this.mode = "local";
        this.aiProfile = null;
        this.aiController = null;
        this.humanInputLocked = true;
        this.awaitingAiMove = false;
        this.aiMoveTimer = null;
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
            this.panelManager.showIllegalMove(reason);
            return;
        }
        console.log("🖱️ CELL CLICK SUCCESS - calling render");
        this.render();
    }
    beginGame(mode, difficulty) {
        this.mode = mode;
        this.cancelPendingAiMove();
        let startingPlayer = "X";
        if (mode === "solo") {
            const selected = difficulty !== null && difficulty !== void 0 ? difficulty : "normal";
            this.aiProfile = { difficulty: selected };
            this.aiController = new AiController(selected);
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
        this.updateStatus(snapshot);
        this.boardRenderer.updateBoards(snapshot, this.humanInputLocked);
        this.panelManager.updateHistory(snapshot.history);
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
}


// === dist/main.js ===



document.addEventListener("DOMContentLoaded", () => {
    console.log("🎮 ST3 Initializing...");
    // Initialize theme manager
    const themeSelect = document.getElementById("theme-select");
    console.log("🎨 Theme select element:", themeSelect);
    new ThemeManager(themeSelect);
    // Initialize game engine and UI
    console.log("⚙️ Creating game engine...");
    const engine = new GameEngine();
    console.log("🖥️ Creating game UI...");
    const ui = new GameUI(engine);
    console.log("🚀 Calling UI.init()...");
    ui.init();
    console.log("✅ ST3 Initialization complete");
});


