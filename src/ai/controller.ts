import { Difficulty, GameSnapshot, AiMove } from "../core/types.js";
import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";

export class AiController {
  private difficulty: Difficulty;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  chooseMove(snapshot: GameSnapshot): AiMove | null {
    switch (this.difficulty) {
      case "easy":
        return EasyAiStrategy.choose(snapshot);
      case "hard":
        return HardAiStrategy.choose(snapshot);
      case "normal":
      default:
        return NormalAiStrategy.choose(snapshot);
    }
  }
}