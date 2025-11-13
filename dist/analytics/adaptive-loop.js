const STORAGE_KEY = "st3.adaptiveLoop";
const VERSION = 1;
const MAX_SAMPLES = 16;
const createDefaultBucket = () => ({
    outcomes: [],
    moveTimes: [],
    illegalAttempts: [],
    lastUpdated: Date.now(),
});
export class AdaptiveLoop {
    static isEnabled() {
        return this.load().enabled;
    }
    static setEnabled(enabled) {
        const store = this.load();
        store.enabled = enabled;
        this.save(store);
    }
    static recordHumanMove(ruleSet, difficulty, sample) {
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
    static recordOutcome(ruleSet, difficulty, outcome) {
        const store = this.load();
        const bucket = this.getBucket(store, ruleSet, difficulty);
        const value = outcome === "human" ? 1 : outcome === "ai" ? -1 : 0;
        this.pushSample(bucket.outcomes, value);
        bucket.lastUpdated = Date.now();
        this.save(store);
    }
    static getSkillBucket(ruleSet, difficulty) {
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
    static getSnapshot() {
        return this.load();
    }
    static load() {
        var _a, _b, _c;
        if (typeof window === "undefined" || !window.localStorage) {
            return this.createStore();
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return this.createStore();
            }
            const parsed = JSON.parse(raw);
            if (parsed.version !== VERSION) {
                return this.createStore((_a = parsed.enabled) !== null && _a !== void 0 ? _a : false);
            }
            return {
                version: VERSION,
                enabled: (_b = parsed.enabled) !== null && _b !== void 0 ? _b : false,
                buckets: (_c = parsed.buckets) !== null && _c !== void 0 ? _c : {},
            };
        }
        catch (_d) {
            return this.createStore();
        }
    }
    static save(store) {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        }
        catch (_a) {
            // ignore quota errors
        }
    }
    static createStore(enabled = false) {
        return {
            version: VERSION,
            enabled,
            buckets: {},
        };
    }
    static getBucket(store, ruleSet, difficulty) {
        const key = `${ruleSet}:${difficulty}`;
        if (!store.buckets[key]) {
            store.buckets[key] = createDefaultBucket();
        }
        return store.buckets[key];
    }
    static pushSample(target, value) {
        target.push(value);
        if (target.length > MAX_SAMPLES) {
            target.shift();
        }
    }
    static average(values, fallback) {
        if (values.length === 0) {
            return fallback;
        }
        const total = values.reduce((sum, value) => sum + value, 0);
        return total / values.length;
    }
}
