import { AdaptiveBand, Difficulty } from "../core/types.js";

export interface EasyTuningOptions {
  blockChance: number;
  noiseScale: number;
}

export interface NormalTuningOptions {
  blunderRate: number;
  branchCap: number;
}

export interface HardTuningOptions {
  allowJitter: boolean;
  maxTimeMs?: number;
  depthAdjustment?: number;
  useMcts?: boolean;
  mctsBudgetMs?: number;
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
    const blunderRate = band === "struggle" ? 0.2 : band === "coast" ? 0.05 : 0.12;
    const branchCap = band === "coast" ? 8 : band === "struggle" ? 5 : 6;
    return { blunderRate, branchCap };
  }

  private static hardTuning(band: AdaptiveBand): HardTuningOptions {
    return {
      allowJitter: true,
      maxTimeMs: band === "coast" ? 1600 : band === "struggle" ? 650 : 1100,
      depthAdjustment: band === "coast" ? 1 : band === "struggle" ? -1 : 0,
      useMcts: band === "coast",
      mctsBudgetMs: band === "coast" ? 350 : 0,
    };
  }

  private static expertTuning(band: AdaptiveBand): HardTuningOptions {
    return {
      allowJitter: false,
      maxTimeMs: band === "coast" ? 2000 : band === "struggle" ? 900 : 1400,
      depthAdjustment: band === "coast" ? 1 : 0,
      useMcts: band !== "struggle",
      mctsBudgetMs: band === "coast" ? 450 : 250,
    };
  }
}
