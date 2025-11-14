import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
import { AdaptiveTuning } from "./adaptive-tuning.js";
import { AiTelemetry } from "./telemetry.js";
export class AiController {
    constructor(difficulty, adaptiveBand, adaptiveEnabled = false) {
        this.difficulty = difficulty;
        this.adaptiveBand = adaptiveBand !== null && adaptiveBand !== void 0 ? adaptiveBand : null;
        this.adaptiveEnabled = adaptiveEnabled;
    }
    chooseMove(snapshot) {
        var _a;
        const decisionStart = this.getTimestamp();
        let usedMcts = false;
        let player = (_a = snapshot.currentPlayer) !== null && _a !== void 0 ? _a : null;
        const tuning = this.adaptiveEnabled
            ? AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand)
            : undefined;
        const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
        if (bookMove) {
            return this.emitAfterDecision(snapshot, bookMove, decisionStart, false, player);
        }
        switch (this.difficulty) {
            case "easy":
                return this.emitAfterDecision(snapshot, EasyAiStrategy.choose(snapshot, tuning === null || tuning === void 0 ? void 0 : tuning.easy), decisionStart, usedMcts, player);
            case "hard": {
                const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && (tuning === null || tuning === void 0 ? void 0 : tuning.hard);
                const preset = adaptiveActive
                    ? tuning.hard
                    : AdaptiveTuning.staticHardPreset();
                usedMcts = !!preset.useMcts;
                return this.emitAfterDecision(snapshot, HardAiStrategy.choose(snapshot, {
                    player: snapshot.currentPlayer,
                    band: adaptiveActive ? this.adaptiveBand : null,
                    ...preset,
                }), decisionStart, usedMcts, player);
            }
            case "expert": {
                const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && (tuning === null || tuning === void 0 ? void 0 : tuning.expert);
                const preset = adaptiveActive
                    ? tuning.expert
                    : AdaptiveTuning.staticExpertPreset();
                usedMcts = !!preset.useMcts;
                return this.emitAfterDecision(snapshot, HardAiStrategy.choose(snapshot, {
                    player: snapshot.currentPlayer,
                    band: adaptiveActive ? this.adaptiveBand : null,
                    ...preset,
                }), decisionStart, usedMcts, player);
            }
            case "normal":
            default:
                return this.emitAfterDecision(snapshot, NormalAiStrategy.choose(snapshot, tuning === null || tuning === void 0 ? void 0 : tuning.normal), decisionStart, usedMcts, player);
        }
    }
    updateAdaptiveBand(band) {
        this.adaptiveBand = band;
    }
    emitAfterDecision(snapshot, move, start, usedMcts, player) {
        if (move) {
            this.emitTelemetry(snapshot, start, usedMcts, player);
        }
        return move;
    }
    emitTelemetry(snapshot, start, usedMcts, player) {
        const decisionMs = Math.max(0, this.getTimestamp() - start);
        AiTelemetry.emit({
            topic: "ai-decision",
            difficulty: this.difficulty,
            ruleSet: snapshot.ruleSet,
            adaptiveBand: this.adaptiveBand,
            usedMcts,
            decisionMs,
            player,
        });
    }
    getTimestamp() {
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            return performance.now();
        }
        return Date.now();
    }
}
