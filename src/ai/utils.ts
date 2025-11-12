import { Player, CellValue, GameSnapshot, AiMove, MiniBoardState } from "../core/types.js";
import { WIN_PATTERNS } from "../core/constants.js";

export class AiUtils {
  static collectCandidates(snapshot: GameSnapshot): AiMove[] {
    if (snapshot.status !== "playing") {
      return [];
    }

    const candidates: AiMove[] = [];
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

  static findImmediateWin(
    snapshot: GameSnapshot,
    candidates: AiMove[],
    player: Player
  ): AiMove | null {
    for (const move of candidates) {
      const board = snapshot.boards[move.boardIndex];
      if (!board || board.winner) {
        continue;
      }

      if (this.completesLine(board.cells, move.cellIndex, player)) {
        return move;
      }
    }

    return null;
  }

  static patternOpportunityScore(
    cells: CellValue[],
    player: Player,
    cellIndex: number
  ): number {
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
      } else if (playerCount === 2) {
        score += 2;
      } else if (playerCount === 1) {
        score += 0.5;
      }
    }

    return score;
  }

  static patternBlockScore(
    cells: CellValue[],
    opponent: Player,
    cellIndex: number
  ): number {
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

  static evaluateBoardComfort(board: MiniBoardState): number {
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

  static createsMacroThreat(snapshot: GameSnapshot, move: AiMove): boolean {
    const board = snapshot.boards[move.boardIndex];
    if (!board || board.winner) {
      return false;
    }

    if (!this.completesLine(board.cells, move.cellIndex, "O")) {
      return false;
    }

    const futureWinners = snapshot.boards.map((mini, index) => {
      if (index === move.boardIndex) {
        return "O" as Player;
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

  static completesLine(cells: CellValue[], cellIndex: number, player: Player): boolean {
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

  static boardPotential(cells: CellValue[], player: Player): number {
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
      } else if (marks === 2) {
        score += 1.5;
      } else if (marks === 1) {
        score += 0.4;
      } else {
        score += 0.1;
      }
    }

    return score;
  }

  static getOpponent(player: Player): Player {
    return player === "X" ? "O" : "X";
  }

  static findWinner(cells: CellValue[]): Player | null {
    for (const [a, b, c] of WIN_PATTERNS) {
      const mark = cells[a];
      if (mark && mark === cells[b] && mark === cells[c]) {
        return mark;
      }
    }
    return null;
  }

  static findMacroWinner(boards: MiniBoardState[]): Player | null {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      const first = boards[a]?.winner;
      if (first && first === boards[b]?.winner && first === boards[c]?.winner) {
        return first;
      }
    }
    return null;
  }
}