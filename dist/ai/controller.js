import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
export class AiController {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
    chooseMove(snapshot) {
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
