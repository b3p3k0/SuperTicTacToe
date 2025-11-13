import * as hardModule from "../dist/ai/strategies/hard.js";
import * as normalModule from "../dist/ai/strategies/normal.js";

const { HardAiStrategy } = hardModule;
const { NormalAiStrategy } = normalModule;

function createBoard(cells, winner = null) {
  const filled = cells.every((cell) => cell !== null);
  const isDraw = filled && !winner;
  return {
    cells,
    winner,
    isDraw,
    isFull: filled,
  };
}

function createSnapshot(partial) {
  const defaults = {
    boards: Array.from({ length: 9 }, () => createBoard(Array(9).fill(null))),
    currentPlayer: "X",
    activeBoardIndex: null,
    allowedBoards: Array.from({ length: 9 }, (_, idx) => idx),
    status: "playing",
    winner: null,
    moveCount: 0,
    history: [],
    ruleSet: "battle",
  };
  return { ...defaults, ...partial };
}

function testNormalBlocksFork() {
  const board = createBoard([
    "X", null, "X",
    null, "O", null,
    null, null, null,
  ]);
  const otherBoards = Array.from({ length: 8 }, () => createBoard(Array(9).fill(null)));
  const snapshot = createSnapshot({
    boards: [board, ...otherBoards],
    allowedBoards: [0],
    currentPlayer: "O",
    ruleSet: "classic",
  });
  const move = NormalAiStrategy.choose(snapshot);
  if (!move || move.boardIndex !== 0 || move.cellIndex !== 1) {
    throw new Error(`Normal AI should block fork at board 0, cell 1. Got ${JSON.stringify(move)}`);
  }
}

function timedHardMove() {
  const boards = Array.from({ length: 9 }, () => createBoard(Array(9).fill(null)));
  boards[0] = createBoard(["X", "O", "X", "O", "O", null, null, null, null]);
  const snapshot = createSnapshot({
    boards,
    allowedBoards: [0],
    currentPlayer: "O",
    ruleSet: "battle",
  });
  const start = performance.now();
  HardAiStrategy.choose(snapshot);
  return performance.now() - start;
}

(function run() {
  testNormalBlocksFork();
  const elapsed = timedHardMove();
  if (elapsed > 4000) {
    throw new Error(`Hard AI exceeded time cap: ${elapsed.toFixed(1)}ms`);
  }
  console.log("AI regression checks passed", { elapsed: Number(elapsed.toFixed(1)) });
})();
