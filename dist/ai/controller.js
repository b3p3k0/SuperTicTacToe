import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
export class AiController {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }
    chooseMove(snapshot) {
        const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
        if (bookMove) {
            return bookMove;
        }
        switch (this.difficulty) {
            case "easy":
                return EasyAiStrategy.choose(snapshot);
            case "hard":
                return HardAiStrategy.choose(snapshot, { allowJitter: true });
            case "expert":
                return HardAiStrategy.choose(snapshot);
            case "normal":
            default:
                return NormalAiStrategy.choose(snapshot);
        }
    }
}
