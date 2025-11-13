import { Difficulty, GameSnapshot, AiMove, AdaptiveBand } from "../core/types.js";
import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
import { AdaptiveTuning } from "./adaptive-tuning.js";

export class AiController {
  private difficulty: Difficulty;
  private adaptiveBand: AdaptiveBand | null;

  constructor(difficulty: Difficulty, adaptiveBand?: AdaptiveBand | null) {
    this.difficulty = difficulty;
    this.adaptiveBand = adaptiveBand ?? null;
  }

  chooseMove(snapshot: GameSnapshot): AiMove | null {
    const tuning = AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand);
    const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
    if (bookMove) {
      return bookMove;
    }
    switch (this.difficulty) {
      case "easy":
        return EasyAiStrategy.choose(snapshot, tuning.easy);
      case "hard":
        return HardAiStrategy.choose(snapshot, {
          allowJitter: true,
          ...tuning.hard,
        });
      case "expert":
        return HardAiStrategy.choose(snapshot, {
          allowJitter: false,
          ...tuning.expert,
        });
      case "normal":
      default:
        return NormalAiStrategy.choose(snapshot, tuning.normal);
    }
  }
}
