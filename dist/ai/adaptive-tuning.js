export class AdaptiveTuning {
    static resolve(difficulty, band) {
        const normalized = band !== null && band !== void 0 ? band : "flow";
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
    static easyTuning(band) {
        const blockChance = band === "struggle" ? 0.9 : band === "coast" ? 0.35 : 0.6;
        const noiseScale = band === "struggle" ? 5.5 : band === "coast" ? 3 : 4.2;
        return { blockChance, noiseScale };
    }
    static normalTuning(band) {
        const blunderRate = band === "struggle" ? 0.2 : band === "coast" ? 0.05 : 0.12;
        const branchCap = band === "coast" ? 8 : band === "struggle" ? 5 : 6;
        return { blunderRate, branchCap };
    }
    static hardTuning(band) {
        return {
            allowJitter: true,
            maxTimeMs: band === "coast" ? 1600 : band === "struggle" ? 650 : 1100,
            depthAdjustment: band === "coast" ? 1 : band === "struggle" ? -1 : 0,
            useMcts: band === "coast",
            mctsBudgetMs: band === "coast" ? 350 : 0,
        };
    }
    static expertTuning(band) {
        return {
            allowJitter: false,
            maxTimeMs: band === "coast" ? 2000 : band === "struggle" ? 900 : 1400,
            depthAdjustment: band === "coast" ? 1 : 0,
            useMcts: band !== "struggle",
            mctsBudgetMs: band === "coast" ? 450 : 250,
        };
    }
}
