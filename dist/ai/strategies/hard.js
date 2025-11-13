import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";
export class HardAiStrategy {
    static choose(snapshot, options) {
        var _a, _b, _c, _d, _e;
        const allowJitter = (_a = options === null || options === void 0 ? void 0 : options.allowJitter) !== null && _a !== void 0 ? _a : false;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        const ordered = this.orderCandidates(snapshot, candidates, "O");
        const cache = new Map();
        const stats = { nodes: 0, cacheHits: 0 };
        const startTime = performance.now();
        const maxTime = this.computeTimeBudget(snapshot);
        let bestMove = (_c = (_b = ordered[0]) === null || _b === void 0 ? void 0 : _b.move) !== null && _c !== void 0 ? _c : null;
        let bestScore = -Infinity;
        let depthReached = this.BASE_DEPTH;
        let lastIterationScores = [];
        for (let depth = this.BASE_DEPTH; depth <= this.EXTENDED_DEPTH; depth += 1) {
            depthReached = depth;
            let iterationBest = null;
            let iterationScore = -Infinity;
            const layerScores = [];
            for (const { move } of ordered) {
                if (performance.now() - startTime > maxTime) {
                    depth = this.EXTENDED_DEPTH + 1;
                    break;
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
        AiDiagnostics.logDecision({
            difficulty: "hard",
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
            },
        });
        if (bestMove) {
            return bestMove;
        }
        return (_e = bestMove !== null && bestMove !== void 0 ? bestMove : (_d = ordered[0]) === null || _d === void 0 ? void 0 : _d.move) !== null && _e !== void 0 ? _e : null;
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
    static computeTimeBudget(snapshot) {
        const remainingCells = snapshot.boards.reduce((total, board) => {
            return total + board.cells.filter((cell) => cell === null).length;
        }, 0);
        const lateGame = remainingCells <= this.LATE_GAME_THRESHOLD;
        return lateGame ? this.LATE_GAME_CAP_MS : this.MAX_TIME_MS;
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
HardAiStrategy.MAX_TIME_MS = 1500;
HardAiStrategy.LATE_GAME_CAP_MS = 4000;
HardAiStrategy.LATE_GAME_THRESHOLD = 20;
