import { WIN_PATTERNS, CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
export class HardAiStrategy {
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
