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
        return this.computeScore(snapshot, player, overrides).score;
    }
    static evaluateDetailed(snapshot, player, overrides) {
        return this.computeScore(snapshot, player, overrides);
    }
    static computeScore(snapshot, player, overrides) {
        var _a;
        const ruleSet = (_a = snapshot.ruleSet) !== null && _a !== void 0 ? _a : "battle";
        const weights = { ...BASE_WEIGHTS[ruleSet], ...overrides };
        const opponent = AiUtils.getOpponent(player);
        const breakdown = {
            terminal: 0,
            ownership: 0,
            threats: 0,
            meta: 0,
            routing: 0,
            battle: 0,
            total: 0,
        };
        if (snapshot.status === "won") {
            breakdown.terminal = snapshot.winner === player
                ? weights.terminalWin
                : weights.terminalLoss;
            breakdown.total = breakdown.terminal;
            return { score: breakdown.total, breakdown };
        }
        if (snapshot.status === "draw") {
            return { score: 0, breakdown };
        }
        breakdown.ownership = this.evaluateBoardOwnership(snapshot, player, opponent, weights);
        breakdown.threats = this.evaluateBoardThreats(snapshot, player, opponent, weights);
        breakdown.meta = this.evaluateMetaThreats(snapshot, player, opponent, weights);
        breakdown.routing = this.evaluateActiveBoard(snapshot, player, opponent, weights);
        breakdown.battle = ruleSet === "battle"
            ? this.evaluateBattleStability(snapshot, player, opponent, weights)
            : 0;
        breakdown.total =
            breakdown.terminal +
                breakdown.ownership +
                breakdown.threats +
                breakdown.meta +
                breakdown.routing +
                breakdown.battle;
        return { score: breakdown.total, breakdown };
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
