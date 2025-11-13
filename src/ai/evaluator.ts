import { GameSnapshot, Player, RuleSet } from "../core/types.js";
import { AiUtils } from "./utils.js";

export interface EvaluationWeights {
  terminalWin: number;
  terminalLoss: number;
  boardCaptured: number;
  boardThreat: number;
  boardFork: number;
  boardCenter: number;
  metaThreat: number;
  activeBoardFocus: number;
  battleStability: number;
}

export interface EvaluationBreakdown {
  terminal: number;
  ownership: number;
  threats: number;
  meta: number;
  routing: number;
  battle: number;
  total: number;
}

interface EvaluationResult {
  score: number;
  breakdown: EvaluationBreakdown;
}

const BASE_WEIGHTS: Record<RuleSet, EvaluationWeights> = {
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

export class AiEvaluator {
  public static evaluate(
    snapshot: GameSnapshot,
    player: Player,
    overrides?: Partial<EvaluationWeights>,
  ): number {
    return this.computeScore(snapshot, player, overrides).score;
  }

  public static evaluateDetailed(
    snapshot: GameSnapshot,
    player: Player,
    overrides?: Partial<EvaluationWeights>,
  ): EvaluationResult {
    return this.computeScore(snapshot, player, overrides);
  }

  private static computeScore(
    snapshot: GameSnapshot,
    player: Player,
    overrides?: Partial<EvaluationWeights>,
  ): EvaluationResult {
    const ruleSet: RuleSet = snapshot.ruleSet ?? "battle";
    const weights = { ...BASE_WEIGHTS[ruleSet], ...overrides };
    const opponent = AiUtils.getOpponent(player);
    const breakdown: EvaluationBreakdown = {
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

  private static evaluateBoardOwnership(
    snapshot: GameSnapshot,
    player: Player,
    opponent: Player,
    weights: EvaluationWeights,
  ): number {
    const owned = snapshot.boards.filter((board) => board.winner === player).length;
    const oppOwned = snapshot.boards.filter((board) => board.winner === opponent).length;
    return (owned - oppOwned) * weights.boardCaptured;
  }

  private static evaluateBoardThreats(
    snapshot: GameSnapshot,
    player: Player,
    opponent: Player,
    weights: EvaluationWeights,
  ): number {
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

  private static evaluateMetaThreats(
    snapshot: GameSnapshot,
    player: Player,
    opponent: Player,
    weights: EvaluationWeights,
  ): number {
    const playerMeta = AiUtils.countMetaThreats(snapshot.boards, player);
    const opponentMeta = AiUtils.countMetaThreats(snapshot.boards, opponent);
    return (playerMeta - opponentMeta) * weights.metaThreat;
  }

  private static evaluateActiveBoard(
    snapshot: GameSnapshot,
    player: Player,
    opponent: Player,
    weights: EvaluationWeights,
  ): number {
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

  private static evaluateBattleStability(
    snapshot: GameSnapshot,
    player: Player,
    opponent: Player,
    weights: EvaluationWeights,
  ): number {
    let playerStability = 0;
    let opponentStability = 0;
    snapshot.boards.forEach((board) => {
      playerStability += AiUtils.estimateBattleStability(board, player);
      opponentStability += AiUtils.estimateBattleStability(board, opponent);
    });
    return (playerStability - opponentStability) * weights.battleStability;
  }
}
