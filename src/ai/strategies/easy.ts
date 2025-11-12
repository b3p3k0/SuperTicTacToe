import { GameSnapshot, AiMove } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";

export class EasyAiStrategy {
  static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    // Always take an immediate win
    const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
    if (winningMove) {
      return winningMove;
    }

    // Sometimes block opponent wins (45% chance)
    if (Math.random() < 0.45) {
      const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
      if (blockingMove) {
        return blockingMove;
      }
    }

    // Otherwise pick based on priority + randomness
    const scored = candidates.map((move) => {
      const priority = (CELL_PRIORITY[move.cellIndex] ?? 0) +
                      (BOARD_PRIORITY[move.boardIndex] ?? 0);
      return {
        move,
        score: priority + Math.random() * 4 - 2,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.move || null;
  }
}