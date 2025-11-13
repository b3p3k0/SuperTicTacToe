import { Difficulty, GameSnapshot, AiMove, AdaptiveBand } from "../core/types.js";
import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
import { AdaptiveTuning } from "./adaptive-tuning.js";

export class AiController {
  private difficulty: Difficulty;
  private adaptiveBand: AdaptiveBand | null;
  private adaptiveEnabled: boolean;

  constructor(
    difficulty: Difficulty,
    adaptiveBand?: AdaptiveBand | null,
    adaptiveEnabled = false,
  ) {
    this.difficulty = difficulty;
    this.adaptiveBand = adaptiveBand ?? null;
    this.adaptiveEnabled = adaptiveEnabled;
  }

  chooseMove(snapshot: GameSnapshot): AiMove | null {
    const tuning = this.adaptiveEnabled
      ? AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand)
      : undefined;
    const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
    if (bookMove) {
      return bookMove;
    }
    switch (this.difficulty) {
      case "easy":
        return EasyAiStrategy.choose(snapshot, tuning?.easy);
      case "hard": {
        const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && tuning?.hard;
        const preset = adaptiveActive
          ? tuning!.hard!
          : AdaptiveTuning.staticHardPreset();
        return HardAiStrategy.choose(snapshot, {
          player: snapshot.currentPlayer,
          band: adaptiveActive ? this.adaptiveBand : null,
          ...preset,
        });
      }
      case "expert": {
        const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && tuning?.expert;
        const preset = adaptiveActive
          ? tuning!.expert!
          : AdaptiveTuning.staticExpertPreset();
        return HardAiStrategy.choose(snapshot, {
          player: snapshot.currentPlayer,
          band: adaptiveActive ? this.adaptiveBand : null,
          ...preset,
        });
      }
      case "normal":
      default:
        return NormalAiStrategy.choose(snapshot, tuning?.normal);
    }
  }

  updateAdaptiveBand(band: AdaptiveBand | null): void {
    this.adaptiveBand = band;
  }
}
