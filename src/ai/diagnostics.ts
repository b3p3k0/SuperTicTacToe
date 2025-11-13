import { AiMove, Difficulty, RuleSet } from "../core/types.js";

interface CandidateLogEntry {
  move: AiMove;
  score: number;
}

interface DecisionLogPayload {
  difficulty: Difficulty;
  ruleSet: RuleSet;
  bestMove: AiMove | null;
  candidates?: CandidateLogEntry[];
  depth?: number;
  metadata?: Record<string, unknown>;
}

export class AiDiagnostics {
  private static readonly FLAG_KEY = "st3.aiDebug";

  static isEnabled(): boolean {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    try {
      const flag = window.localStorage.getItem(this.FLAG_KEY);
      return flag === "1" || flag === "true";
    } catch {
      return false;
    }
  }

  static logDecision(payload: DecisionLogPayload): void {
    if (!this.isEnabled()) {
      return;
    }

    const groupLabel = `[AI][${payload.ruleSet}] ${payload.difficulty.toUpperCase()}`;
    const logger = console as Console | undefined;

    if (!logger) {
      return;
    }

    const candidates = payload.candidates?.slice(0, 5) ?? [];

    logger.groupCollapsed?.(groupLabel);

    logger.log("Chosen move:", payload.bestMove);
    if (payload.depth !== undefined) {
      logger.log("Depth limit:", payload.depth);
    }
    if (payload.metadata) {
      logger.log("Extra metadata:", payload.metadata);
    }

    if (candidates.length > 0 && logger.table) {
      logger.table(
        candidates.map((entry, index) => ({
          rank: index + 1,
          board: entry.move.boardIndex + 1,
          cell: entry.move.cellIndex + 1,
          score: entry.score.toFixed(3),
        }))
      );
    }

    logger.groupEnd?.();
  }

  static setEnabled(value: boolean): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(this.FLAG_KEY, value ? "1" : "0");
    } catch {
      // no-op
    }
  }
}
