// Only the AI's opening move is booked: take the centre of the centre board.
// Replies to the human's first move were removed; the forced-board rule made them unreachable.
const BOOK = [
    { ruleSet: "battle", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
    { ruleSet: "classic", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
    { ruleSet: "modern", moves: [{ board: 4, cell: 4 }], appliesTo: ["normal", "hard", "expert"] },
];
export class OpeningBook {
    static lookup(snapshot, difficulty) {
        if (snapshot.moveCount !== 0 || snapshot.history.length !== 0) {
            return null;
        }
        const entry = BOOK.find((book) => book.ruleSet === snapshot.ruleSet && book.appliesTo.includes(difficulty));
        const plannedMove = entry === null || entry === void 0 ? void 0 : entry.moves[0];
        if (!plannedMove) {
            return null;
        }
        const board = snapshot.boards[plannedMove.board];
        if (!board || board.cells[plannedMove.cell] !== null) {
            return null;
        }
        if (snapshot.allowedBoards.length > 0 &&
            !snapshot.allowedBoards.includes(plannedMove.board)) {
            return null;
        }
        return {
            boardIndex: plannedMove.board,
            cellIndex: plannedMove.cell,
        };
    }
}
