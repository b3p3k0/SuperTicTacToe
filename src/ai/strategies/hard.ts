import { GameSnapshot, AiMove, Player, AdaptiveBand } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";
import { AiTelemetry } from "../telemetry.js";
import { DrMctsSearch } from "../search/dr-mcts.js";

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
  maxTimeMs?: number;
  depthAdjustment?: number;
  useMcts?: boolean;
  mctsBudgetMs?: number;
  band?: AdaptiveBand | null;
  player?: Player;
}

export class HardAiStrategy {
  private static readonly BASE_DEPTH = 4;
  private static readonly EXTENDED_DEPTH = 6;
  private static readonly HIGH_BRANCH_THRESHOLD = 16;
  private static readonly HARD_TIME_MS = 750;
  private static readonly EXPERT_TIME_MS = 1400;
  private static readonly HARD_LATE_MS = 4000;
  private static readonly EXPERT_LATE_MS = 6000;
  private static readonly LATE_GAME_THRESHOLD = 18;
  private static readonly QUIESCENCE_EXTENSION = 1;
  private static readonly QUIESCENCE_BRANCH_CAP = 6;

  static choose(snapshot: GameSnapshot, options?: HardStrategyOptions): AiMove | null {
    const allowJitter = options?.allowJitter ?? false;
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    let ordered = this.orderCandidates(snapshot, candidates, "O");
    if (options?.useMcts) {
      const mcts = DrMctsSearch.run(snapshot, "O", {
        maxTimeMs: options.mctsBudgetMs ?? 350,
      });
      if (mcts.length > 0) {
        ordered = this.applyMctsOrdering(ordered, mcts);
      }
    }

    const depthSchedule = this.buildDepthSchedule(
      ordered.length,
      allowJitter,
      options?.depthAdjustment ?? 0,
    );
    const cache = new Map<string, number>();
    const stats: SearchStats = { nodes: 0, cacheHits: 0 };
    const startTime = performance.now();
    const maxTime = this.computeTimeBudget(snapshot, options?.maxTimeMs, allowJitter);

    let bestMove: AiMove | null = ordered[0]?.move ?? null;
    let bestScore = -Infinity;
    let depthReached = this.BASE_DEPTH;
    let lastIterationScores: ScoredMove[] = [];

    depthLoop: for (const depth of depthSchedule) {
      depthReached = depth;
      let iterationBest: AiMove | null = null;
      let iterationScore = -Infinity;
      const layerScores: ScoredMove[] = [];
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
          usedMcts: !!options?.useMcts,
        },
        breakdown,
      });
    }

    const moveToPlay = bestMove ?? ordered[0]?.move ?? null;
    const decisionMs = Number((performance.now() - startTime).toFixed(2));
    if (moveToPlay) {
      AiTelemetry.emit({
        topic: "hard-decision",
        difficulty: allowJitter ? "hard" : "expert",
        ruleSet: snapshot.ruleSet,
        adaptiveBand: options?.band ?? null,
        decisionMs,
        usedMcts: !!options?.useMcts,
        player: options?.player ?? null,
      });
    }

    return moveToPlay;
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
      if (this.shouldExtend(state)) {
        const forcing = this.getForcingMoves(state, state.currentPlayer);
        if (forcing.length > 0) {
          return this.evaluateForcingBranch(
            state,
            forcing,
            alpha,
            beta,
            stats,
            startTime,
            maxTime,
          );
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

  private static computeTimeBudget(
    snapshot: GameSnapshot,
    override: number | undefined,
    allowJitter: boolean,
  ): number {
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

  private static buildDepthSchedule(
    candidateCount: number,
    allowJitter: boolean,
    depthAdjustment: number,
  ): number[] {
    const depths: number[] = [this.BASE_DEPTH + depthAdjustment];
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

  private static applyMctsOrdering(
    ordered: ScoredMove[],
    mcts: { move: AiMove; visits: number; value: number }[],
  ): ScoredMove[] {
    const map = new Map<string, { visits: number; value: number }>();
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

  private static moveKey(move: AiMove): string {
    return `${move.boardIndex}-${move.cellIndex}`;
  }

  private static shouldExtend(state: GameSnapshot): boolean {
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

  private static getForcingMoves(state: GameSnapshot, player: Player): AiMove[] {
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

  private static evaluateForcingBranch(
    state: GameSnapshot,
    moves: AiMove[],
    alpha: number,
    beta: number,
    stats: SearchStats,
    startTime: number,
    maxTime: number,
  ): number {
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
      } else {
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

  private static hashState(state: GameSnapshot, depth: number): string {
    const boardKey = state.boards
      .map((board) => board.cells.map((cell) => cell ?? "_").join(""))
      .join("|");
    const winners = state.boards.map((board) => board.winner ?? "_").join("");
    const active = state.activeBoardIndex ?? "a";
    return `${state.ruleSet}|${state.currentPlayer}|${active}|${depth}|${winners}|${boardKey}`;
  }
}
