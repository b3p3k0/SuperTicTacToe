import { GameSnapshot, AiMove, Player, MiniBoardState } from "../core/types.js";
import { AiUtils } from "./utils.js";

export class AiSimulator {
  static applyMove(snapshot: GameSnapshot, move: AiMove, player: Player): GameSnapshot | null {
    const boards: MiniBoardState[] = snapshot.boards.map((board) => ({
      cells: [...board.cells],
      winner: board.winner,
      isDraw: board.isDraw,
      isFull: board.isFull,
    }));

    const ruleSet = snapshot.ruleSet ?? "modern";
    const board = boards[move.boardIndex];
    if (!board || board.cells[move.cellIndex] !== null) {
      return null;
    }

    const beforeWinner = board.winner;
    board.cells[move.cellIndex] = player;

    const preferredPlayer = ruleSet === "battle" ? player : undefined;
    const winner = AiUtils.findWinner(board.cells, preferredPlayer);
    if (winner && (!board.winner || ruleSet === "battle")) {
      board.winner = winner;
    }

    board.isFull = board.cells.every((cell) => cell !== null);
    board.isDraw = !board.winner && board.isFull;

    const isClosed = (mini: MiniBoardState | undefined): boolean => {
      if (!mini) {
        return true;
      }
      if (mini.isFull) {
        return true;
      }
      if (ruleSet === "modern") {
        return !!mini.winner || mini.isDraw;
      }
      return false;
    };

    const afterWinner = board.winner;
    const ownershipChanged =
      afterWinner === player && beforeWinner !== afterWinner;
    const recaptured = ownershipChanged && !!beforeWinner;
    const deadBoard = !ownershipChanged && board.isDraw;

    const result: GameSnapshot = {
      boards,
      currentPlayer: AiUtils.getOpponent(player),
      activeBoardIndex: null,
      allowedBoards: [],
      status: "playing",
      winner: null,
      moveCount: snapshot.moveCount + 1,
      history: snapshot.history,
      lastMove: {
        player,
        boardIndex: move.boardIndex,
        cellIndex: move.cellIndex,
        forcedBoardFull: false,
        capturedBoard: ownershipChanged,
        recapturedBoard: recaptured,
        deadBoard,
      },
      ruleSet,
    };

    const forcedIndex = move.cellIndex;
    const forcedBoard = boards[forcedIndex];
    const forcedFull = isClosed(forcedBoard);
    if (result.lastMove) {
      result.lastMove.forcedBoardFull = forcedFull;
    }

    if (!forcedFull && forcedBoard) {
      result.activeBoardIndex = forcedIndex;
      result.allowedBoards = [forcedIndex];
    } else {
      result.activeBoardIndex = null;
      result.allowedBoards = boards
        .map((mini, idx) => (!isClosed(mini) ? idx : -1))
        .filter((idx) => idx >= 0);
    }

    const macroWinner = AiUtils.findMacroWinner(boards);
    if (macroWinner) {
      result.status = "won";
      result.winner = macroWinner;
      result.allowedBoards = [];
      result.activeBoardIndex = null;
    } else if (boards.every((mini) => isClosed(mini))) {
      result.status = "draw";
      result.allowedBoards = [];
      result.activeBoardIndex = null;
    }

    return result;
  }
}
