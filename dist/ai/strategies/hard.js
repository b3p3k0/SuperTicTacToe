import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";
import { DrMctsSearch } from "../search/dr-mcts.js";
export class HardAiStrategy {
    static choose(snapshot, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        const allowJitter = (_a = options === null || options === void 0 ? void 0 : options.allowJitter) !== null && _a !== void 0 ? _a : false;
        const weightOverrides = options === null || options === void 0 ? void 0 : options.weightOverrides;
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
                const score = this.minimax(next, 1, depth, -Infinity, Infinity, cache, stats, startTime, maxTime, weightOverrides);
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
        const moveToPlay = (_g = bestMove !== null && bestMove !== void 0 ? bestMove : (_f = ordered[0]) === null || _f === void 0 ? void 0 : _f.move) !== null && _g !== void 0 ? _g : null;
        return moveToPlay;
    }
    static minimax(state, depth, maxDepth, alpha, beta, cache, stats, startTime, maxTime, weightOverrides) {
        stats.nodes += 1;
        if (performance.now() - startTime > maxTime) {
            return AiEvaluator.evaluate(state, "O", weightOverrides);
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
                    return this.evaluateForcingBranch(state, forcing, alpha, beta, stats, startTime, maxTime, weightOverrides);
                }
            }
            return this.evaluateState(state, weightOverrides);
        }
        const candidates = AiUtils.collectCandidates(state);
        if (candidates.length === 0) {
            return this.evaluateState(state, weightOverrides);
        }
        const maximizing = state.currentPlayer === "O";
        let bestScore = maximizing ? -Infinity : Infinity;
        const ordered = this.orderCandidates(state, candidates, state.currentPlayer);
        for (const { move } of ordered) {
            const next = AiSimulator.applyMove(state, move, state.currentPlayer);
            if (!next) {
                continue;
            }
            const value = this.minimax(next, depth + 1, maxDepth, alpha, beta, cache, stats, startTime, maxTime, weightOverrides);
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
            return allowJitter ? this.HARD_LATE_MS : this.EXPERT_LATE_MS;
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
    static evaluateState(state, overrides) {
        return AiEvaluator.evaluate(state, "O", overrides);
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
    static evaluateForcingBranch(state, moves, alpha, beta, stats, startTime, maxTime, weightOverrides) {
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
            const value = this.evaluateState(next, weightOverrides);
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
            return this.evaluateState(state, weightOverrides);
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
HardAiStrategy.HARD_LATE_MS = 4000;
HardAiStrategy.EXPERT_LATE_MS = 6000;
HardAiStrategy.LATE_GAME_THRESHOLD = 18;
HardAiStrategy.QUIESCENCE_EXTENSION = 1;
HardAiStrategy.QUIESCENCE_BRANCH_CAP = 6;
