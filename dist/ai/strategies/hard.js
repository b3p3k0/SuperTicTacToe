import { WIN_PATTERNS, CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
export class HardAiStrategy {
    static choose(snapshot) {
        var _a, _b;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        const depthLimit = candidates.length <= this.HIGH_BRANCH_THRESHOLD
            ? this.EXTENDED_DEPTH
            : this.BASE_DEPTH;
        let bestMove = null;
        let bestScore = -Infinity;
        const cache = new Map();
        const stats = { nodes: 0, cacheHits: 0 };
        const ordered = this.orderCandidates(snapshot, candidates, "O");
        for (const { move } of ordered) {
            const next = AiSimulator.applyMove(snapshot, move, "O");
            if (!next) {
                continue;
            }
            const score = this.minimax(next, 1, depthLimit, -Infinity, Infinity, cache, stats);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        AiDiagnostics.logDecision({
            difficulty: "hard",
            ruleSet: snapshot.ruleSet,
            bestMove,
            depth: depthLimit,
            candidates: ordered.slice(0, 5),
            metadata: {
                cacheEntries: cache.size,
                nodes: stats.nodes,
                cacheHits: stats.cacheHits,
            },
        });
        if (bestMove) {
            return bestMove;
        }
        return (_b = (_a = ordered[0]) === null || _a === void 0 ? void 0 : _a.move) !== null && _b !== void 0 ? _b : null;
    }
    static minimax(state, depth, maxDepth, alpha, beta, cache, stats) {
        stats.nodes += 1;
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
            const value = this.minimax(next, depth + 1, maxDepth, alpha, beta, cache, stats);
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
        var _a;
        let score = 0;
        const ruleSet = (_a = state.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        // Evaluate individual boards
        state.boards.forEach((board) => {
            if (board.winner === "O") {
                score += ruleSet === "modern" ? 12 : 10;
            }
            else if (board.winner === "X") {
                score -= ruleSet === "modern" ? 12 : 10;
            }
            else {
                const aiWeight = ruleSet === "modern" ? 1.25 : ruleSet === "classic" ? 1.1 : 1.05;
                const humanWeight = ruleSet === "battle" ? 0.95 : 1;
                score += AiUtils.boardPotential(board.cells, "O") * aiWeight;
                score -= AiUtils.boardPotential(board.cells, "X") * humanWeight;
            }
        });
        // Macro-level evaluation
        score += this.evaluateMacro(state.boards) * 6.5;
        // Directed target evaluation
        score += this.evaluateDirectedTargets(state, ruleSet) * 3.2;
        // Rule-specific global bonuses
        score += RuleAwareHeuristics.stateBonus(state, "O");
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
    static evaluateDirectedTargets(state, ruleSet) {
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
        const weight = ruleSet === "classic" ? 0.8 : ruleSet === "modern" ? 0.7 : 0.6;
        return (aiPotential - humanPotential) * weight;
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
HardAiStrategy.EXTENDED_DEPTH = 5;
HardAiStrategy.HIGH_BRANCH_THRESHOLD = 16;
