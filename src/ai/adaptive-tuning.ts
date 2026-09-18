import { AdaptiveBand, Difficulty } from "../core/types.js";
import type { EvaluationWeights } from "./evaluator.js";

export interface EasyTuningOptions {
  blockChance: number;
  noiseScale: number;
}

export interface NormalTuningOptions {
  blunderRate: number;
  maxBranches: number;
}

export interface HardTuningOptions {
  allowJitter: boolean;
  maxTimeMs?: number;
  depthAdjustment?: number;
  weightOverrides?: Partial<EvaluationWeights>;
}

export interface StrategyTuningMap {
  easy?: EasyTuningOptions;
  normal?: NormalTuningOptions;
  hard?: HardTuningOptions;
  expert?: HardTuningOptions;
}

export class AdaptiveTuning {
  public static resolve(
    difficulty: Difficulty,
    band: AdaptiveBand | null,
  ): StrategyTuningMap {
    const normalized: AdaptiveBand = band ?? "flow";
    switch (difficulty) {
      case "easy":
        return { easy: this.easyTuning(normalized) };
      case "normal":
        return { normal: this.normalTuning(normalized) };
      case "hard":
        return { hard: this.hardTuning(normalized) };
      case "expert":
        return { expert: this.expertTuning(normalized) };
      default:
        return {};
    }
  }

  private static easyTuning(band: AdaptiveBand): EasyTuningOptions {
    const blockChance = band === "struggle" ? 0.9 : band === "coast" ? 0.35 : 0.6;
    const noiseScale = band === "struggle" ? 5.5 : band === "coast" ? 3 : 4.2;
    return { blockChance, noiseScale };
  }

  private static normalTuning(band: AdaptiveBand): NormalTuningOptions {
    const blunderRate = band === "struggle" ? 0.22 : band === "coast" ? 0.05 : 0.15;
    const maxBranches = band === "coast" ? 8 : 5;
    return { blunderRate, maxBranches };
  }

  private static hardTuning(band: AdaptiveBand): HardTuningOptions {
    const isFlow = band === "flow";
    return {
      allowJitter: !isFlow,
      maxTimeMs: band === "coast" ? 1600 : band === "struggle" ? 650 : 1200,
      depthAdjustment: band === "coast" ? 1 : band === "struggle" ? -1 : 0,
    };
  }

  private static expertTuning(band: AdaptiveBand): HardTuningOptions {
    const weightOverrides: Partial<EvaluationWeights> | undefined = band === "flow"
      ? {
          metaThreat: 185,
          activeBoardFocus: 40,
          boardCaptured: 200,
          boardThreat: 24,
          battleStability: 45,
        }
      : band === "coast"
        ? {
            metaThreat: 160,
            activeBoardFocus: 34,
          }
        : undefined;
    return {
      allowJitter: false,
      maxTimeMs: band === "coast" ? 2000 : band === "struggle" ? 900 : 2200,
      depthAdjustment: band === "coast" ? 1 : band === "struggle" ? -1 : 2,
      ...(weightOverrides ? { weightOverrides } : {}),
    };
  }

  public static staticHardPreset(): HardTuningOptions {
    return {
      allowJitter: true,
      maxTimeMs: 1100,
      depthAdjustment: 0,
    };
  }

  public static staticExpertPreset(): HardTuningOptions {
    return {
      allowJitter: false,
      maxTimeMs: 1500,
      depthAdjustment: 0,
    };
  }
}
