import { Difficulty, RuleSet, AdaptiveBand } from "../core/types.js";
import { SoloOutcome } from "./solo-tracker.js";

interface MoveSample {
  durationMs: number;
  illegalAttempts: number;
}

interface AdaptiveBucketState {
  outcomes: number[];
  moveTimes: number[];
  illegalAttempts: number[];
  lastUpdated: number;
}

interface AdaptiveStore {
  version: number;
  enabled: boolean;
  buckets: Record<string, AdaptiveBucketState>;
}

const ADAPTIVE_STORAGE_KEY = "st3.adaptiveLoop";
const VERSION = 1;
const MAX_SAMPLES = 16;

const createDefaultBucket = (): AdaptiveBucketState => ({
  outcomes: [],
  moveTimes: [],
  illegalAttempts: [],
  lastUpdated: Date.now(),
});

export class AdaptiveLoop {
  public static isEnabled(): boolean {
    return this.load().enabled;
  }

  public static setEnabled(enabled: boolean): void {
    const store = this.load();
    store.enabled = enabled;
    this.save(store);
  }

  public static recordHumanMove(
    ruleSet: RuleSet,
    difficulty: Difficulty,
    sample: MoveSample,
  ): void {
    if (!Number.isFinite(sample.durationMs)) {
      return;
    }
    const store = this.load();
    const bucket = this.getBucket(store, ruleSet, difficulty);
    this.pushSample(bucket.moveTimes, sample.durationMs);
    this.pushSample(bucket.illegalAttempts, Math.max(0, sample.illegalAttempts));
    bucket.lastUpdated = Date.now();
    this.save(store);
  }

  public static recordOutcome(
    ruleSet: RuleSet,
    difficulty: Difficulty,
    outcome: SoloOutcome,
  ): void {
    const store = this.load();
    const bucket = this.getBucket(store, ruleSet, difficulty);
    const value = outcome === "human" ? 1 : outcome === "ai" ? -1 : 0;
    this.pushSample(bucket.outcomes, value);
    bucket.lastUpdated = Date.now();
    this.save(store);
  }

  public static getSkillBucket(
    ruleSet: RuleSet,
    difficulty: Difficulty,
  ): AdaptiveBand {
    const bucket = this.getBucket(this.load(), ruleSet, difficulty);
    const outcomeAvg = this.average(bucket.outcomes, 0);
    const moveAvg = this.average(bucket.moveTimes, 4500);
    const illegalTotal = bucket.illegalAttempts.reduce((sum, val) => sum + val, 0);
    const illegalRate = bucket.moveTimes.length > 0
      ? illegalTotal / bucket.moveTimes.length
      : 0;

    if (outcomeAvg <= -0.35 || moveAvg > 8500 || illegalRate > 0.35) {
      return "struggle";
    }
    if (outcomeAvg >= 0.35 && moveAvg < 2500 && illegalRate < 0.1) {
      return "coast";
    }
    return "flow";
  }

  public static getSnapshot(): AdaptiveStore {
    return this.load();
  }

  private static load(): AdaptiveStore {
    if (typeof window === "undefined" || !window.localStorage) {
      return this.createStore();
    }
    try {
      const raw = window.localStorage.getItem(ADAPTIVE_STORAGE_KEY);
      if (!raw) {
        return this.createStore();
      }
      const parsed = JSON.parse(raw) as AdaptiveStore;
      if (parsed.version !== VERSION) {
        return this.createStore(parsed.enabled ?? false);
      }
      return {
        version: VERSION,
        enabled: parsed.enabled ?? false,
        buckets: parsed.buckets ?? {},
      };
    } catch {
      return this.createStore();
    }
  }

  private static save(store: AdaptiveStore): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore quota errors
    }
  }

  private static createStore(enabled = false): AdaptiveStore {
    return {
      version: VERSION,
      enabled,
      buckets: {},
    };
  }

  private static getBucket(
    store: AdaptiveStore,
    ruleSet: RuleSet,
    difficulty: Difficulty,
  ): AdaptiveBucketState {
    const key = `${ruleSet}:${difficulty}`;
    if (!store.buckets[key]) {
      store.buckets[key] = createDefaultBucket();
    }
    return store.buckets[key]!;
  }

  private static pushSample(target: number[], value: number): void {
    target.push(value);
    if (target.length > MAX_SAMPLES) {
      target.shift();
    }
  }

  private static average(values: number[], fallback: number): number {
    if (values.length === 0) {
      return fallback;
    }
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
  }
}
