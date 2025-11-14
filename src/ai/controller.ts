import { Difficulty, GameSnapshot, AiMove, AdaptiveBand } from "../core/types.js";
import { EasyAiStrategy } from "./strategies/easy.js";
import { NormalAiStrategy } from "./strategies/normal.js";
import { HardAiStrategy } from "./strategies/hard.js";
import { OpeningBook } from "./opening-book.js";
import { AdaptiveTuning } from "./adaptive-tuning.js";
import { AiTelemetry } from "./telemetry.js";

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
    const decisionStart = this.getTimestamp();
    let usedMcts = false;
    let player: "X" | "O" | null = snapshot.currentPlayer ?? null;
    const tuning = this.adaptiveEnabled
      ? AdaptiveTuning.resolve(this.difficulty, this.adaptiveBand)
      : undefined;
    const bookMove = OpeningBook.lookup(snapshot, this.difficulty);
    if (bookMove) {
      return this.emitAfterDecision(snapshot, bookMove, decisionStart, false, player);
    }
    switch (this.difficulty) {
      case "easy":
        return this.emitAfterDecision(
          snapshot,
          EasyAiStrategy.choose(snapshot, tuning?.easy),
          decisionStart,
          usedMcts,
          player,
        );
      case "hard": {
        const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && tuning?.hard;
        const preset = adaptiveActive
          ? tuning!.hard!
          : AdaptiveTuning.staticHardPreset();
        usedMcts = !!preset.useMcts;
        return this.emitAfterDecision(
          snapshot,
          HardAiStrategy.choose(snapshot, {
            player: snapshot.currentPlayer,
            band: adaptiveActive ? this.adaptiveBand : null,
            ...preset,
          }),
          decisionStart,
          usedMcts,
          player,
        );
      }
      case "expert": {
        const adaptiveActive = this.adaptiveEnabled && !!this.adaptiveBand && tuning?.expert;
        const preset = adaptiveActive
          ? tuning!.expert!
          : AdaptiveTuning.staticExpertPreset();
        usedMcts = !!preset.useMcts;
        return this.emitAfterDecision(
          snapshot,
          HardAiStrategy.choose(snapshot, {
            player: snapshot.currentPlayer,
            band: adaptiveActive ? this.adaptiveBand : null,
            ...preset,
          }),
          decisionStart,
          usedMcts,
          player,
        );
      }
      case "normal":
      default:
        return this.emitAfterDecision(
          snapshot,
          NormalAiStrategy.choose(snapshot, tuning?.normal),
          decisionStart,
          usedMcts,
          player,
        );
    }
  }

  updateAdaptiveBand(band: AdaptiveBand | null): void {
    this.adaptiveBand = band;
  }

  private emitAfterDecision(
    snapshot: GameSnapshot,
    move: AiMove | null,
    start: number,
    usedMcts: boolean,
    player: "X" | "O" | null,
  ): AiMove | null {
    if (move) {
      this.emitTelemetry(snapshot, start, usedMcts, player);
    }
    return move;
  }

  private emitTelemetry(
    snapshot: GameSnapshot,
    start: number,
    usedMcts: boolean,
    player: "X" | "O" | null,
  ): void {
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

  private getTimestamp(): number {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }
}
