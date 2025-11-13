import { AiMove, GameSnapshot, Player, RuleSet } from "../core/types.js";
import { AiUtils } from "./utils.js";

interface RuleBonusOptions {
  snapshot: GameSnapshot;
  move: AiMove;
  player: Player;
}

export class RuleAwareHeuristics {
  static moveBonus(snapshot: GameSnapshot, move: AiMove, player: Player): number {
    const ruleSet: RuleSet = snapshot.ruleSet ?? "battle";

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

  static stateBonus(snapshot: GameSnapshot, player: Player): number {
    const ruleSet: RuleSet = snapshot.ruleSet ?? "battle";

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

  private static battleMoveBonus({ snapshot, move, player }: RuleBonusOptions): number {
    const opponent = AiUtils.getOpponent(player);
    let score = 0;

    const board = snapshot.boards[move.boardIndex];
    if (board && !board.isFull && board.winner) {
      if (board.winner === opponent) {
        if (AiUtils.completesLine(board.cells, move.cellIndex, player)) {
          score += 4.5; // Immediate recapture
        } else {
          score += AiUtils.patternOpportunityScore(board.cells, player, move.cellIndex) * 0.6;
        }
      } else if (board.winner === player) {
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
      } else if (targetBoard.winner === opponent) {
        score -= Math.max(-margin, 0) * 0.5; // Avoid steering into their stronghold
      }
    }

    return score;
  }

  private static classicMoveBonus({ snapshot, move, player }: RuleBonusOptions): number {
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
      } else if (targetBoard.winner === opponent && !targetBoard.isFull) {
        score -= 1.2;
      } else if (!targetBoard.winner && targetBoard.isFull) {
        score += 0.6; // Directing into an exhausted board frees our next choice
      }
    }

    return score;
  }

  private static modernMoveBonus({ snapshot, move, player }: RuleBonusOptions): number {
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
      } else {
        const aiPotential = AiUtils.boardPotential(targetBoard.cells, player);
        const opponentPotential = AiUtils.boardPotential(targetBoard.cells, opponent);
        score += (aiPotential - opponentPotential) * 0.2;
      }
    }

    return score;
  }

  private static battleStateBonus(snapshot: GameSnapshot, player: Player): number {
    const opponent = AiUtils.getOpponent(player);
    let score = 0;

    snapshot.boards.forEach((board) => {
      if (!board || !board.winner || board.isFull) {
        return;
      }
      if (board.winner === player) {
        const margin =
          AiUtils.boardPotential(board.cells, player) -
          AiUtils.boardPotential(board.cells, opponent);
        score += 3 + Math.max(margin, 0) * 0.35;
      } else if (board.winner === opponent) {
        score -= 3;
      }
    });

    return score;
  }

  private static classicStateBonus(snapshot: GameSnapshot, player: Player): number {
    const opponent = AiUtils.getOpponent(player);
    let score = 0;

    snapshot.boards.forEach((board) => {
      if (!board || !board.winner) {
        return;
      }
      if (board.winner === player) {
        score += board.isFull ? 9 : 7;
      } else if (board.winner === opponent) {
        score -= board.isFull ? 9 : 7;
      }
    });

    return score;
  }

  private static modernStateBonus(snapshot: GameSnapshot, player: Player): number {
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
      } else if (board.winner === AiUtils.getOpponent(player)) {
        score -= 10;
      }
    });

    const totalBoards = snapshot.boards.length || 1;
    const flexibility = 1 - openBoards / totalBoards;
    score += flexibility * 4; // Fewer open boards favors whoever is ahead

    return score;
  }
}
