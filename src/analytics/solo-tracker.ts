import { Difficulty, RuleSet } from "../core/types.js";

export type SoloOutcome = "human" | "ai" | "draw";

interface OutcomeBuckets {
  human: number;
  ai: number;
  draw: number;
}

interface SoloStatsSnapshot {
  totals: OutcomeBuckets;
  byRule: Record<RuleSet, OutcomeBuckets>;
  byDifficulty: Record<Difficulty, OutcomeBuckets>;
  lastUpdated: number;
}

const STORAGE_KEY = "st3.soloStats";
const RULE_SET_KEYS: RuleSet[] = ["classic", "modern", "battle"];
const DIFFICULTY_KEYS: Difficulty[] = ["easy", "normal", "hard", "expert"];

export class SoloStatsTracker {
  static record(ruleSet: RuleSet, difficulty: Difficulty, outcome: SoloOutcome): void {
    const stats = this.load();
    this.increment(stats.totals, outcome);
    this.increment(stats.byRule[ruleSet], outcome);
    this.increment(stats.byDifficulty[difficulty], outcome);
    stats.lastUpdated = Date.now();

    this.save(stats);
    this.logToConsole(ruleSet, difficulty, outcome, stats);
  }

  static getStats(): SoloStatsSnapshot | null {
    if (!this.hasStorage()) {
      return null;
    }
    return this.load();
  }

  private static increment(bucket: OutcomeBuckets, outcome: SoloOutcome): void {
    if (outcome === "human") {
      bucket.human += 1;
    } else if (outcome === "ai") {
      bucket.ai += 1;
    } else {
      bucket.draw += 1;
    }
  }

  private static createEmptySnapshot(): SoloStatsSnapshot {
    const totals = this.createEmptyBucket();
    const byRule: Record<RuleSet, OutcomeBuckets> = {
      classic: this.createEmptyBucket(),
      modern: this.createEmptyBucket(),
      battle: this.createEmptyBucket(),
    };
    const byDifficulty: Record<Difficulty, OutcomeBuckets> = {
      easy: this.createEmptyBucket(),
      normal: this.createEmptyBucket(),
      hard: this.createEmptyBucket(),
      expert: this.createEmptyBucket(),
    };

    return {
      totals,
      byRule,
      byDifficulty,
      lastUpdated: Date.now(),
    };
  }

  private static createEmptyBucket(): OutcomeBuckets {
    return { human: 0, ai: 0, draw: 0 };
  }

  private static load(): SoloStatsSnapshot {
    const defaults = this.createEmptySnapshot();
    if (!this.hasStorage()) {
      return defaults;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaults;
      }

      const parsed = JSON.parse(raw) as Partial<SoloStatsSnapshot>;
      return this.mergeSnapshots(defaults, parsed);
    } catch {
      return defaults;
    }
  }

  private static mergeSnapshots(
    base: SoloStatsSnapshot,
    patch: Partial<SoloStatsSnapshot>
  ): SoloStatsSnapshot {
    if (patch.totals) {
      base.totals = this.mergeBuckets(base.totals, patch.totals);
    }

    if (patch.byRule) {
      RULE_SET_KEYS.forEach((key) => {
        if (patch.byRule?.[key]) {
          base.byRule[key] = this.mergeBuckets(base.byRule[key], patch.byRule[key]!);
        }
      });
    }

    if (patch.byDifficulty) {
      DIFFICULTY_KEYS.forEach((key) => {
        if (patch.byDifficulty?.[key]) {
          base.byDifficulty[key] = this.mergeBuckets(
            base.byDifficulty[key],
            patch.byDifficulty[key]!
          );
        }
      });
    }

    if (typeof patch.lastUpdated === "number") {
      base.lastUpdated = patch.lastUpdated;
    }

    return base;
  }

  private static mergeBuckets(base: OutcomeBuckets, patch?: OutcomeBuckets): OutcomeBuckets {
    if (!patch) {
      return base;
    }

    return {
      human: patch.human ?? base.human,
      ai: patch.ai ?? base.ai,
      draw: patch.draw ?? base.draw,
    };
  }

  private static save(stats: SoloStatsSnapshot): void {
    if (!this.hasStorage()) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore quota errors
    }
  }

  private static logToConsole(
    ruleSet: RuleSet,
    difficulty: Difficulty,
    outcome: SoloOutcome,
    stats: SoloStatsSnapshot
  ): void {
    if (typeof console === "undefined") {
      return;
    }

    const label = `[ST3] Solo stats update (${ruleSet} · ${difficulty}) → ${outcome.toUpperCase()}`;
    console.info(label);
    console.table?.(stats.totals);
  }

  private static hasStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }
}
