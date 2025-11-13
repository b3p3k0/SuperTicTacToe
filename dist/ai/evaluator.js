import { AiUtils } from "./utils.js";
const BASE_WEIGHTS = {
    battle: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 140,
        boardThreat: 18,
        boardFork: 26,
        boardCenter: 8,
        metaThreat: 120,
        activeBoardFocus: 24,
        battleStability: 30,
    },
    classic: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 150,
        boardThreat: 16,
        boardFork: 22,
        boardCenter: 8,
        metaThreat: 110,
        activeBoardFocus: 28,
        battleStability: 0,
    },
    modern: {
        terminalWin: 10000,
        terminalLoss: -10000,
        boardCaptured: 165,
        boardThreat: 14,
        boardFork: 18,
        boardCenter: 6,
        metaThreat: 130,
        activeBoardFocus: 26,
        battleStability: 0,
    },
};
export class AiEvaluator {
    static evaluate(snapshot, player, overrides) {
        var _a;
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        const weights = { ...BASE_WEIGHTS[ruleSet], ...overrides };
        const opponent = AiUtils.getOpponent(player);
        if (snapshot.status === "won") {
            return snapshot.winner === player
                ? weights.terminalWin
                : weights.terminalLoss;
        }
        if (snapshot.status === "draw") {
            return 0;
        }
        let score = 0;
        score += this.evaluateBoardOwnership(snapshot, player, opponent, weights);
        score += this.evaluateBoardThreats(snapshot, player, opponent, weights);
        score += this.evaluateMetaThreats(snapshot, player, opponent, weights);
        score += this.evaluateActiveBoard(snapshot, player, opponent, weights);
        if (ruleSet === "battle") {
            score += this.evaluateBattleStability(snapshot, player, opponent, weights);
        }
        return score;
    }
    static evaluateBoardOwnership(snapshot, player, opponent, weights) {
        const owned = snapshot.boards.filter((board) => board.winner === player).length;
        const oppOwned = snapshot.boards.filter((board) => board.winner === opponent).length;
        return (owned - oppOwned) * weights.boardCaptured;
    }
    static evaluateBoardThreats(snapshot, player, opponent, weights) {
        let playerThreats = 0;
        let opponentThreats = 0;
        let playerForks = 0;
        let opponentForks = 0;
        let centerControl = 0;
        snapshot.boards.forEach((board) => {
            playerThreats += AiUtils.countBoardThreats(board, player);
            opponentThreats += AiUtils.countBoardThreats(board, opponent);
            playerForks += AiUtils.countBoardForks(board, player);
            opponentForks += AiUtils.countBoardForks(board, opponent);
            centerControl += AiUtils.countCenterControl(board, player);
        });
        const threatScore = (playerThreats - opponentThreats) * weights.boardThreat;
        const forkScore = (playerForks - opponentForks) * weights.boardFork;
        const centerScore = centerControl * weights.boardCenter;
        return threatScore + forkScore + centerScore;
    }
    static evaluateMetaThreats(snapshot, player, opponent, weights) {
        const playerMeta = AiUtils.countMetaThreats(snapshot.boards, player);
        const opponentMeta = AiUtils.countMetaThreats(snapshot.boards, opponent);
        return (playerMeta - opponentMeta) * weights.metaThreat;
    }
    static evaluateActiveBoard(snapshot, player, opponent, weights) {
        const targetIndex = snapshot.activeBoardIndex;
        if (targetIndex === null) {
            return 0;
        }
        const board = snapshot.boards[targetIndex];
        if (!board) {
            return 0;
        }
        const playerPotential = AiUtils.boardPotential(board.cells, player);
        const opponentPotential = AiUtils.boardPotential(board.cells, opponent);
        return (playerPotential - opponentPotential) * weights.activeBoardFocus;
    }
    static evaluateBattleStability(snapshot, player, opponent, weights) {
        let playerStability = 0;
        let opponentStability = 0;
        snapshot.boards.forEach((board) => {
            playerStability += AiUtils.estimateBattleStability(board, player);
            opponentStability += AiUtils.estimateBattleStability(board, opponent);
        });
        return (playerStability - opponentStability) * weights.battleStability;
    }
}
