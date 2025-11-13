const STORAGE_KEY = "st3.soloStats";
const RULE_SET_KEYS = ["classic", "modern", "battle"];
const DIFFICULTY_KEYS = ["easy", "normal", "hard"];
export class SoloStatsTracker {
    static record(ruleSet, difficulty, outcome) {
        const stats = this.load();
        this.increment(stats.totals, outcome);
        this.increment(stats.byRule[ruleSet], outcome);
        this.increment(stats.byDifficulty[difficulty], outcome);
        stats.lastUpdated = Date.now();
        this.save(stats);
        this.logToConsole(ruleSet, difficulty, outcome, stats);
    }
    static getStats() {
        if (!this.hasStorage()) {
            return null;
        }
        return this.load();
    }
    static increment(bucket, outcome) {
        if (outcome === "human") {
            bucket.human += 1;
        }
        else if (outcome === "ai") {
            bucket.ai += 1;
        }
        else {
            bucket.draw += 1;
        }
    }
    static createEmptySnapshot() {
        const totals = this.createEmptyBucket();
        const byRule = {
            classic: this.createEmptyBucket(),
            modern: this.createEmptyBucket(),
            battle: this.createEmptyBucket(),
        };
        const byDifficulty = {
            easy: this.createEmptyBucket(),
            normal: this.createEmptyBucket(),
            hard: this.createEmptyBucket(),
        };
        return {
            totals,
            byRule,
            byDifficulty,
            lastUpdated: Date.now(),
        };
    }
    static createEmptyBucket() {
        return { human: 0, ai: 0, draw: 0 };
    }
    static load() {
        const defaults = this.createEmptySnapshot();
        if (!this.hasStorage()) {
            return defaults;
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return defaults;
            }
            const parsed = JSON.parse(raw);
            return this.mergeSnapshots(defaults, parsed);
        }
        catch (_a) {
            return defaults;
        }
    }
    static mergeSnapshots(base, patch) {
        if (patch.totals) {
            base.totals = this.mergeBuckets(base.totals, patch.totals);
        }
        if (patch.byRule) {
            RULE_SET_KEYS.forEach((key) => {
                var _a;
                if ((_a = patch.byRule) === null || _a === void 0 ? void 0 : _a[key]) {
                    base.byRule[key] = this.mergeBuckets(base.byRule[key], patch.byRule[key]);
                }
            });
        }
        if (patch.byDifficulty) {
            DIFFICULTY_KEYS.forEach((key) => {
                var _a;
                if ((_a = patch.byDifficulty) === null || _a === void 0 ? void 0 : _a[key]) {
                    base.byDifficulty[key] = this.mergeBuckets(base.byDifficulty[key], patch.byDifficulty[key]);
                }
            });
        }
        if (typeof patch.lastUpdated === "number") {
            base.lastUpdated = patch.lastUpdated;
        }
        return base;
    }
    static mergeBuckets(base, patch) {
        var _a, _b, _c;
        if (!patch) {
            return base;
        }
        return {
            human: (_a = patch.human) !== null && _a !== void 0 ? _a : base.human,
            ai: (_b = patch.ai) !== null && _b !== void 0 ? _b : base.ai,
            draw: (_c = patch.draw) !== null && _c !== void 0 ? _c : base.draw,
        };
    }
    static save(stats) {
        if (!this.hasStorage()) {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        }
        catch (_a) {
            // Ignore quota errors
        }
    }
    static logToConsole(ruleSet, difficulty, outcome, stats) {
        var _a;
        if (typeof console === "undefined") {
            return;
        }
        const label = `[ST3] Solo stats update (${ruleSet} · ${difficulty}) → ${outcome.toUpperCase()}`;
        console.info(label);
        (_a = console.table) === null || _a === void 0 ? void 0 : _a.call(console, stats.totals);
    }
    static hasStorage() {
        return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    }
}
