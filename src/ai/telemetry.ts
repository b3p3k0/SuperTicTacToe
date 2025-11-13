import { AdaptiveBand, Difficulty, Player, RuleSet } from "../core/types.js";

export interface AiTelemetryEvent {
  topic: "hard-decision";
  player?: Player | null;
  difficulty: Difficulty;
  ruleSet?: RuleSet;
  adaptiveBand?: AdaptiveBand | null;
  decisionMs?: number;
  usedMcts?: boolean;
}

type TelemetryListener = (event: AiTelemetryEvent) => void;

export class AiTelemetry {
  private static listener: TelemetryListener | null = null;

  public static setListener(listener: TelemetryListener | null): void {
    this.listener = listener;
  }

  public static emit(event: AiTelemetryEvent): void {
    try {
      this.listener?.(event);
    } catch (error) {
      console.warn("AiTelemetry listener threw", error);
    }
  }
}
