import { GameSnapshot, AiMove } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";

export interface EasyStrategyOptions {
  blockChance?: number;
  noiseScale?: number;
}

export class EasyAiStrategy {
  private static readonly DEFAULT_BLOCK = 0.45;
  private static readonly DEFAULT_NOISE = 4;

  static choose(snapshot: GameSnapshot, options?: EasyStrategyOptions): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    // Always take an immediate win
    const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
    if (winningMove) {
      return winningMove;
    }

    const blockChance = options?.blockChance ?? this.DEFAULT_BLOCK;
    if (Math.random() < blockChance) {
      const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
      if (blockingMove) {
        return blockingMove;
      }
    }

    // Otherwise pick based on priority + randomness
    const noise = options?.noiseScale ?? this.DEFAULT_NOISE;
    const scored = candidates.map((move) => {
      const priority = (CELL_PRIORITY[move.cellIndex] ?? 0) +
                      (BOARD_PRIORITY[move.boardIndex] ?? 0);
      return {
        move,
        score: priority + Math.random() * noise - noise / 2,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.move || null;
  }
}
