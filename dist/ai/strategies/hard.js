import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";
export class HardAiStrategy {
    static choose(snapshot, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        const allowJitter = (_a = options === null || options === void 0 ? void 0 : options.allowJitter) !== null && _a !== void 0 ? _a : false;
        const weightOverrides = options === null || options === void 0 ? void 0 : options.weightOverrides;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        const winNow = candidates.find((move) => { var _a; return ((_a = AiSimulator.applyMove(snapshot, move, "O")) === null || _a === void 0 ? void 0 : _a.winner) === "O"; });
        if (winNow) {
            return winNow;
        }
        const startTime = performance.now();
        const maxTime = (_b = options === null || options === void 0 ? void 0 : options.maxTimeMs) !== null && _b !== void 0 ? _b : this.DEFAULT_TIME_MS;
        let ordered = this.orderCandidates(snapshot, candidates, "O");
        const depthSchedule = this.buildDepthSchedule(ordered.length, allowJitter, (_c = options === null || options === void 0 ? void 0 : options.depthAdjustment) !== null && _c !== void 0 ? _c : 0);
        const stats = { nodes: 0 };
        let bestMove = (_e = (_d = ordered[0]) === null || _d === void 0 ? void 0 : _d.move) !== null && _e !== void 0 ? _e : null;
        let bestScore = -Infinity;
        let depthReached = this.BASE_DEPTH;
        let lastIterationScores = [];
        let completedIterations = 0;
        for (const depth of depthSchedule) {
            depthReached = depth;
            let iterationBest = null;
            let iterationScore = -Infinity;
            let timedOut = false;
            const layerScores = [];
            for (const { move } of ordered) {
                if (performance.now() - startTime > maxTime) {
                    timedOut = true;
                    break;
                }
                const next = AiSimulator.applyMove(snapshot, move, "O");
                if (!next) {
                    continue;
                }
                // Root alpha-beta window: a move that cannot beat the best so far is cut off early.
                // Hard keeps a small margin so near-equal moves still get exact scores for the jitter pick.
                const alpha = iterationScore - (allowJitter ? this.JITTER_TOLERANCE : 0);
                const score = this.minimax(next, 1, depth, alpha, Infinity, stats, startTime, maxTime, weightOverrides);
                layerScores.push({ move, score });
                if (score > iterationScore) {
                    iterationScore = score;
                    iterationBest = move;
                }
            }
            // Keep a cut-short pass only when no full pass exists; a finished pass beats a partial deeper one.
            if (iterationBest && (!timedOut || completedIterations === 0)) {
                bestMove = iterationBest;
                bestScore = iterationScore;
                lastIterationScores = layerScores;
            }
            if (timedOut) {
                break;
            }
            completedIterations += 1;
            // Search this pass's best moves first in the next pass; better ordering means more cut-offs.
            ordered = [...layerScores].sort((a, b) => b.score - a.score);
        }
        if (allowJitter && lastIterationScores.length > 1) {
            const topScore = Math.max(...lastIterationScores.map((entry) => entry.score));
            const contenders = lastIterationScores.filter((entry) => topScore - entry.score <= this.JITTER_TOLERANCE);
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
                    nodes: stats.nodes,
                    jitter: allowJitter,
                    timeMs: Number((performance.now() - startTime).toFixed(1)),
                    maxTime,
                    depthSchedule,
                },
                breakdown,
            });
        }
        const moveToPlay = (_g = bestMove !== null && bestMove !== void 0 ? bestMove : (_f = ordered[0]) === null || _f === void 0 ? void 0 : _f.move) !== null && _g !== void 0 ? _g : null;
        return moveToPlay;
    }
    static minimax(state, depth, maxDepth, alpha, beta, stats, startTime, maxTime, weightOverrides) {
        stats.nodes += 1;
        if (performance.now() - startTime > maxTime) {
            return AiEvaluator.evaluate(state, "O", weightOverrides);
        }
        const terminal = this.evaluateTerminal(state, depth);
        if (terminal !== null) {
            return terminal;
        }
        if (depth >= maxDepth) {
            if (this.shouldExtend(state)) {
                const forcing = this.getForcingMoves(state, state.currentPlayer);
                if (forcing.length > 0) {
                    return this.evaluateForcingBranch(state, forcing, depth, alpha, beta, stats, startTime, maxTime, weightOverrides);
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
            const value = this.minimax(next, depth + 1, maxDepth, alpha, beta, stats, startTime, maxTime, weightOverrides);
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
    static buildDepthSchedule(candidateCount, allowJitter, depthAdjustment) {
        // Hard (jitter on) stops at depth 5. Expert goes to depth 6, and to 7 when the position is narrow.
        const depths = [this.BASE_DEPTH + depthAdjustment];
        if (candidateCount <= this.HIGH_BRANCH_THRESHOLD) {
            depths.push(this.BASE_DEPTH + 1 + depthAdjustment);
        }
        if (!allowJitter && candidateCount <= this.EXTENDED_BRANCH_THRESHOLD) {
            depths.push(this.EXTENDED_DEPTH + depthAdjustment);
        }
        if (!allowJitter && candidateCount <= this.NARROW_BRANCH_THRESHOLD) {
            depths.push(this.EXTENDED_DEPTH + 1 + depthAdjustment);
        }
        return depths
            .map((depth) => Math.max(3, depth))
            .filter((depth, index, arr) => arr.indexOf(depth) === index);
    }
    static evaluateTerminal(state, depth) {
        if (state.status === "won" && state.winner) {
            // Subtract depth so a sooner win (or later loss) is preferred.
            return state.winner === "O" ? this.TERMINAL_SCORE - depth : depth - this.TERMINAL_SCORE;
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
    static evaluateForcingBranch(state, moves, depth, alpha, beta, stats, startTime, maxTime, weightOverrides) {
        var _a;
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
            const value = (_a = this.evaluateTerminal(next, depth + 1)) !== null && _a !== void 0 ? _a : this.evaluateState(next, weightOverrides);
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
}
HardAiStrategy.BASE_DEPTH = 4;
HardAiStrategy.EXTENDED_DEPTH = 6;
HardAiStrategy.HIGH_BRANCH_THRESHOLD = 16;
HardAiStrategy.EXTENDED_BRANCH_THRESHOLD = 12;
HardAiStrategy.NARROW_BRANCH_THRESHOLD = 8;
HardAiStrategy.DEFAULT_TIME_MS = 1000;
HardAiStrategy.QUIESCENCE_BRANCH_CAP = 6;
HardAiStrategy.TERMINAL_SCORE = 10000; // matches AiEvaluator terminalWin
HardAiStrategy.JITTER_TOLERANCE = 0.4;
