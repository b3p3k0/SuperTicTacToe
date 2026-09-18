import { AiMove, Difficulty, GameSnapshot } from "../core/types.js";

interface BookEntry {
  ruleSet: string;
  moves: Array<{ board: number; cell: number }>;
  appliesTo: Difficulty[];
}

// Only the AI's opening move is booked: take the centre of the centre board.
// Replies to the human's first move were removed; the forced-board rule made them unreachable.
const BOOK: BookEntry[] = [
  { ruleSet: "battle", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
  { ruleSet: "classic", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
  { ruleSet: "modern", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
];

export class OpeningBook {
  static lookup(snapshot: GameSnapshot, difficulty: Difficulty): AiMove | null {
    if (snapshot.moveCount !== 0 || snapshot.history.length !== 0) {
      return null;
    }
    const entry = BOOK.find(
      (book) => book.ruleSet === snapshot.ruleSet && book.appliesTo.includes(difficulty),
    );
    const plannedMove = entry?.moves[0];
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
}
