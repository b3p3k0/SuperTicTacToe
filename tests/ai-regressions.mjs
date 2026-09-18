import { HardAiStrategy } from "../dist/ai/strategies/hard.js";
import { NormalAiStrategy } from "../dist/ai/strategies/normal.js";
import { AdaptiveTuning } from "../dist/ai/adaptive-tuning.js";
import { AiSimulator } from "../dist/ai/simulator.js";
import { AiUtils } from "../dist/ai/utils.js";

const RULESETS = ["battle", "classic", "modern"];

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

const emptyBoard = () => createBoard(Array(9).fill(null));
const ownedBy = (p) => createBoard([p, p, p, null, null, null, null, null, null], p);

// Which boards may be played, following each ruleset's closed-board rule.
function allowedFor(boards, ruleSet, active) {
  if (active !== null) {
    return [active];
  }
  return boards
    .map((board, idx) => {
      if (board.isFull) return -1;
      if (ruleSet === "modern" && (board.winner || board.isDraw)) return -1;
      return idx;
    })
    .filter((idx) => idx >= 0);
}

function createSnapshot(partial) {
  const defaults = {
    boards: Array.from({ length: 9 }, () => emptyBoard()),
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

const moveKey = (move) => (move ? `${move.boardIndex}:${move.cellIndex}` : "null");

function winsNow(snapshot, move, player) {
  return AiSimulator.applyMove(snapshot, move, player)?.winner === player;
}

function opponentWinsAfter(snapshot, move, player) {
  const next = AiSimulator.applyMove(snapshot, move, player);
  if (!next || next.status !== "playing") {
    return false;
  }
  const opponent = AiUtils.getOpponent(player);
  return AiUtils.collectCandidates(next).some((reply) => winsNow(next, reply, opponent));
}

// Hard and Expert are HardAiStrategy with the controller's static presets.
const presets = {
  hard: () => ({ player: "O", band: null, ...AdaptiveTuning.staticHardPreset() }),
  expert: () => ({ player: "O", band: null, ...AdaptiveTuning.staticExpertPreset() }),
};

function testNormalBlocksFork() {
  const board = createBoard([
    "X", null, "X",
    null, "O", null,
    null, null, null,
  ]);
  const otherBoards = Array.from({ length: 8 }, () => emptyBoard());
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

// O owns boards 0, 1, 3 and 4. Playing board 2 cell 2 completes the top row of big boards.
function winInOnePosition(ruleSet, active) {
  const boards = Array.from({ length: 9 }, () => emptyBoard());
  boards[0] = ownedBy("O");
  boards[1] = ownedBy("O");
  boards[3] = ownedBy("O");
  boards[4] = ownedBy("O");
  boards[2] = createBoard([
    "O", "O", null,
    null, "X", null,
    null, null, "X",
  ]);
  return createSnapshot({
    boards,
    currentPlayer: "O",
    activeBoardIndex: active,
    allowedBoards: allowedFor(boards, ruleSet, active),
    moveCount: 20,
    ruleSet,
  });
}

// X owns boards 0 and 1 and wins by playing board 2 cell 2. Board 8 is full, so sending X
// there gives X a free choice. O must block at 2:2 or at least not send X to board 2.
function walkIntoLossPosition(ruleSet, active) {
  const boards = Array.from({ length: 9 }, () => emptyBoard());
  boards[0] = ownedBy("X");
  boards[1] = ownedBy("X");
  boards[2] = createBoard([
    "X", "X", null,
    "X", "O", "O",
    "O", "X", null,
  ]);
  boards[8] = createBoard(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
  return createSnapshot({
    boards,
    currentPlayer: "O",
    activeBoardIndex: active,
    allowedBoards: allowedFor(boards, ruleSet, active),
    moveCount: 22,
    ruleSet,
  });
}

function testHardAndExpertTactics() {
  const failures = [];
  for (const ruleSet of RULESETS) {
    for (const active of [null, 2]) {
      for (const [name, preset] of Object.entries(presets)) {
        const where = `${name} ${ruleSet} ${active === null ? "free choice" : "forced board"}`;

        const winSnapshot = winInOnePosition(ruleSet, active);
        const winMove = HardAiStrategy.choose(winSnapshot, preset());
        if (!winMove || !winsNow(winSnapshot, winMove, "O")) {
          failures.push(`${where}: missed win-in-1, played ${moveKey(winMove)}`);
        }

        const lossSnapshot = walkIntoLossPosition(ruleSet, active);
        const lossMove = HardAiStrategy.choose(lossSnapshot, preset());
        if (!lossMove || opponentWinsAfter(lossSnapshot, lossMove, "O")) {
          failures.push(`${where}: walked into loss-in-1, played ${moveKey(lossMove)}`);
        }
      }
    }
  }
  if (failures.length > 0) {
    throw new Error(`Hard/Expert tactics failed ${failures.length} of 24 checks:\n  ${failures.join("\n  ")}`);
  }
}

function testNormalTuningKeyMatches() {
  const tuning = AdaptiveTuning.resolve("normal", "coast").normal;
  if (!tuning || tuning.maxBranches !== 8) {
    throw new Error(`Adaptive Normal tuning should set maxBranches=8, got ${JSON.stringify(tuning)}`);
  }
}

function timedHardMove() {
  const boards = Array.from({ length: 9 }, () => emptyBoard());
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
  testHardAndExpertTactics();
  testNormalTuningKeyMatches();
  const elapsed = timedHardMove();
  if (elapsed > 4000) {
    throw new Error(`Hard AI exceeded time cap: ${elapsed.toFixed(1)}ms`);
  }
  console.log("AI regression checks passed", { elapsed: Number(elapsed.toFixed(1)) });
})();
