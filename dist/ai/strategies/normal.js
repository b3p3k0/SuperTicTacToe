import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
export class NormalAiStrategy {
    static choose(snapshot) {
        const candidates = AiUtils.collectCandidates(snapshot);
        if (candidates.length === 0) {
            return null;
        }
        // Always take an immediate win
        const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
        if (winningMove) {
            return winningMove;
        }
        // Always block opponent wins
        const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
        if (blockingMove) {
            return blockingMove;
        }
        // Use scoring heuristics for other moves
        return this.scoreAndPick(snapshot, candidates);
    }
    static scoreAndPick(snapshot, candidates) {
        if (candidates.length === 0) {
            throw new Error("No candidates available");
        }
        let bestMove = candidates[0];
        let bestScore = -Infinity;
        for (const move of candidates) {
            const score = this.scoreMove(snapshot, move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
    static scoreMove(snapshot, move) {
        var _a, _b;
        const board = snapshot.boards[move.boardIndex];
        if (!board) {
            return -Infinity;
        }
        let score = 0;
        const isBattle = snapshot.ruleSet === "battle";
        const contestedBoard = Boolean(board.winner && isBattle && !board.isFull);
        // Base priority scores
        score += (_a = BOARD_PRIORITY[move.boardIndex]) !== null && _a !== void 0 ? _a : 0;
        score += (_b = CELL_PRIORITY[move.cellIndex]) !== null && _b !== void 0 ? _b : 0;
        // Board-level scoring
        if (!board.winner || contestedBoard) {
            score += AiUtils.patternOpportunityScore(board.cells, "O", move.cellIndex);
            score += AiUtils.patternBlockScore(board.cells, "X", move.cellIndex);
        }
        else if (board.winner === "X") {
            score -= isBattle ? 0.75 : 2;
        }
        else if (board.winner === "O") {
            score -= isBattle ? 0.25 : 0.5;
        }
        // Target board evaluation
        const targetBoardIndex = move.cellIndex;
        const targetBoard = snapshot.boards[targetBoardIndex];
        if (targetBoard) {
            if (targetBoard.isFull) {
                score += 2; // Sending opponent to full board is good
            }
            else if (targetBoard.winner === "O") {
                score += isBattle ? 0.75 : 1.5; // Still decent in battle, but riskier
            }
            else if (targetBoard.winner === "X") {
                score -= isBattle ? 0.75 : 1.5; // Smaller penalty in battle—they're vulnerable too
            }
            else {
                score += AiUtils.evaluateBoardComfort(targetBoard);
            }
        }
        else {
            score += 0.5;
        }
        // Macro-level threat creation
        if (AiUtils.createsMacroThreat(snapshot, move)) {
            score += 2.5;
        }
        // Add tiny random factor for tie-breaking
        return score + Math.random() * 0.001;
    }
}
