import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
export class EasyAiStrategy {
    static choose(snapshot) {
        var _a;
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        // Sometimes block opponent wins (45% chance)
        if (Math.random() < 0.45) {
            const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
            if (blockingMove) {
                return blockingMove;
            }
        }
        // Otherwise pick based on priority + randomness
        const scored = candidates.map((move) => {
            var _a, _b;
            const priority = ((_a = CELL_PRIORITY[move.cellIndex]) !== null && _a !== void 0 ? _a : 0) +
                ((_b = BOARD_PRIORITY[move.boardIndex]) !== null && _b !== void 0 ? _b : 0);
            return {
                move,
                score: priority + Math.random() * 4 - 2,
            };
        });
        scored.sort((a, b) => b.score - a.score);
        return ((_a = scored[0]) === null || _a === void 0 ? void 0 : _a.move) || null;
    }
}
