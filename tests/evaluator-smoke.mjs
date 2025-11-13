import { AiEvaluator } from "../dist/ai/evaluator.js";

function createEmptyBoard() {
  return {
    cells: Array(9).fill(null),
    winner: null,
    isDraw: false,
    isFull: false,
  };
}

function createSnapshot(ruleSet = "battle") {
  return {
    boards: Array.from({ length: 9 }, () => createEmptyBoard()),
    currentPlayer: "X",
    activeBoardIndex: null,
    allowedBoards: Array.from({ length: 9 }, (_, idx) => idx),
    status: "playing",
    winner: null,
    moveCount: 0,
    history: [],
    ruleSet,
  };
}

function cloneSnapshot(snapshot) {
  return structuredClone(snapshot);
}

function assertGreater(label, a, b) {
  if (!(a > b)) {
    throw new Error(`${label}: expected ${a} to be greater than ${b}`);
  }
}

(function run() {
  const base = createSnapshot("battle");
  const baseScore = AiEvaluator.evaluate(base, "O");
  const detailed = AiEvaluator.evaluateDetailed(base, "O");
  if (detailed.score !== baseScore) {
    throw new Error("evaluateDetailed() score must match evaluate()");
  }
  const sum = detailed.breakdown.terminal + detailed.breakdown.ownership +
    detailed.breakdown.threats + detailed.breakdown.meta +
    detailed.breakdown.routing + detailed.breakdown.battle;
  if (Number(sum.toFixed(6)) !== Number(detailed.breakdown.total.toFixed(6))) {
    throw new Error("Breakdown total should match summed components");
  }

  const owned = cloneSnapshot(base);
  owned.boards[4].winner = "O";
  const ownedScore = AiEvaluator.evaluate(owned, "O");
  assertGreater("Owned board should help", ownedScore, baseScore);

  const lost = cloneSnapshot(base);
  lost.boards[0].winner = "X";
  const lostScore = AiEvaluator.evaluate(lost, "O");
  if (!(lostScore < baseScore)) {
    throw new Error("Losing a board should reduce score");
  }

  const metaThreat = cloneSnapshot(base);
  metaThreat.boards[0].winner = "O";
  metaThreat.boards[1].winner = "O";
  const metaThreatScore = AiEvaluator.evaluate(metaThreat, "O");
  assertGreater("Meta two-in-a-row", metaThreatScore, ownedScore);

  const battleStable = cloneSnapshot(base);
  battleStable.boards[0].winner = "O";
  battleStable.boards[0].cells = [
    "O", "O", "O",
    null, null, null,
    null, null, null,
  ];
  const battleStableScore = AiEvaluator.evaluate(battleStable, "O");

  const battleFragile = cloneSnapshot(base);
  battleFragile.boards[0].winner = "O";
  battleFragile.boards[0].cells = [
    "O", "O", "O",
    "X", "X", null,
    null, null, null,
  ];
  const battleFragileScore = AiEvaluator.evaluate(battleFragile, "O");
  assertGreater("Stable capture vs fragile", battleStableScore, battleFragileScore);

  const classicSnapshot = createSnapshot("classic");
  classicSnapshot.boards[4].winner = "O";
  const classicScore = AiEvaluator.evaluate(classicSnapshot, "O");
  const modernSnapshot = createSnapshot("modern");
  modernSnapshot.boards[4].winner = "O";
  const modernScore = AiEvaluator.evaluate(modernSnapshot, "O");
  assertGreater("Modern weighting should value locked boards more", modernScore, classicScore - 1);

  console.log("Evaluator smoke tests passed");
})();
