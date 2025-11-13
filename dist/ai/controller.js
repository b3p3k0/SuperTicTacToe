import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
import { AdaptiveTuning } from "./adaptive-tuning.js";
export class AiController {
    constructor(difficulty, adaptiveBand, adaptiveEnabled = false) {
        this.difficulty = difficulty;
        this.adaptiveBand = adaptiveBand !== null && adaptiveBand !== void 0 ? adaptiveBand : null;
        this.adaptiveEnabled = adaptiveEnabled;
    }
    chooseMove(snapshot) {
        const tuning = this.adaptiveEnabled
            ? AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand)
            : undefined;
        const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
        if (bookMove) {
            return bookMove;
        }
        switch (this.difficulty) {
            case "easy":
                return EasyAiStrategy.choose(snapshot, tuning === null || tuning === void 0 ? void 0 : tuning.easy);
            case "hard": {
                const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && (tuning === null || tuning === void 0 ? void 0 : tuning.hard);
                const preset = adaptiveActive
                    ? tuning.hard
                    : AdaptiveTuning.staticHardPreset();
                return HardAiStrategy.choose(snapshot, {
                    player: snapshot.currentPlayer,
                    band: adaptiveActive ? this.adaptiveBand : null,
                    ...preset,
                });
            }
            case "expert": {
                const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && (tuning === null || tuning === void 0 ? void 0 : tuning.expert);
                const preset = adaptiveActive
                    ? tuning.expert
                    : AdaptiveTuning.staticExpertPreset();
                return HardAiStrategy.choose(snapshot, {
                    player: snapshot.currentPlayer,
                    band: adaptiveActive ? this.adaptiveBand : null,
                    ...preset,
                });
            }
            case "normal":
            default:
                return NormalAiStrategy.choose(snapshot, tuning === null || tuning === void 0 ? void 0 : tuning.normal);
        }
    }
    updateAdaptiveBand(band) {
        this.adaptiveBand = band;
    }
}
