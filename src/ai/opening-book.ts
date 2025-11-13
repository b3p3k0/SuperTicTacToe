import { AiMove, Difficulty, GameSnapshot, HistoryEntry, MoveInfo } from "../core/types.js";

interface BookEntry {
  ruleSet: string;
  openingId: string;
  moves: Array<{ board: number; cell: number }>;
  appliesTo: Difficulty[];
}

const BOOK: BookEntry[] = [
  {
    ruleSet: "battle",
    openingId: "ai-first-center",
    moves: [{ board: 4, cell: 4 }],
    appliesTo: ["normal", "hard", "expert"],
  },
  {
    ruleSet: "classic",
    openingId: "ai-first-center",
    moves: [{ board: 4, cell: 4 }],
    appliesTo: ["normal", "hard", "expert"],
  },
  {
    ruleSet: "modern",
    openingId: "ai-first-center",
    moves: [{ board: 4, cell: 4 }],
    appliesTo: ["normal", "hard", "expert"],
  },
  {
    ruleSet: "battle",
    openingId: "human-center-response",
    moves: [
      { board: 4, cell: 4 },
      { board: 0, cell: 0 },
    ],
    appliesTo: ["normal", "hard"],
  },
  {
    ruleSet: "classic",
    openingId: "human-center-response",
    moves: [
      { board: 4, cell: 4 },
      { board: 8, cell: 8 },
    ],
    appliesTo: ["expert"],
  },
  {
    ruleSet: "modern",
    openingId: "human-center-response",
    moves: [
      { board: 4, cell: 4 },
      { board: 2, cell: 2 },
    ],
    appliesTo: ["expert"],
  },
  {
    ruleSet: "classic",
    openingId: "human-center-corner",
    moves: [
      { board: 4, cell: 4 },
      { board: 4, cell: 8 },
    ],
    appliesTo: ["expert"],
  },
  {
    ruleSet: "modern",
    openingId: "human-center-corner",
    moves: [
      { board: 4, cell: 4 },
      { board: 4, cell: 2 },
    ],
    appliesTo: ["expert"],
  },
  {
    ruleSet: "battle",
    openingId: "human-edge-response",
    moves: [
      { board: 4, cell: 4 },
      { board: 1, cell: 7 },
    ],
    appliesTo: ["expert"],
  },
];

export class OpeningBook {
  private static readonly MAX_HISTORY = 2;

  static lookup(snapshot: GameSnapshot, difficulty: Difficulty): AiMove | null {
    if (snapshot.moveCount >= this.MAX_HISTORY) {
      return null;
    }
    const historyKey = this.buildHistoryKey(snapshot.history);
    if (!historyKey) {
      return null;
    }
    const entry = BOOK.find(
      (book) =>
        book.ruleSet === snapshot.ruleSet &&
        book.openingId === historyKey &&
        book.appliesTo.includes(difficulty),
    );
    if (!entry) {
      return null;
    }
    const nextIndex = snapshot.moveCount;
    const plannedMove = entry.moves[nextIndex];
    if (!plannedMove) {
      return null;
    }
    const board = snapshot.boards[plannedMove.board];
    if (!board || board.cells[plannedMove.cell] !== null) {
      return null;
    }
    if (
      snapshot.allowedBoards.length > 0 &&
      !snapshot.allowedBoards.includes(plannedMove.board)
    ) {
      return null;
    }
    return {
      boardIndex: plannedMove.board,
      cellIndex: plannedMove.cell,
    };
  }

  private static buildHistoryKey(historyEntries: HistoryEntry[]): string | null {
    if (historyEntries.length === 0) {
      return "ai-first-center";
    }
    const entry = historyEntries[0];
    if (!entry) {
      return null;
    }
    const firstMove = entry.p1Move ?? entry.p2Move;
    if (!firstMove) {
      return null;
    }
    if (firstMove.player === "X" && firstMove.boardIndex === 4) {
      if (firstMove.cellIndex === 4) {
        return "human-center-response";
      }
      if ([0, 2, 6, 8].includes(firstMove.cellIndex)) {
        return "human-center-corner";
      }
      if ([1, 3, 5, 7].includes(firstMove.cellIndex)) {
        return "human-edge-response";
      }
    }
    return null;
  }
}
