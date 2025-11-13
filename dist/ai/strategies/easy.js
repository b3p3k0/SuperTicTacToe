import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
export class EasyAiStrategy {
    static choose(snapshot, options) {
        var _a, _b, _c;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        const blockChance = (_a = options === null || options === void 0 ? void 0 : options.blockChance) !== null && _a !== void 0 ? _a : this.DEFAULT_BLOCK;
        if (Math.random() < blockChance) {
            const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
            if (blockingMove) {
                return blockingMove;
            }
        }
        // Otherwise pick based on priority + randomness
        const noise = (_b = options === null || options === void 0 ? void 0 : options.noiseScale) !== null && _b !== void 0 ? _b : this.DEFAULT_NOISE;
        const scored = candidates.map((move) => {
            var _a, _b;
            const priority = ((_a = CELL_PRIORITY[move.cellIndex]) !== null && _a !== void 0 ? _a : 0) +
                ((_b = BOARD_PRIORITY[move.boardIndex]) !== null && _b !== void 0 ? _b : 0);
            return {
                move,
                score: priority + Math.random() * noise - noise / 2,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        return ((_c = scored[0]) === null || _c === void 0 ? void 0 : _c.move) || null;
    }
}
EasyAiStrategy.DEFAULT_BLOCK = 0.45;
EasyAiStrategy.DEFAULT_NOISE = 4;
