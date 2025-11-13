import { GameSnapshot, AiMove, Player, RuleSet } from "../../core/types.js";
import { WIN_PATTERNS, CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiDiagnostics } from "../diagnostics.js";

interface ScoredMove {
  move: AiMove;
  score: number;
}

interface SearchStats {
  nodes: number;
  cacheHits: number;
}

export class HardAiStrategy {
  private static readonly BASE_DEPTH = 4;
  private static readonly EXTENDED_DEPTH = 5;
  private static readonly HIGH_BRANCH_THRESHOLD = 16;

  static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    const depthLimit = candidates.length <= this.HIGH_BRANCH_THRESHOLD
      ? this.EXTENDED_DEPTH
      : this.BASE_DEPTH;

    let bestMove: AiMove | null = null;
    let bestScore = -Infinity;

    const cache = new Map<string, number>();
    const stats: SearchStats = { nodes: 0, cacheHits: 0 };
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

    return ordered[0]?.move ?? null;
  }

  private static minimax(
    state: GameSnapshot,
    depth: number,
    maxDepth: number,
    alpha: number,
    beta: number,
    cache: Map<string, number>,
    stats: SearchStats
  ): number {
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
    let score = 0;
    const ruleSet = state.ruleSet ?? "battle";

    // Evaluate individual boards
    state.boards.forEach((board) => {
      if (board.winner === "O") {
        score += ruleSet === "modern" ? 12 : 10;
      } else if (board.winner === "X") {
        score -= ruleSet === "modern" ? 12 : 10;
      } else {
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

  private static evaluateMacro(boards: Array<{ winner: Player | null }>): number {
    let score = 0;

    for (const pattern of WIN_PATTERNS) {
      const winners = pattern.map((idx) => boards[idx]?.winner ?? null);
      const aiWins = winners.filter((mark) => mark === "O").length;
      const humanWins = winners.filter((mark) => mark === "X").length;

      if (humanWins === 0) {
        score += aiWins;
      } else if (aiWins === 0) {
        score -= humanWins;
      }
    }

    return score;
  }

  private static evaluateDirectedTargets(state: GameSnapshot, ruleSet: RuleSet): number {
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
