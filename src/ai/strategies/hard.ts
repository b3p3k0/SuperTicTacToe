import { GameSnapshot, AiMove, Player } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";

interface ScoredMove {
  move: AiMove;
  score: number;
}

interface SearchStats {
  nodes: number;
  cacheHits: number;
}

interface HardStrategyOptions {
  allowJitter?: boolean;
}

export class HardAiStrategy {
  private static readonly BASE_DEPTH = 4;
  private static readonly EXTENDED_DEPTH = 6;
  private static readonly HIGH_BRANCH_THRESHOLD = 16;
  private static readonly MAX_TIME_MS = 1500;
  private static readonly LATE_GAME_CAP_MS = 4000;
  private static readonly LATE_GAME_THRESHOLD = 20;

  static choose(snapshot: GameSnapshot, options?: HardStrategyOptions): AiMove | null {
    const allowJitter = options?.allowJitter ?? false;
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    const ordered = this.orderCandidates(snapshot, candidates, "O");
    const cache = new Map<string, number>();
    const stats: SearchStats = { nodes: 0, cacheHits: 0 };
    const startTime = performance.now();
    const maxTime = this.computeTimeBudget(snapshot);

    let bestMove: AiMove | null = ordered[0]?.move ?? null;
    let bestScore = -Infinity;
    let depthReached = this.BASE_DEPTH;
    let lastIterationScores: ScoredMove[] = [];

    for (let depth = this.BASE_DEPTH; depth <= this.EXTENDED_DEPTH; depth += 1) {
      depthReached = depth;
      let iterationBest: AiMove | null = null;
      let iterationScore = -Infinity;
      const layerScores: ScoredMove[] = [];
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
      const contenders = lastIterationScores.filter(
        (entry) => topScore - entry.score <= tolerance,
      );
      if (contenders.length > 1) {
        const choice =
          contenders[Math.floor(Math.random() * contenders.length)]!;
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

    return bestMove ?? ordered[0]?.move ?? null;
  }

  private static minimax(
    state: GameSnapshot,
    depth: number,
    maxDepth: number,
    alpha: number,
    beta: number,
    cache: Map<string, number>,
    stats: SearchStats,
    startTime: number,
    maxTime: number
  ): number {
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
      } else {
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

  private static computeTimeBudget(snapshot: GameSnapshot): number {
    const remainingCells = snapshot.boards.reduce((total, board) => {
      return total + board.cells.filter((cell) => cell === null).length;
    }, 0);
    const lateGame = remainingCells <= this.LATE_GAME_THRESHOLD;
    return lateGame ? this.LATE_GAME_CAP_MS : this.MAX_TIME_MS;
  }

  private static evaluateTerminal(state: GameSnapshot, depth: number): number | null {
    if (state.status === "won" && state.winner) {
      return state.winner === "O" ? 100 - depth * 2 : depth * 2 - 100;
    }

    if (state.status === "draw") {
      return 0;
    }

    return null;
  }

  private static evaluateState(state: GameSnapshot): number {
    return AiEvaluator.evaluate(state, "O");
  }

  private static orderCandidates(
    snapshot: GameSnapshot,
    moves: AiMove[],
    player: Player
  ): ScoredMove[] {
    return moves
      .map((move) => {
        const board = snapshot.boards[move.boardIndex];
        const cellScore = (CELL_PRIORITY[move.cellIndex] ?? 0) +
                         (BOARD_PRIORITY[move.boardIndex] ?? 0);

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

  private static hashState(state: GameSnapshot, depth: number): string {
    const boardKey = state.boards
      .map((board) => board.cells.map((cell) => cell ?? "_").join(""))
      .join("|");
    const winners = state.boards.map((board) => board.winner ?? "_").join("");
    const active = state.activeBoardIndex ?? "a";
    return `${state.ruleSet}|${state.currentPlayer}|${active}|${depth}|${winners}|${boardKey}`;
  }
}
