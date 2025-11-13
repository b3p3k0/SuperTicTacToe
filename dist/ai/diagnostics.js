export class AiDiagnostics {
    static isEnabled() {
        if (typeof window === "undefined" || !window.localStorage) {
            return false;
        }
        try {
            const flag = window.localStorage.getItem(this.FLAG_KEY);
            return flag === "1" || flag === "true";
        }
        catch (_a) {
            return false;
        }
    }
    static logDecision(payload) {
        var _a, _b, _c, _d;
        if (!this.isEnabled()) {
            return;
        }
        const groupLabel = `[AI][${payload.ruleSet}] ${payload.difficulty.toUpperCase()}`;
        const logger = console;
        if (!logger) {
            return;
        }
        const candidates = (_b = (_a = payload.candidates) === null || _a === void 0 ? void 0 : _a.slice(0, 5)) !== null && _b !== void 0 ? _b : [];
        (_c = logger.groupCollapsed) === null || _c === void 0 ? void 0 : _c.call(logger, groupLabel);
        logger.log("Chosen move:", payload.bestMove);
        if (payload.depth !== undefined) {
            logger.log("Depth limit:", payload.depth);
        }
        if (payload.metadata) {
            logger.log("Extra metadata:", payload.metadata);
        }
        if (candidates.length > 0 && logger.table) {
            logger.table(candidates.map((entry, index) => ({
                rank: index + 1,
                board: entry.move.boardIndex + 1,
                cell: entry.move.cellIndex + 1,
                score: entry.score.toFixed(3),
            })));
        }
        (_d = logger.groupEnd) === null || _d === void 0 ? void 0 : _d.call(logger);
    }
    static setEnabled(value) {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        try {
            window.localStorage.setItem(this.FLAG_KEY, value ? "1" : "0");
        }
        catch (_a) {
            // no-op
        }
    }
}
AiDiagnostics.FLAG_KEY = "st3.aiDebug";
