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
    expert: "Expert",
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
    wopr: {
        label: "WOPR",
        tokens: {
            "--bg": "#cbc6a9",
            "--surface": "#e6d8b5",
            "--border": "#8b7355",
            "--text": "#2f2f2f",
            "--muted": "#5a5a5a",
            "--accent": "#ff4500",
            "--accent-strong": "#cc3300",
            "--accent-shadow": "rgba(255, 69, 0, 0.4)",
            "--p1": "#41ff00",
            "--p2": "#00ff88",
            "--capture-bg": "#001100",
            "--capture-bg-p2": "#001100",
            "--draw-bg": "#002200",
            "--cell-bg": "#000000",
            "--last-move-glow": "rgba(65, 255, 0, 0.6)",
            "--active-board-border": "#41ff00",
            "--active-board-glow": "rgba(65, 255, 0, 0.4)",
            "--active-board-glow-strong": "rgba(65, 255, 0, 0.6)",
            "--macro-line": "rgba(65, 255, 0, 0.3)",
            "--overlay-scrim": "rgba(0, 0, 0, 0.85)",
            "--font-body": `"VT323", "IBM Plex Mono", "Courier New", monospace`,
            "--font-heading": `"VT323", "IBM Plex Mono", "Courier New", monospace`,
            "--bg-pattern": "repeating-linear-gradient(90deg, rgba(139, 115, 85, 0.03) 0px, rgba(139, 115, 85, 0.03) 1px, transparent 1px, transparent 3px)",
            "--panel-shadow": "inset 0 2px 4px rgba(139, 115, 85, 0.2), 0 1px 3px rgba(139, 115, 85, 0.3)",
            "--cell-hover-shadow": "0 0 8px rgba(65, 255, 0, 0.5)",
            "--cell-hover-bg": "#001a00",
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
    redmond: {
        label: "Redmond",
        tokens: {
            "--bg": "#018281",
            "--surface": "#c0c0c0",
            "--border": "#808080",
            "--text": "#000000",
            "--muted": "#000000",
            "--accent": "#0000ff",
            "--accent-strong": "#000080",
            "--accent-shadow": "rgba(0, 0, 255, 0.4)",
            "--p1": "#000080",
            "--p2": "#800080",
            "--capture-bg": "#d4d0c8",
            "--capture-bg-p2": "#d4d0c8",
            "--draw-bg": "#b8b8b8",
            "--cell-bg": "#c0c0c0",
            "--last-move-glow": "rgba(0, 0, 128, 0.6)",
            "--active-board-border": "#0000ff",
            "--active-board-glow": "rgba(0, 0, 255, 0.4)",
            "--active-board-glow-strong": "rgba(0, 0, 255, 0.6)",
            "--macro-line": "rgba(0, 0, 0, 0.6)",
            "--overlay-scrim": "rgba(128, 128, 128, 0.85)",
            "--font-body": `"MS Sans Serif", "Trebuchet MS", Arial, sans-serif`,
            "--font-heading": `"MS Sans Serif", "Trebuchet MS", Arial, sans-serif`,
            "--bg-pattern": "none",
            "--panel-shadow": "2px 2px 0px #808080, 4px 4px 0px #404040",
            "--cell-hover-shadow": "inset -1px -1px 0px #808080, inset 1px 1px 0px #ffffff",
            "--cell-hover-bg": "#e0e0e0",
        },
    },
    cupertino: {
        label: "Cupertino",
        tokens: {
            "--bg": "#ddd9d5",
            "--surface": "#e8e5e1",
            "--border": "#8e8e8e",
            "--text": "#000000",
            "--muted": "#5a5a5a",
            "--accent": "#0066cc",
            "--accent-strong": "#003d7a",
            "--accent-shadow": "rgba(0, 102, 204, 0.3)",
            "--p1": "#000000",
            "--p2": "#333333",
            "--capture-bg": "#d0cdc9",
            "--capture-bg-p2": "#ccc9c5",
            "--draw-bg": "#c6c3bf",
            "--cell-bg": "#f0ede9",
            "--last-move-glow": "rgba(0, 0, 0, 0.25)",
            "--active-board-border": "#0066cc",
            "--active-board-glow": "rgba(0, 102, 204, 0.15)",
            "--active-board-glow-strong": "rgba(0, 102, 204, 0.25)",
            "--macro-line": "rgba(0, 0, 0, 0.3)",
            "--overlay-scrim": "rgba(90, 90, 90, 0.85)",
            "--font-body": `"Charcoal", "Chicago", "Geneva", "Lucida Grande", sans-serif`,
            "--font-heading": `"Charcoal", "Chicago", "Geneva", "Lucida Grande", sans-serif`,
            "--bg-pattern": "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 0px, transparent 1px)",
            "--panel-shadow": "0 1px 2px rgba(0, 0, 0, 0.15)",
            "--cell-hover-shadow": "inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px rgba(0, 102, 204, 0.3)",
            "--cell-hover-bg": "#faf7f3",
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
        this.ruleSet = "battle";
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
    static countBoardThreats(board, player) {
        if (board.winner || board.isFull) {
            return 0;
        }
        return this.countLineThreats(board.cells, player);
    }
    static countBoardForks(board, player) {
        if (board.winner || board.isFull) {
            return 0;
        }
        let forkCount = 0;
        board.cells.forEach((value, cellIndex) => {
            if (value !== null) {
                return;
            }
            const threatLines = WIN_PATTERNS.filter((pattern) => {
                if (!pattern.includes(cellIndex)) {
                    return false;
                }
                let playerMarks = 0;
                let opponentMarks = 0;
                for (const idx of pattern) {
                    const mark = board.cells[idx];
                    if (mark === player) {
                        playerMarks += 1;
                    }
                    else if (mark && mark !== player) {
                        opponentMarks += 1;
                        break;
                    }
                }
                return opponentMarks === 0 && playerMarks === 1;
            }).length;
            if (threatLines >= 2) {
                forkCount += 1;
            }
        });
        return forkCount;
    }
    static countMetaThreats(boards, player) {
        return WIN_PATTERNS.reduce((total, pattern) => {
            var _a, _b;
            let playerOwned = 0;
            let opponentOwned = 0;
            let openBoards = 0;
            for (const idx of pattern) {
                const winner = (_b = (_a = boards[idx]) === null || _a === void 0 ? void 0 : _a.winner) !== null && _b !== void 0 ? _b : null;
                if (winner === player) {
                    playerOwned += 1;
                }
                else if (winner && winner !== player) {
                    opponentOwned += 1;
                    break;
                }
                else {
                    const board = boards[idx];
                    if (board && !board.isFull) {
                        openBoards += 1;
                    }
                }
            }
            if (opponentOwned > 0) {
                return total;
            }
            if (playerOwned === 2 && openBoards > 0) {
                return total + 1;
            }
            return total;
        }, 0);
    }
    static countCenterControl(board, player) {
        if (board.cells[4] === player) {
            return 1;
        }
        if (board.cells[4] === this.getOpponent(player)) {
            return -1;
        }
        return 0;
    }
    static estimateBattleStability(board, owner) {
        if (board.winner !== owner) {
            return 0;
        }
        if (board.isFull) {
            return 2;
        }
        const opponent = this.getOpponent(owner);
        const stealThreats = this.countLineThreats(board.cells, opponent);
        if (stealThreats === 0) {
            return 1.5;
        }
        if (stealThreats === 1) {
            return 0.5;
        }
        return -0.5 * stealThreats;
    }
    static countLineThreats(cells, player) {
        const opponent = this.getOpponent(player);
        let total = 0;
        for (const pattern of WIN_PATTERNS) {
            let playerMarks = 0;
            let opponentMarks = 0;
            let empties = 0;
            for (const idx of pattern) {
                const mark = cells[idx];
                if (mark === player) {
                    playerMarks += 1;
                }
                else if (mark === opponent) {
                    opponentMarks += 1;
                    break;
                }
                else {
                    empties += 1;
                }
            }
            if (opponentMarks === 0 && playerMarks === 2 && empties === 1) {
                total += 1;
            }
        }
        return total;
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


// === dist/ai/evaluator.js ===

const BASE_WEIGHTS = {
    battle: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 140,
        boardThreat: 18,
        boardFork: 26,
        boardCenter: 8,
        metaThreat: 120,
        activeBoardFocus: 24,
        battleStability: 30,
    },
    classic: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 150,
        boardThreat: 16,
        boardFork: 22,
        boardCenter: 8,
        metaThreat: 110,
        activeBoardFocus: 28,
        battleStability: 0,
    },
    modern: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 165,
        boardThreat: 14,
        boardFork: 18,
        boardCenter: 6,
        metaThreat: 130,
        activeBoardFocus: 26,
        battleStability: 0,
    },
};
class AiEvaluator {
    static evaluate(snapshot, player, overrides) {
        return this.computeScore(snapshot, player, overrides).score;
    }
    static evaluateDetailed(snapshot, player, overrides) {
        return this.computeScore(snapshot, player, overrides);
    }
    static computeScore(snapshot, player, overrides) {
        var _a;
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        const weights = { ...BASE_WEIGHTS[ruleSet], ...overrides };
        const opponent = AiUtils.getOpponent(player);
        const breakdown = {
            terminal: 0,
            ownership: 0,
            threats: 0,
            meta: 0,
            routing: 0,
            battle: 0,
            total: 0,
        };
        if (snapshot.status === "won") {
            breakdown.terminal = snapshot.winner === player
                ? weights.terminalWin
                : weights.terminalLoss;
            breakdown.total = breakdown.terminal;
            return { score: breakdown.total, breakdown };
        }
        if (snapshot.status === "draw") {
            return { score: 0, breakdown };
        }
        breakdown.ownership = this.evaluateBoardOwnership(snapshot, player, opponent, weights);
        breakdown.threats = this.evaluateBoardThreats(snapshot, player, opponent, weights);
        breakdown.meta = this.evaluateMetaThreats(snapshot, player, opponent, weights);
        breakdown.routing = this.evaluateActiveBoard(snapshot, player, opponent, weights);
        breakdown.battle = ruleSet === "battle"
            ? this.evaluateBattleStability(snapshot, player, opponent, weights)
            : 0;
        breakdown.total =
            breakdown.terminal +
                breakdown.ownership +
                breakdown.threats +
                breakdown.meta +
                breakdown.routing +
                breakdown.battle;
        return { score: breakdown.total, breakdown };
    }
    static evaluateBoardOwnership(snapshot, player, opponent, weights) {
        const owned = snapshot.boards.filter((board) => board.winner === player).length;
        const oppOwned = snapshot.boards.filter((board) => board.winner === opponent).length;
        return (owned - oppOwned) * weights.boardCaptured;
    }
    static evaluateBoardThreats(snapshot, player, opponent, weights) {
        let playerThreats = 0;
        let opponentThreats = 0;
        let playerForks = 0;
        let opponentForks = 0;
        let centerControl = 0;
        snapshot.boards.forEach((board) => {
            playerThreats += AiUtils.countBoardThreats(board, player);
            opponentThreats += AiUtils.countBoardThreats(board, opponent);
            playerForks += AiUtils.countBoardForks(board, player);
            opponentForks += AiUtils.countBoardForks(board, opponent);
            centerControl += AiUtils.countCenterControl(board, player);
        });
        const threatScore = (playerThreats - opponentThreats) * weights.boardThreat;
        const forkScore = (playerForks - opponentForks) * weights.boardFork;
        const centerScore = centerControl * weights.boardCenter;
        return threatScore + forkScore + centerScore;
    }
    static evaluateMetaThreats(snapshot, player, opponent, weights) {
        const playerMeta = AiUtils.countMetaThreats(snapshot.boards, player);
        const opponentMeta = AiUtils.countMetaThreats(snapshot.boards, opponent);
        return (playerMeta - opponentMeta) * weights.metaThreat;
    }
    static evaluateActiveBoard(snapshot, player, opponent, weights) {
        const targetIndex = snapshot.activeBoardIndex;
        if (targetIndex === null) {
            return 0;
        }
        const board = snapshot.boards[targetIndex];
        if (!board) {
            return 0;
        }
        const playerPotential = AiUtils.boardPotential(board.cells, player);
        const opponentPotential = AiUtils.boardPotential(board.cells, opponent);
        return (playerPotential - opponentPotential) * weights.activeBoardFocus;
    }
    static evaluateBattleStability(snapshot, player, opponent, weights) {
        let playerStability = 0;
        let opponentStability = 0;
        snapshot.boards.forEach((board) => {
            playerStability += AiUtils.estimateBattleStability(board, player);
            opponentStability += AiUtils.estimateBattleStability(board, opponent);
        });
        return (playerStability - opponentStability) * weights.battleStability;
    }
}


// === dist/ai/rule-heuristics.js ===

class RuleAwareHeuristics {
    static moveBonus(snapshot, move, player) {
        var _a;
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        switch (ruleSet) {
            case "battle":
                return this.battleMoveBonus({ snapshot, move, player });
            case "classic":
                return this.classicMoveBonus({ snapshot, move, player });
            case "modern":
                return this.modernMoveBonus({ snapshot, move, player });
            default:
                return 0;
        }
    }
    static stateBonus(snapshot, player) {
        var _a;
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        switch (ruleSet) {
            case "battle":
                return this.battleStateBonus(snapshot, player);
            case "classic":
                return this.classicStateBonus(snapshot, player);
            case "modern":
                return this.modernStateBonus(snapshot, player);
            default:
                return 0;
        }
    }
    static battleMoveBonus({ snapshot, move, player }) {
        const opponent = AiUtils.getOpponent(player);
        let score = 0;
        const board = snapshot.boards[move.boardIndex];
        if (board && !board.isFull && board.winner) {
            if (board.winner === opponent) {
                if (AiUtils.completesLine(board.cells, move.cellIndex, player)) {
                    score += 4.5; // Immediate recapture
                }
                else {
                    score += AiUtils.patternOpportunityScore(board.cells, player, move.cellIndex) * 0.6;
                }
            }
            else if (board.winner === player) {
                // Reinforce a contested board we already own
                score += AiUtils.patternBlockScore(board.cells, opponent, move.cellIndex) * 0.8;
            }
        }
        const targetBoardIndex = move.cellIndex;
        const targetBoard = snapshot.boards[targetBoardIndex];
        if (targetBoard && !targetBoard.isFull && targetBoard.winner) {
            const aiPotential = AiUtils.boardPotential(targetBoard.cells, player);
            const opponentPotential = AiUtils.boardPotential(targetBoard.cells, opponent);
            const margin = aiPotential - opponentPotential;
            if (targetBoard.winner === player) {
                score += Math.max(margin, 0) * 0.45; // Bait opponent into a board we still dominate
            }
            else if (targetBoard.winner === opponent) {
                score -= Math.max(-margin, 0) * 0.5; // Avoid steering into their stronghold
            }
        }
        return score;
    }
    static classicMoveBonus({ snapshot, move, player }) {
        const opponent = AiUtils.getOpponent(player);
        let score = 0;
        const board = snapshot.boards[move.boardIndex];
        if (board && !board.winner) {
            // Completing a capture in Classic permanently claims the board
            if (AiUtils.completesLine(board.cells, move.cellIndex, player)) {
                score += 2.25;
            }
        }
        const targetBoard = snapshot.boards[move.cellIndex];
        if (targetBoard) {
            if (targetBoard.winner === player && !targetBoard.isFull) {
                score += 1.4; // Force opponent to waste moves in a locked victory
            }
            else if (targetBoard.winner === opponent && !targetBoard.isFull) {
                score -= 1.2;
            }
            else if (!targetBoard.winner && targetBoard.isFull) {
                score += 0.6; // Directing into an exhausted board frees our next choice
            }
        }
        return score;
    }
    static modernMoveBonus({ snapshot, move, player }) {
        const opponent = AiUtils.getOpponent(player);
        let score = 0;
        const board = snapshot.boards[move.boardIndex];
        if (board && !board.winner) {
            if (AiUtils.completesLine(board.cells, move.cellIndex, player)) {
                score += 3; // Captures immediately lock the board
            }
        }
        const targetBoard = snapshot.boards[move.cellIndex];
        if (targetBoard) {
            if (targetBoard.isFull || targetBoard.isDraw || targetBoard.winner) {
                score += 0.9; // Sending opponent into a closed board grants us flexibility
            }
            else {
                const aiPotential = AiUtils.boardPotential(targetBoard.cells, player);
                const opponentPotential = AiUtils.boardPotential(targetBoard.cells, opponent);
                score += (aiPotential - opponentPotential) * 0.2;
            }
        }
        return score;
    }
    static battleStateBonus(snapshot, player) {
        const opponent = AiUtils.getOpponent(player);
        let score = 0;
        snapshot.boards.forEach((board) => {
            if (!board || !board.winner || board.isFull) {
                return;
            }
            if (board.winner === player) {
                const margin = AiUtils.boardPotential(board.cells, player) -
                    AiUtils.boardPotential(board.cells, opponent);
                score += 3 + Math.max(margin, 0) * 0.35;
            }
            else if (board.winner === opponent) {
                score -= 3;
            }
        });
        return score;
    }
    static classicStateBonus(snapshot, player) {
        const opponent = AiUtils.getOpponent(player);
        let score = 0;
        snapshot.boards.forEach((board) => {
            if (!board || !board.winner) {
                return;
            }
            if (board.winner === player) {
                score += board.isFull ? 9 : 7;
            }
            else if (board.winner === opponent) {
                score -= board.isFull ? 9 : 7;
            }
        });
        return score;
    }
    static modernStateBonus(snapshot, player) {
        let openBoards = 0;
        let score = 0;
        snapshot.boards.forEach((board) => {
            if (!board) {
                return;
            }
            const closed = board.isFull || board.isDraw || !!board.winner;
            if (!closed) {
                openBoards += 1;
            }
            if (board.winner === player) {
                score += 10;
            }
            else if (board.winner === AiUtils.getOpponent(player)) {
                score -= 10;
            }
        });
        const totalBoards = snapshot.boards.length || 1;
        const flexibility = 1 - openBoards / totalBoards;
        score += flexibility * 4; // Fewer open boards favors whoever is ahead
        return score;
    }
}


// === dist/ai/diagnostics.js ===
class AiDiagnostics {
    static isEnabled() {
        if (typeof window === "undefined" || !window.localStorage) {
            return false;
        }
        try {
            const flag = window.localStorage.getItem(this.FLAG_KEY);
            return flag === "1" || flag === "true";
        }
        catch (_a) {
            return false;
        }
    }
    static logDecision(payload) {
        var _a, _b, _c, _d;
        if (!this.isEnabled()) {
            return;
        }
        const groupLabel = `[AI][${payload.ruleSet}] ${payload.difficulty.toUpperCase()}`;
        const logger = console;
        if (!logger) {
            return;
        }
        const candidates = (_b = (_a = payload.candidates) === null || _a === void 0 ? void 0 : _a.slice(0, 5)) !== null && _b !== void 0 ? _b : [];
        (_c = logger.groupCollapsed) === null || _c === void 0 ? void 0 : _c.call(logger, groupLabel);
        logger.log("Chosen move:", payload.bestMove);
        if (payload.depth !== undefined) {
            logger.log("Depth limit:", payload.depth);
        }
        if (payload.metadata) {
            logger.log("Extra metadata:", payload.metadata);
        }
        if (payload.breakdown) {
            const b = payload.breakdown;
            logger.log("Evaluator breakdown:", {
                terminal: b.terminal.toFixed(2),
                ownership: b.ownership.toFixed(2),
                threats: b.threats.toFixed(2),
                meta: b.meta.toFixed(2),
                routing: b.routing.toFixed(2),
                battle: b.battle.toFixed(2),
                total: b.total.toFixed(2),
            });
        }
        if (candidates.length > 0 && logger.table) {
            logger.table(candidates.map((entry, index) => ({
                rank: index + 1,
                board: entry.move.boardIndex + 1,
                cell: entry.move.cellIndex + 1,
                score: entry.score.toFixed(3),
            })));
        }
        (_d = logger.groupEnd) === null || _d === void 0 ? void 0 : _d.call(logger);
    }
    static setEnabled(value) {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(this.FLAG_KEY, value ? "1" : "0");
        }
        catch (_a) {
            // no-op
        }
    }
}
AiDiagnostics.FLAG_KEY = "st3.aiDebug";


// === dist/ai/adaptive-tuning.js ===
class AdaptiveTuning {
    static resolve(difficulty, band) {
        const normalized = band !== null && band !== void 0 ? band : "flow";
        switch (difficulty) {
            case "easy":
                return { easy: this.easyTuning(normalized) };
            case "normal":
                return { normal: this.normalTuning(normalized) };
            case "hard":
                return { hard: this.hardTuning(normalized) };
            case "expert":
                return { expert: this.expertTuning(normalized) };
            default:
                return {};
        }
    }
    static easyTuning(band) {
        const blockChance = band === "struggle" ? 0.9 : band === "coast" ? 0.35 : 0.6;
        const noiseScale = band === "struggle" ? 5.5 : band === "coast" ? 3 : 4.2;
        return { blockChance, noiseScale };
    }
    static normalTuning(band) {
        const blunderRate = band === "struggle" ? 0.2 : band === "coast" ? 0.05 : 0.12;
        const branchCap = band === "coast" ? 8 : band === "struggle" ? 5 : 6;
        return { blunderRate, branchCap };
    }
    static hardTuning(band) {
        return {
            allowJitter: true,
            maxTimeMs: band === "coast" ? 1600 : band === "struggle" ? 650 : 1100,
            depthAdjustment: band === "coast" ? 1 : band === "struggle" ? -1 : 0,
            useMcts: band === "coast",
            mctsBudgetMs: band === "coast" ? 350 : 0,
        };
    }
    static expertTuning(band) {
        return {
            allowJitter: false,
            maxTimeMs: band === "coast" ? 2000 : band === "struggle" ? 900 : 1400,
            depthAdjustment: band === "coast" ? 1 : 0,
            useMcts: band !== "struggle",
            mctsBudgetMs: band === "coast" ? 450 : 250,
        };
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
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
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
    static choose(snapshot, options) {
        var _a, _b, _c;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        const blockChance = (_a = options === null || options === void 0 ? void 0 : options.blockChance) !== null && _a !== void 0 ? _a : this.DEFAULT_BLOCK;
        if (Math.random() < blockChance) {
            const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
            if (blockingMove) {
                return blockingMove;
            }
        }
        // Otherwise pick based on priority + randomness
        const noise = (_b = options === null || options === void 0 ? void 0 : options.noiseScale) !== null && _b !== void 0 ? _b : this.DEFAULT_NOISE;
        const scored = candidates.map((move) => {
            var _a, _b;
            const priority = ((_a = CELL_PRIORITY[move.cellIndex]) !== null && _a !== void 0 ? _a : 0) +
                ((_b = BOARD_PRIORITY[move.boardIndex]) !== null && _b !== void 0 ? _b : 0);
            return {
                move,
                score: priority + Math.random() * noise - noise / 2,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        return ((_c = scored[0]) === null || _c === void 0 ? void 0 : _c.move) || null;
    }
}
EasyAiStrategy.DEFAULT_BLOCK = 0.45;
EasyAiStrategy.DEFAULT_NOISE = 4;


// === dist/ai/strategies/normal.js ===






class NormalAiStrategy {
    static choose(snapshot, options) {
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
        const { move, scored, errorApplied } = this.scoreAndPick(snapshot, candidates, options);
        if (AiDiagnostics.isEnabled()) {
            const { breakdown } = AiEvaluator.evaluateDetailed(snapshot, "O");
            AiDiagnostics.logDecision({
                difficulty: "normal",
                ruleSet: snapshot.ruleSet,
                bestMove: move,
                candidates: scored.slice(0, 5),
                metadata: {
                    errorApplied,
                    candidateCount: scored.length,
                },
                breakdown,
            });
        }
        return move;
    }
    static scoreAndPick(snapshot, candidates, options) {
        var _a, _b;
        if (candidates.length === 0) {
            throw new Error("No candidates available");
        }
        const ordered = this.orderCandidates(snapshot, candidates, "O");
        const branchCap = (_a = options === null || options === void 0 ? void 0 : options.maxBranches) !== null && _a !== void 0 ? _a : this.DEFAULT_BRANCH_CAP;
        const limited = ordered.slice(0, branchCap);
        const scored = limited.map((entry) => ({
            move: entry.move,
            score: this.depthTwoSearch(snapshot, entry.move, branchCap),
        }));
        if (scored.length === 0) {
            scored.push({ move: ordered[0].move, score: -Infinity });
        }
        scored.sort((a, b) => b.score - a.score);
        let chosenIndex = 0;
        let errorApplied = false;
        const blunderRate = (_b = options === null || options === void 0 ? void 0 : options.blunderRate) !== null && _b !== void 0 ? _b : this.DEFAULT_BLUNDER_RATE;
        if (Math.random() < blunderRate && scored.length > 1) {
            const maxIdx = Math.min(2, scored.length - 1);
            chosenIndex = Math.floor(Math.random() * maxIdx) + 1;
            errorApplied = chosenIndex !== 0;
        }
        return {
            move: scored[chosenIndex].move,
            scored,
            errorApplied,
        };
    }
    static depthTwoSearch(snapshot, move, branchCap) {
        const next = AiSimulator.applyMove(snapshot, move, "O");
        if (!next) {
            return -Infinity;
        }
        if (next.status !== "playing") {
            return AiEvaluator.evaluate(next, "O");
        }
        const opponentMoves = AiUtils.collectCandidates(next);
        if (opponentMoves.length === 0) {
            return AiEvaluator.evaluate(next, "O");
        }
        const orderedOpp = this.orderCandidates(next, opponentMoves, "X");
        let bestResponse = Infinity;
        const limit = orderedOpp.slice(0, branchCap);
        for (const { move: oppMove } of limit) {
            const afterOpp = AiSimulator.applyMove(next, oppMove, "X");
            if (!afterOpp) {
                continue;
            }
            const evalScore = AiEvaluator.evaluate(afterOpp, "O");
            if (evalScore < bestResponse) {
                bestResponse = evalScore;
            }
        }
        if (bestResponse === Infinity) {
            return AiEvaluator.evaluate(next, "O");
        }
        return bestResponse;
    }
    static orderCandidates(snapshot, moves, player) {
        return moves
            .map((move) => {
            var _a, _b;
            const board = snapshot.boards[move.boardIndex];
            let heuristic = 0;
            heuristic += (_a = BOARD_PRIORITY[move.boardIndex]) !== null && _a !== void 0 ? _a : 0;
            heuristic += (_b = CELL_PRIORITY[move.cellIndex]) !== null && _b !== void 0 ? _b : 0;
            if (board) {
                heuristic += AiUtils.patternOpportunityScore(board.cells, player, move.cellIndex);
                const opponent = player === "O" ? "X" : "O";
                heuristic += AiUtils.patternBlockScore(board.cells, opponent, move.cellIndex);
            }
            heuristic += RuleAwareHeuristics.moveBonus(snapshot, move, player);
            return { move, heuristic };
        })
            .sort((a, b) => b.heuristic - a.heuristic);
    }
    static simulateImmediatePunish(snapshot, move) {
        const next = AiSimulator.applyMove(snapshot, move, "O");
        if (!next) {
            return 0;
        }
        const opponentCandidates = AiUtils.collectCandidates(next);
        if (opponentCandidates.length === 0) {
            return 0;
        }
        let penalty = 0;
        const immediateLoss = AiUtils.findImmediateWin(next, opponentCandidates, "X");
        if (immediateLoss) {
            penalty -= 6;
        }
        if (snapshot.ruleSet === "battle") {
            const contestedIndex = move.boardIndex;
            const contestedBoard = next.boards[contestedIndex];
            if (contestedBoard && contestedBoard.winner === "O" && !contestedBoard.isFull) {
                const recaptureCandidates = opponentCandidates.filter((candidate) => candidate.boardIndex === contestedIndex);
                const recaptureThreat = recaptureCandidates.some((candidate) => AiUtils.completesLine(contestedBoard.cells, candidate.cellIndex, "X"));
                if (recaptureThreat) {
                    penalty -= 4.5;
                }
            }
        }
        return penalty;
    }
}
NormalAiStrategy.DEFAULT_BLUNDER_RATE = 0.12;
NormalAiStrategy.DEFAULT_BRANCH_CAP = 6;


// === dist/ai/search/dr-mcts.js ===



class DrMctsSearch {
    static run(snapshot, player, options) {
        var _a, _b, _c;
        const root = this.createNode(null, snapshot);
        const maxTime = (_a = options === null || options === void 0 ? void 0 : options.maxTimeMs) !== null && _a !== void 0 ? _a : 350;
        const deadline = performance.now() + maxTime;
        const maxIterations = (_b = options === null || options === void 0 ? void 0 : options.iterations) !== null && _b !== void 0 ? _b : 600;
        const exploration = (_c = options === null || options === void 0 ? void 0 : options.exploration) !== null && _c !== void 0 ? _c : 1.1;
        let iterations = 0;
        while (iterations < maxIterations && performance.now() < deadline) {
            iterations += 1;
            const path = this.select(root, exploration);
            const leaf = path[path.length - 1];
            const expanded = this.expand(leaf);
            const evalNode = expanded !== null && expanded !== void 0 ? expanded : leaf;
            const value = this.evaluateNode(evalNode, player);
            const nodesToUpdate = expanded ? [...path, expanded] : path;
            this.backpropagate(nodesToUpdate, value);
        }
        return root.children
            .filter((child) => child.move)
            .map((child) => ({
            move: child.move,
            visits: child.visits,
            value: child.visits > 0 ? child.totalValue / child.visits : 0,
        }))
            .sort((a, b) => b.visits - a.visits);
    }
    static createNode(move, state, parent = null) {
        return {
            move,
            state,
            parent,
            children: [],
            unexpanded: AiUtils.collectCandidates(state),
            visits: 0,
            totalValue: 0,
        };
    }
    static select(root, exploration) {
        const path = [root];
        let node = root;
        while (node.unexpanded.length === 0 && node.children.length > 0 && node.state.status === "playing") {
            node = this.bestChild(node, exploration);
            path.push(node);
        }
        return path;
    }
    static bestChild(node, exploration) {
        const totalVisits = Math.max(1, node.visits);
        let bestScore = -Infinity;
        let bestChild = node.children[0];
        for (const child of node.children) {
            const mean = child.visits > 0 ? child.totalValue / child.visits : 0;
            const bonus = Math.sqrt(Math.log(totalVisits + 1) / (child.visits + 1)) * exploration;
            const score = mean + bonus;
            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }
        return bestChild;
    }
    static expand(node) {
        if (node.state.status !== "playing") {
            return null;
        }
        if (node.unexpanded.length === 0) {
            return null;
        }
        const move = node.unexpanded.pop();
        const next = AiSimulator.applyMove(node.state, move, node.state.currentPlayer);
        if (!next) {
            return null;
        }
        const child = this.createNode(move, next, node);
        node.children.push(child);
        return child;
    }
    static evaluateNode(node, player) {
        const score = AiEvaluator.evaluate(node.state, player);
        const normalized = Math.max(-1, Math.min(1, score / 1000));
        return normalized;
    }
    static backpropagate(nodes, value) {
        nodes.forEach((node) => {
            node.visits += 1;
            node.totalValue += value;
        });
    }
}


// === dist/ai/strategies/hard.js ===







class HardAiStrategy {
    static choose(snapshot, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        const allowJitter = (_a = options === null || options === void 0 ? void 0 : options.allowJitter) !== null && _a !== void 0 ? _a : false;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        let ordered = this.orderCandidates(snapshot, candidates, "O");
        if (options === null || options === void 0 ? void 0 : options.useMcts) {
            const mcts = DrMctsSearch.run(snapshot, "O", {
                maxTimeMs: (_b = options.mctsBudgetMs) !== null && _b !== void 0 ? _b : 350,
            });
            if (mcts.length > 0) {
                ordered = this.applyMctsOrdering(ordered, mcts);
            }
        }
        const depthSchedule = this.buildDepthSchedule(ordered.length, allowJitter, (_c = options === null || options === void 0 ? void 0 : options.depthAdjustment) !== null && _c !== void 0 ? _c : 0);
        const cache = new Map();
        const stats = { nodes: 0, cacheHits: 0 };
        const startTime = performance.now();
        const maxTime = this.computeTimeBudget(snapshot, options === null || options === void 0 ? void 0 : options.maxTimeMs, allowJitter);
        let bestMove = (_e = (_d = ordered[0]) === null || _d === void 0 ? void 0 : _d.move) !== null && _e !== void 0 ? _e : null;
        let bestScore = -Infinity;
        let depthReached = this.BASE_DEPTH;
        let lastIterationScores = [];
        depthLoop: for (const depth of depthSchedule) {
            depthReached = depth;
            let iterationBest = null;
            let iterationScore = -Infinity;
            const layerScores = [];
            for (const { move } of ordered) {
                if (performance.now() - startTime > maxTime) {
                    break depthLoop;
                }
                const next = AiSimulator.applyMove(snapshot, move, "O");
                if (!next) {
                    continue;
                }
                const score = this.minimax(next, 1, depth, -Infinity, Infinity, cache, stats, startTime, maxTime);
                layerScores.push({ move, score });
                if (score > iterationScore) {
                    iterationScore = score;
                    iterationBest = move;
                }
            }
            if (layerScores.length > 0) {
                lastIterationScores = layerScores;
            }
            if (iterationBest) {
                bestMove = iterationBest;
                bestScore = iterationScore;
            }
            if (performance.now() - startTime > maxTime) {
                break;
            }
        }
        if (allowJitter && lastIterationScores.length > 1) {
            const topScore = Math.max(...lastIterationScores.map((entry) => entry.score));
            const tolerance = 0.4;
            const contenders = lastIterationScores.filter((entry) => topScore - entry.score <= tolerance);
            if (contenders.length > 1) {
                const choice = contenders[Math.floor(Math.random() * contenders.length)];
                bestMove = choice.move;
                bestScore = choice.score;
            }
        }
        if (AiDiagnostics.isEnabled()) {
            const { breakdown } = AiEvaluator.evaluateDetailed(snapshot, "O");
            AiDiagnostics.logDecision({
                difficulty: allowJitter ? "hard" : "expert",
                ruleSet: snapshot.ruleSet,
                bestMove,
                depth: depthReached,
                candidates: ordered.slice(0, 5),
                metadata: {
                    cacheEntries: cache.size,
                    nodes: stats.nodes,
                    cacheHits: stats.cacheHits,
                    jitter: allowJitter,
                    timeMs: Number((performance.now() - startTime).toFixed(1)),
                    maxTime,
                    depthSchedule,
                    usedMcts: !!(options === null || options === void 0 ? void 0 : options.useMcts),
                },
                breakdown,
            });
        }
        if (bestMove) {
            return bestMove;
        }
        return (_g = bestMove !== null && bestMove !== void 0 ? bestMove : (_f = ordered[0]) === null || _f === void 0 ? void 0 : _f.move) !== null && _g !== void 0 ? _g : null;
    }
    static minimax(state, depth, maxDepth, alpha, beta, cache, stats, startTime, maxTime) {
        stats.nodes += 1;
        if (performance.now() - startTime > maxTime) {
            return AiEvaluator.evaluate(state, "O");
        }
        const cacheKey = this.hashState(state, depth);
        const cached = cache.get(cacheKey);
        if (cached !== undefined) {
            stats.cacheHits += 1;
            return cached;
        }
        const terminal = this.evaluateTerminal(state, depth);
        if (terminal !== null) {
            return terminal;
        }
        if (depth >= maxDepth) {
            if (this.shouldExtend(state)) {
                const forcing = this.getForcingMoves(state, state.currentPlayer);
                if (forcing.length > 0) {
                    return this.evaluateForcingBranch(state, forcing, alpha, beta, stats, startTime, maxTime);
                }
            }
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
            const value = this.minimax(next, depth + 1, maxDepth, alpha, beta, cache, stats, startTime, maxTime);
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
        cache.set(cacheKey, bestScore);
        return bestScore;
    }
    static computeTimeBudget(snapshot, override, allowJitter) {
        if (typeof override === "number") {
            return override;
        }
        const remainingCells = snapshot.boards.reduce((total, board) => {
            return total + board.cells.filter((cell) => cell === null).length;
        }, 0);
        const lateGame = remainingCells <= this.LATE_GAME_THRESHOLD;
        const base = allowJitter ? this.HARD_TIME_MS : this.EXPERT_TIME_MS;
        if (lateGame) {
            return Math.min(this.LATE_GAME_CAP_MS, base + 600);
        }
        return base;
    }
    static buildDepthSchedule(candidateCount, allowJitter, depthAdjustment) {
        const depths = [this.BASE_DEPTH + depthAdjustment];
        if (candidateCount <= this.HIGH_BRANCH_THRESHOLD) {
            depths.push(this.BASE_DEPTH + 1 + depthAdjustment);
        }
        if (candidateCount <= 12) {
            depths.push(this.EXTENDED_DEPTH + depthAdjustment);
        }
        if (allowJitter && candidateCount > 8 && depths.length > 2) {
            depths.pop();
        }
        return depths
            .map((depth) => Math.max(3, depth))
            .filter((depth, index, arr) => arr.indexOf(depth) === index);
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
        return AiEvaluator.evaluate(state, "O");
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
            const ruleAware = RuleAwareHeuristics.moveBonus(snapshot, move, player);
            const heuristic = cellScore + potential * 1.5 + block + ruleAware;
            return { move, score: heuristic };
        })
            .sort((a, b) => b.score - a.score);
    }
    static applyMctsOrdering(ordered, mcts) {
        const map = new Map();
        mcts.forEach((entry) => {
            const key = this.moveKey(entry.move);
            map.set(key, { visits: entry.visits, value: entry.value });
        });
        return ordered
            .map((entry) => {
            const bonus = map.get(this.moveKey(entry.move));
            if (!bonus) {
                return entry;
            }
            const visitBoost = Math.log(bonus.visits + 1);
            const adjusted = entry.score + bonus.value * 6 + visitBoost;
            return { move: entry.move, score: adjusted };
        })
            .sort((a, b) => b.score - a.score);
    }
    static moveKey(move) {
        return `${move.boardIndex}-${move.cellIndex}`;
    }
    static shouldExtend(state) {
        if (state.status !== "playing") {
            return false;
        }
        const player = state.currentPlayer;
        const opponent = AiUtils.getOpponent(player);
        if (state.activeBoardIndex !== null) {
            const board = state.boards[state.activeBoardIndex];
            if (board && !board.isFull && !board.winner) {
                const playerThreats = AiUtils.countBoardThreats(board, player);
                const opponentThreats = AiUtils.countBoardThreats(board, opponent);
                if (playerThreats > 0 || opponentThreats > 0) {
                    return true;
                }
            }
        }
        const playerMeta = AiUtils.countMetaThreats(state.boards, player);
        const opponentMeta = AiUtils.countMetaThreats(state.boards, opponent);
        return playerMeta > 0 || opponentMeta > 0;
    }
    static getForcingMoves(state, player) {
        const opponent = AiUtils.getOpponent(player);
        const candidates = AiUtils.collectCandidates(state);
        return candidates
            .filter((move) => {
            const board = state.boards[move.boardIndex];
            if (!board || board.isFull) {
                return false;
            }
            const createsWin = AiUtils.completesLine(board.cells, move.cellIndex, player);
            const blocksWin = AiUtils.completesLine(board.cells, move.cellIndex, opponent);
            if (!createsWin && !blocksWin) {
                return false;
            }
            if (state.activeBoardIndex !== null) {
                return move.boardIndex === state.activeBoardIndex;
            }
            return true;
        })
            .slice(0, this.QUIESCENCE_BRANCH_CAP);
    }
    static evaluateForcingBranch(state, moves, alpha, beta, stats, startTime, maxTime) {
        const maximizing = state.currentPlayer === "O";
        let bestScore = maximizing ? -Infinity : Infinity;
        for (const move of moves) {
            if (performance.now() - startTime > maxTime) {
                break;
            }
            const next = AiSimulator.applyMove(state, move, state.currentPlayer);
            if (!next) {
                continue;
            }
            stats.nodes += 1;
            const value = this.evaluateState(next);
            if (maximizing) {
                if (value > bestScore) {
                    bestScore = value;
                }
                alpha = Math.max(alpha, value);
            }
            else {
                if (value < bestScore) {
                    bestScore = value;
                }
                beta = Math.min(beta, value);
            }
            if (beta <= alpha) {
                break;
            }
        }
        if (bestScore === (maximizing ? -Infinity : Infinity)) {
            return this.evaluateState(state);
        }
        return bestScore;
    }
    static hashState(state, depth) {
        var _a;
        const boardKey = state.boards
            .map((board) => board.cells.map((cell) => cell !== null && cell !== void 0 ? cell : "_").join(""))
            .join("|");
        const winners = state.boards.map((board) => { var _a; return (_a = board.winner) !== null && _a !== void 0 ? _a : "_"; }).join("");
        const active = (_a = state.activeBoardIndex) !== null && _a !== void 0 ? _a : "a";
        return `${state.ruleSet}|${state.currentPlayer}|${active}|${depth}|${winners}|${boardKey}`;
    }
}
HardAiStrategy.BASE_DEPTH = 4;
HardAiStrategy.EXTENDED_DEPTH = 6;
HardAiStrategy.HIGH_BRANCH_THRESHOLD = 16;
HardAiStrategy.HARD_TIME_MS = 750;
HardAiStrategy.EXPERT_TIME_MS = 1400;
HardAiStrategy.LATE_GAME_CAP_MS = 2200;
HardAiStrategy.LATE_GAME_THRESHOLD = 18;
HardAiStrategy.QUIESCENCE_EXTENSION = 1;
HardAiStrategy.QUIESCENCE_BRANCH_CAP = 6;


// === dist/ai/opening-book.js ===
const BOOK = [
    {
        ruleSet: "battle",
        openingId: "ai-first-center",
        moves: [{ board: 4, cell: 4 }],
        appliesTo: ["normal", "hard"],
    },
    {
        ruleSet: "classic",
        openingId: "ai-first-center",
        moves: [{ board: 4, cell: 4 }],
        appliesTo: ["normal", "hard"],
    },
    {
        ruleSet: "modern",
        openingId: "ai-first-center",
        moves: [{ board: 4, cell: 4 }],
        appliesTo: ["normal", "hard"],
    },
    {
        ruleSet: "battle",
        openingId: "human-center-response",
        moves: [
            { board: 4, cell: 4 },
            { board: 0, cell: 0 },
        ],
        appliesTo: ["normal", "hard"],
    },
];
class OpeningBook {
    static lookup(snapshot, difficulty) {
        if (snapshot.moveCount >= this.MAX_HISTORY) {
            return null;
        }
        const historyKey = this.buildHistoryKey(snapshot.history);
        if (!historyKey) {
            return null;
        }
        const entry = BOOK.find((book) => book.ruleSet === snapshot.ruleSet &&
            book.openingId === historyKey &&
            book.appliesTo.includes(difficulty));
        if (!entry) {
            return null;
        }
        const nextIndex = snapshot.moveCount;
        const plannedMove = entry.moves[nextIndex];
        if (!plannedMove) {
            return null;
        }
        const board = snapshot.boards[plannedMove.board];
        if (!board || board.cells[plannedMove.cell] !== null) {
            return null;
        }
        if (snapshot.allowedBoards.length > 0 &&
            !snapshot.allowedBoards.includes(plannedMove.board)) {
            return null;
        }
        return {
            boardIndex: plannedMove.board,
            cellIndex: plannedMove.cell,
        };
    }
    static buildHistoryKey(historyEntries) {
        var _a;
        if (historyEntries.length === 0) {
            return "ai-first-center";
        }
        const entry = historyEntries[0];
        if (!entry) {
            return null;
        }
        const firstMove = (_a = entry.p1Move) !== null && _a !== void 0 ? _a : entry.p2Move;
        if (!firstMove) {
            return null;
        }
        if (firstMove.player === "X" && firstMove.boardIndex === 4 && firstMove.cellIndex === 4) {
            return "human-center-response";
        }
        return null;
    }
}
OpeningBook.MAX_HISTORY = 2;


// === dist/ai/controller.js ===





class AiController {
    constructor(difficulty, adaptiveBand) {
        this.difficulty = difficulty;
        this.adaptiveBand = adaptiveBand !== null && adaptiveBand !== void 0 ? adaptiveBand : null;
    }
    chooseMove(snapshot) {
        const tuning = AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand);
        const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
        if (bookMove) {
            return bookMove;
        }
        switch (this.difficulty) {
            case "easy":
                return EasyAiStrategy.choose(snapshot, tuning.easy);
            case "hard":
                return HardAiStrategy.choose(snapshot, {
                    allowJitter: true,
                    ...tuning.hard,
                });
            case "expert":
                return HardAiStrategy.choose(snapshot, {
                    allowJitter: false,
                    ...tuning.expert,
                });
            case "normal":
            default:
                return NormalAiStrategy.choose(snapshot, tuning.normal);
        }
    }
    updateAdaptiveBand(band) {
        this.adaptiveBand = band;
    }
}


// === dist/analytics/solo-tracker.js ===
const STORAGE_KEY = "st3.soloStats";
const RULE_SET_KEYS = ["classic", "modern", "battle"];
const DIFFICULTY_KEYS = ["easy", "normal", "hard", "expert"];
class SoloStatsTracker {
    static record(ruleSet, difficulty, outcome) {
        const stats = this.load();
        this.increment(stats.totals, outcome);
        this.increment(stats.byRule[ruleSet], outcome);
        this.increment(stats.byDifficulty[difficulty], outcome);
        stats.lastUpdated = Date.now();
        this.save(stats);
        this.logToConsole(ruleSet, difficulty, outcome, stats);
    }
    static getStats() {
        if (!this.hasStorage()) {
            return null;
        }
        return this.load();
    }
    static increment(bucket, outcome) {
        if (outcome === "human") {
            bucket.human += 1;
        }
        else if (outcome === "ai") {
            bucket.ai += 1;
        }
        else {
            bucket.draw += 1;
        }
    }
    static createEmptySnapshot() {
        const totals = this.createEmptyBucket();
        const byRule = {
            classic: this.createEmptyBucket(),
            modern: this.createEmptyBucket(),
            battle: this.createEmptyBucket(),
        };
        const byDifficulty = {
            easy: this.createEmptyBucket(),
            normal: this.createEmptyBucket(),
            hard: this.createEmptyBucket(),
            expert: this.createEmptyBucket(),
        };
        return {
            totals,
            byRule,
            byDifficulty,
            lastUpdated: Date.now(),
        };
    }
    static createEmptyBucket() {
        return { human: 0, ai: 0, draw: 0 };
    }
    static load() {
        const defaults = this.createEmptySnapshot();
        if (!this.hasStorage()) {
            return defaults;
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return defaults;
            }
            const parsed = JSON.parse(raw);
            return this.mergeSnapshots(defaults, parsed);
        }
        catch (_a) {
            return defaults;
        }
    }
    static mergeSnapshots(base, patch) {
        if (patch.totals) {
            base.totals = this.mergeBuckets(base.totals, patch.totals);
        }
        if (patch.byRule) {
            RULE_SET_KEYS.forEach((key) => {
                var _a;
                if ((_a = patch.byRule) === null || _a === void 0 ? void 0 : _a[key]) {
                    base.byRule[key] = this.mergeBuckets(base.byRule[key], patch.byRule[key]);
                }
            });
        }
        if (patch.byDifficulty) {
            DIFFICULTY_KEYS.forEach((key) => {
                var _a;
                if ((_a = patch.byDifficulty) === null || _a === void 0 ? void 0 : _a[key]) {
                    base.byDifficulty[key] = this.mergeBuckets(base.byDifficulty[key], patch.byDifficulty[key]);
                }
            });
        }
        if (typeof patch.lastUpdated === "number") {
            base.lastUpdated = patch.lastUpdated;
        }
        return base;
    }
    static mergeBuckets(base, patch) {
        var _a, _b, _c;
        if (!patch) {
            return base;
        }
        return {
            human: (_a = patch.human) !== null && _a !== void 0 ? _a : base.human,
            ai: (_b = patch.ai) !== null && _b !== void 0 ? _b : base.ai,
            draw: (_c = patch.draw) !== null && _c !== void 0 ? _c : base.draw,
        };
    }
    static save(stats) {
        if (!this.hasStorage()) {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        }
        catch (_a) {
            // Ignore quota errors
        }
    }
    static logToConsole(ruleSet, difficulty, outcome, stats) {
        var _a;
        if (typeof console === "undefined") {
            return;
        }
        const label = `[ST3] Solo stats update (${ruleSet} · ${difficulty}) → ${outcome.toUpperCase()}`;
        console.info(label);
        (_a = console.table) === null || _a === void 0 ? void 0 : _a.call(console, stats.totals);
    }
    static hasStorage() {
        return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    }
}


// === dist/analytics/adaptive-loop.js ===
const ADAPTIVE_STORAGE_KEY = "st3.adaptiveLoop";
const VERSION = 1;
const MAX_SAMPLES = 16;
const createDefaultBucket = () => ({
    outcomes: [],
    moveTimes: [],
    illegalAttempts: [],
    lastUpdated: Date.now(),
});
class AdaptiveLoop {
    static isEnabled() {
        return this.load().enabled;
    }
    static setEnabled(enabled) {
        const store = this.load();
        store.enabled = enabled;
        this.save(store);
    }
    static recordHumanMove(ruleSet, difficulty, sample) {
        if (!Number.isFinite(sample.durationMs)) {
            return;
        }
        const store = this.load();
        const bucket = this.getBucket(store, ruleSet, difficulty);
        this.pushSample(bucket.moveTimes, sample.durationMs);
        this.pushSample(bucket.illegalAttempts, Math.max(0, sample.illegalAttempts));
        bucket.lastUpdated = Date.now();
        this.save(store);
    }
    static recordOutcome(ruleSet, difficulty, outcome) {
        const store = this.load();
        const bucket = this.getBucket(store, ruleSet, difficulty);
        const value = outcome === "human" ? 1 : outcome === "ai" ? -1 : 0;
        this.pushSample(bucket.outcomes, value);
        bucket.lastUpdated = Date.now();
        this.save(store);
    }
    static getSkillBucket(ruleSet, difficulty) {
        const bucket = this.getBucket(this.load(), ruleSet, difficulty);
        const outcomeAvg = this.average(bucket.outcomes, 0);
        const moveAvg = this.average(bucket.moveTimes, 4500);
        const illegalTotal = bucket.illegalAttempts.reduce((sum, val) => sum + val, 0);
        const illegalRate = bucket.moveTimes.length > 0
            ? illegalTotal / bucket.moveTimes.length
            : 0;
        if (outcomeAvg <= -0.35 || moveAvg > 8500 || illegalRate > 0.35) {
            return "struggle";
        }
        if (outcomeAvg >= 0.35 && moveAvg < 2500 && illegalRate < 0.1) {
            return "coast";
        }
        return "flow";
    }
    static getSnapshot() {
        return this.load();
    }
    static load() {
        var _a, _b, _c;
        if (typeof window === "undefined" || !window.localStorage) {
            return this.createStore();
        }
        try {
            const raw = window.localStorage.getItem(ADAPTIVE_STORAGE_KEY);
            if (!raw) {
                return this.createStore();
            }
            const parsed = JSON.parse(raw);
            if (parsed.version !== VERSION) {
                return this.createStore((_a = parsed.enabled) !== null && _a !== void 0 ? _a : false);
            }
            return {
                version: VERSION,
                enabled: (_b = parsed.enabled) !== null && _b !== void 0 ? _b : false,
                buckets: (_c = parsed.buckets) !== null && _c !== void 0 ? _c : {},
            };
        }
        catch (_d) {
            return this.createStore();
        }
    }
    static save(store) {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(store));
        }
        catch (_a) {
            // ignore quota errors
        }
    }
    static createStore(enabled = false) {
        return {
            version: VERSION,
            enabled,
            buckets: {},
        };
    }
    static getBucket(store, ruleSet, difficulty) {
        const key = `${ruleSet}:${difficulty}`;
        if (!store.buckets[key]) {
            store.buckets[key] = createDefaultBucket();
        }
        return store.buckets[key];
    }
    static pushSample(target, value) {
        target.push(value);
        if (target.length > MAX_SAMPLES) {
            target.shift();
        }
    }
    static average(values, fallback) {
        if (values.length === 0) {
            return fallback;
        }
        const total = values.reduce((sum, value) => sum + value, 0);
        return total / values.length;
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
        this.syncHistoryLimits();
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
                if (targetId === "rules-panel") {
                    this.syncHistoryLimits();
                }
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
        this.historyList.scrollTop = this.historyList.scrollHeight;
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
    syncHistoryLimits() {
        const rulesPanel = document.getElementById("rules-panel");
        const expanded = (rulesPanel === null || rulesPanel === void 0 ? void 0 : rulesPanel.dataset.expanded) === "true";
        this.historyList.classList.toggle("compact-history", expanded);
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
        this.adaptiveToggle = null;
        this.overlayVisible = false;
        this.overlayStep = "players";
        this.pendingMode = "solo";
        this.startPreference = "random";
        this.ruleSet = "battle";
        this.adaptiveEnabled = AdaptiveLoop.isEnabled();
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
        // Adaptive difficulty toggle
        this.adaptiveToggle = document.getElementById("adaptive-difficulty-toggle");
        if (this.adaptiveToggle) {
            this.adaptiveToggle.checked = this.adaptiveEnabled;
            this.adaptiveToggle.addEventListener("change", () => {
                var _a, _b;
                const enabled = (_b = (_a = this.adaptiveToggle) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
                this.adaptiveEnabled = enabled;
                AdaptiveLoop.setEnabled(enabled);
            });
        }
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
        if (this.adaptiveToggle) {
            this.adaptiveToggle.disabled = !isSolo;
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
            this.refreshAiControllerBand();
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
            this.refreshAiControllerBand();
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
    refreshAiControllerBand() {
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


