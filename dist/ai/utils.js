import { WIN_PATTERNS } from "../core/constants.js";
export class AiUtils {
    static collectCandidates(snapshot) {
        if (snapshot.status !== "playing") {
            return [];
        }
        const candidates = [];
        const boardIndexes = snapshot.allowedBoards.length > 0
            ? snapshot.allowedBoards
            : snapshot.boards
                .map((board, index) => (!board.isFull ? index : -1))
                .filter((index) => index >= 0);
        boardIndexes.forEach((boardIndex) => {
            const board = snapshot.boards[boardIndex];
            if (!board) {
                return;
            }
            board.cells.forEach((value, cellIndex) => {
                if (value === null) {
                    candidates.push({ boardIndex, cellIndex });
                }
            });
        });
        return candidates;
    }
    static findImmediateWin(snapshot, candidates, player) {
        const isBattle = snapshot.ruleSet === "battle";
        for (const move of candidates) {
            const board = snapshot.boards[move.boardIndex];
            const boardLocked = (board === null || board === void 0 ? void 0 : board.winner) && (!isBattle || board.isFull);
            if (!board || boardLocked) {
                continue;
            }
            if (this.completesLine(board.cells, move.cellIndex, player)) {
                return move;
            }
        }
        return null;
    }
    static patternOpportunityScore(cells, player, cellIndex) {
        const simulated = cells.slice();
        simulated[cellIndex] = player;
        const opponent = this.getOpponent(player);
        let score = 0;
        for (const pattern of WIN_PATTERNS) {
            if (!pattern.includes(cellIndex)) {
                continue;
            }
            const marks = pattern.map((idx) => simulated[idx]);
            if (marks.includes(opponent)) {
                continue;
            }
            const playerCount = marks.filter((mark) => mark === player).length;
            if (playerCount === 3) {
                score += 5;
            }
            else if (playerCount === 2) {
                score += 2;
            }
            else if (playerCount === 1) {
                score += 0.5;
            }
        }
        return score;
    }
    static patternBlockScore(cells, opponent, cellIndex) {
        let score = 0;
        for (const pattern of WIN_PATTERNS) {
            if (!pattern.includes(cellIndex)) {
                continue;
            }
            const marks = pattern.map((idx) => cells[idx]);
            const opponentCount = marks.filter((mark) => mark === opponent).length;
            const emptyCount = marks.filter((mark) => mark === null).length;
            if (opponentCount === 2 && emptyCount === 1) {
                score += 2.5;
            }
        }
        return score;
    }
    static evaluateBoardComfort(board) {
        let score = 0;
        for (const pattern of WIN_PATTERNS) {
            const marks = pattern.map((idx) => board.cells[idx]);
            const ours = marks.filter((mark) => mark === "O").length;
            const theirs = marks.filter((mark) => mark === "X").length;
            if (theirs === 0) {
                score += ours * 0.4;
            }
            if (ours === 0 && theirs === 2) {
                score -= 1.5;
            }
        }
        return score;
    }
    static createsMacroThreat(snapshot, move) {
        const board = snapshot.boards[move.boardIndex];
        const isBattle = snapshot.ruleSet === "battle";
        const boardLocked = (board === null || board === void 0 ? void 0 : board.winner) && (!isBattle || board.isFull);
        if (!board || boardLocked) {
            return false;
        }
        if (!this.completesLine(board.cells, move.cellIndex, "O")) {
            return false;
        }
        const futureWinners = snapshot.boards.map((mini, index) => {
            if (index === move.boardIndex) {
                return "O";
            }
            return mini.winner;
        });
        return WIN_PATTERNS.some((pattern) => {
            const wins = pattern.map((idx) => futureWinners[idx]);
            const oCount = wins.filter((mark) => mark === "O").length;
            const blanks = wins.filter((mark) => !mark).length;
            return oCount === 2 && blanks === 1;
        });
    }
    static completesLine(cells, cellIndex, player) {
        return WIN_PATTERNS.some((pattern) => {
            if (!pattern.includes(cellIndex)) {
                return false;
            }
            return pattern.every((idx) => {
                if (idx === cellIndex) {
                    return true;
                }
                return cells[idx] === player;
            });
        });
    }
    static boardPotential(cells, player) {
        let score = 0;
        const opponent = this.getOpponent(player);
        for (const pattern of WIN_PATTERNS) {
            let blocked = false;
            let marks = 0;
            for (const idx of pattern) {
                if (cells[idx] === opponent) {
                    blocked = true;
                    break;
                }
                if (cells[idx] === player) {
                    marks += 1;
                }
            }
            if (blocked) {
                continue;
            }
            if (marks === 3) {
                score += 5;
            }
            else if (marks === 2) {
                score += 1.5;
            }
            else if (marks === 1) {
                score += 0.4;
            }
            else {
                score += 0.1;
            }
        }
        return score;
    }
    static countBoardThreats(board, player) {
        if (board.winner || board.isFull) {
            return 0;
        }
        return this.countLineThreats(board.cells, player);
    }
    static countBoardForks(board, player) {
        if (board.winner || board.isFull) {
            return 0;
        }
        let forkCount = 0;
        board.cells.forEach((value, cellIndex) => {
            if (value !== null) {
                return;
            }
            const threatLines = WIN_PATTERNS.filter((pattern) => {
                if (!pattern.includes(cellIndex)) {
                    return false;
                }
                let playerMarks = 0;
                let opponentMarks = 0;
                for (const idx of pattern) {
                    const mark = board.cells[idx];
                    if (mark === player) {
                        playerMarks += 1;
                    }
                    else if (mark && mark !== player) {
                        opponentMarks += 1;
                        break;
                    }
                }
                return opponentMarks === 0 && playerMarks === 1;
            }).length;
            if (threatLines >= 2) {
                forkCount += 1;
            }
        });
        return forkCount;
    }
    static countMetaThreats(boards, player) {
        return WIN_PATTERNS.reduce((total, pattern) => {
            var _a, _b;
            let playerOwned = 0;
            let opponentOwned = 0;
            let openBoards = 0;
            for (const idx of pattern) {
                const winner = (_b = (_a = boards[idx]) === null || _a === void 0 ? void 0 : _a.winner) !== null && _b !== void 0 ? _b : null;
                if (winner === player) {
                    playerOwned += 1;
                }
                else if (winner && winner !== player) {
                    opponentOwned += 1;
                    break;
                }
                else {
                    const board = boards[idx];
                    if (board && !board.isFull) {
                        openBoards += 1;
                    }
                }
            }
            if (opponentOwned > 0) {
                return total;
            }
            if (playerOwned === 2 && openBoards > 0) {
                return total + 1;
            }
            return total;
        }, 0);
    }
    static countCenterControl(board, player) {
        if (board.cells[4] === player) {
            return 1;
        }
        if (board.cells[4] === this.getOpponent(player)) {
            return -1;
        }
        return 0;
    }
    static estimateBattleStability(board, owner) {
        if (board.winner !== owner) {
            return 0;
        }
        if (board.isFull) {
            return 2;
        }
        const opponent = this.getOpponent(owner);
        const stealThreats = this.countLineThreats(board.cells, opponent);
        if (stealThreats === 0) {
            return 1.5;
        }
        if (stealThreats === 1) {
            return 0.5;
        }
        return -0.5 * stealThreats;
    }
    static countLineThreats(cells, player) {
        const opponent = this.getOpponent(player);
        let total = 0;
        for (const pattern of WIN_PATTERNS) {
            let playerMarks = 0;
            let opponentMarks = 0;
            let empties = 0;
            for (const idx of pattern) {
                const mark = cells[idx];
                if (mark === player) {
                    playerMarks += 1;
                }
                else if (mark === opponent) {
                    opponentMarks += 1;
                    break;
                }
                else {
                    empties += 1;
                }
            }
            if (opponentMarks === 0 && playerMarks === 2 && empties === 1) {
                total += 1;
            }
        }
        return total;
    }
    static getOpponent(player) {
        return player === "X" ? "O" : "X";
    }
    static findWinner(cells, priorityPlayer) {
        if (priorityPlayer) {
            if (this.hasLine(cells, priorityPlayer)) {
                return priorityPlayer;
            }
            const opponent = this.getOpponent(priorityPlayer);
            if (this.hasLine(cells, opponent)) {
                return opponent;
            }
            return null;
        }
        for (const [a, b, c] of WIN_PATTERNS) {
            const mark = cells[a];
            if (mark && mark === cells[b] && mark === cells[c]) {
                return mark;
            }
        }
        return null;
    }
    static findMacroWinner(boards) {
        var _a, _b, _c;
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            const first = (_a = boards[a]) === null || _a === void 0 ? void 0 : _a.winner;
            if (first && first === ((_b = boards[b]) === null || _b === void 0 ? void 0 : _b.winner) && first === ((_c = boards[c]) === null || _c === void 0 ? void 0 : _c.winner)) {
                return first;
            }
        }
        return null;
    }
    static hasLine(cells, player) {
        return WIN_PATTERNS.some(([a, b, c]) => {
            return cells[a] === player && cells[b] === player && cells[c] === player;
        });
    }
}
