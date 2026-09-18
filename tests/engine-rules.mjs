import { GameEngine } from "../dist/core/engine.js";

const ALL = ["classic", "modern", "battle"];

function board(cells, winner = null) {
  const isFull = cells.every((cell) => cell !== null);
  return { cells, winner, isDraw: isFull && !winner, isFull };
}

// A full board with no three-in-a-row.
const fullDraw = () => board(["X", "O", "X", "X", "O", "O", "O", "X", "X"]);
// A board captured by `p` with six empty cells.
const ownedBy = (p) => board([p, p, p, null, null, null, null, null, null], p);
// X owns the top row, O has two in the middle row and can complete it at cell 5.
const contested = () => board(["X", "X", "X", "O", "O", null, null, null, null], "X");
// X has the top row, O has the bottom row, O owns the board (O captured last).
const twoLines = () => board(["X", "X", "X", null, null, null, "O", "O", "O"], "O");

function makeEngine(ruleSet, setup) {
  const engine = new GameEngine();
  engine.reset("X", ruleSet);
  setup?.(engine);
  return engine;
}

const cases = [
  ...ALL.map((ruleSet) => ({
    name: `${ruleSet}: sent to a full board means free choice`,
    ruleSet,
    setup: (e) => { e.boards[0] = fullDraw(); },
    move: [4, 0],
    expect: { success: true, activeBoardIndex: null, allowedExcludes: [0], forcedBoardFull: true },
  })),
  ...["classic", "battle"].map((ruleSet) => ({
    name: `${ruleSet}: sent to a captured board with space still forces that board`,
    ruleSet,
    setup: (e) => { e.boards[0] = ownedBy("O"); },
    move: [4, 0],
    expect: { success: true, activeBoardIndex: 0, allowedIncludes: [0], forcedBoardFull: false },
  })),
  {
    name: "modern: sent to a captured board means free choice and that board stays closed",
    ruleSet: "modern",
    setup: (e) => { e.boards[0] = ownedBy("O"); },
    move: [4, 0],
    expect: { success: true, activeBoardIndex: null, allowedExcludes: [0], forcedBoardFull: true },
  },
  {
    name: "modern: a move inside a captured board is rejected",
    ruleSet: "modern",
    setup: (e) => { e.boards[0] = ownedBy("O"); },
    move: [0, 5],
    expect: { success: false, reasonIncludes: "closed" },
  },
  {
    name: "classic: a move inside a captured board is allowed",
    ruleSet: "classic",
    setup: (e) => { e.boards[0] = ownedBy("O"); },
    move: [0, 5],
    expect: { success: true, boardWinner: "O" },
  },
  {
    name: "classic: completing a line in a board the opponent owns does not change the owner",
    ruleSet: "classic",
    setup: (e) => { e.boards[0] = contested(); e.activeBoardIndex = 0; e.currentPlayer = "O"; },
    move: [0, 5],
    expect: { success: true, boardWinner: "X", capturedBoard: false, recapturedBoard: false },
  },
  {
    name: "battle: completing a new line in a board the opponent owns recaptures it",
    ruleSet: "battle",
    setup: (e) => { e.boards[0] = contested(); e.activeBoardIndex = 0; e.currentPlayer = "O"; },
    move: [0, 5],
    expect: { success: true, boardWinner: "O", capturedBoard: true, recapturedBoard: true },
  },
  {
    name: "battle: a move that makes no new line leaves the owner alone",
    ruleSet: "battle",
    setup: (e) => { e.boards[0] = twoLines(); e.activeBoardIndex = 0; e.currentPlayer = "X"; },
    move: [0, 4],
    expect: { success: true, boardWinner: "O", capturedBoard: false, recapturedBoard: false },
  },
  {
    name: "battle: the owner adding a mark without a new line keeps the board",
    ruleSet: "battle",
    setup: (e) => { e.boards[0] = twoLines(); e.activeBoardIndex = 0; e.currentPlayer = "O"; },
    move: [0, 4],
    expect: { success: true, boardWinner: "O", capturedBoard: false, recapturedBoard: false },
  },
  {
    name: "a move outside the active board is rejected",
    ruleSet: "battle",
    setup: (e) => { e.activeBoardIndex = 4; },
    move: [0, 0],
    expect: { success: false, reasonIncludes: "active board" },
  },
  {
    name: "a move on an occupied cell is rejected",
    ruleSet: "battle",
    setup: (e) => { e.boards[4].cells[4] = "O"; },
    move: [4, 4],
    expect: { success: false, reasonIncludes: "taken" },
  },
  ...ALL.map((ruleSet) => ({
    name: `${ruleSet}: three captured boards in a row win the match`,
    ruleSet,
    setup: (e) => {
      e.boards[0] = ownedBy("X");
      e.boards[1] = ownedBy("X");
      e.boards[2] = board(["X", "X", null, "O", "O", null, null, null, null]);
      e.activeBoardIndex = 2;
    },
    move: [2, 2],
    expect: { success: true, status: "won", winner: "X", allowedEmpty: true },
  })),
  {
    name: "battle: every board full with no line is a draw",
    ruleSet: "battle",
    setup: (e) => {
      for (let i = 0; i < 8; i += 1) e.boards[i] = fullDraw();
      e.boards[8] = board(["X", "O", "X", "X", "O", "O", "O", "X", null]);
    },
    move: [8, 8],
    expect: { success: true, status: "draw", winner: null, allowedEmpty: true },
  },
  {
    name: "modern: every board captured or dead with no big line is a draw",
    ruleSet: "modern",
    setup: (e) => {
      const owners = ["X", "O", "X", "X", "O", "O", "O", "X"];
      owners.forEach((p, i) => { e.boards[i] = ownedBy(p); });
      e.boards[8] = board(["X", "O", "X", "X", "O", "O", "O", "X", null]);
    },
    move: [8, 8],
    expect: { success: true, status: "draw", winner: null, allowedEmpty: true },
  },
];

function check(testCase) {
  const engine = makeEngine(testCase.ruleSet, testCase.setup);
  const result = engine.attemptMove(...testCase.move);
  const snap = engine.getSnapshot();
  const [boardIndex] = testCase.move;
  const e = testCase.expect;
  const problems = [];
  const reason = result.reason ?? "";

  if (e.success !== undefined && result.success !== e.success) {
    problems.push(`success=${result.success} ${reason}`);
  }
  if (e.reasonIncludes && !reason.includes(e.reasonIncludes)) {
    problems.push(`reason "${reason}" lacks "${e.reasonIncludes}"`);
  }
  if (e.activeBoardIndex !== undefined && snap.activeBoardIndex !== e.activeBoardIndex) {
    problems.push(`activeBoardIndex=${snap.activeBoardIndex} expected ${e.activeBoardIndex}`);
  }
  for (const idx of e.allowedIncludes ?? []) {
    if (!snap.allowedBoards.includes(idx)) problems.push(`allowedBoards lacks ${idx}`);
  }
  for (const idx of e.allowedExcludes ?? []) {
    if (snap.allowedBoards.includes(idx)) problems.push(`allowedBoards contains ${idx}`);
  }
  if (e.allowedEmpty && snap.allowedBoards.length !== 0) {
    problems.push(`allowedBoards=${JSON.stringify(snap.allowedBoards)} expected []`);
  }
  if (e.forcedBoardFull !== undefined && snap.lastMove?.forcedBoardFull !== e.forcedBoardFull) {
    problems.push(`forcedBoardFull=${snap.lastMove?.forcedBoardFull}`);
  }
  if (e.boardWinner !== undefined && snap.boards[boardIndex].winner !== e.boardWinner) {
    problems.push(`board ${boardIndex} winner=${snap.boards[boardIndex].winner} expected ${e.boardWinner}`);
  }
  if (e.capturedBoard !== undefined && !!snap.lastMove?.capturedBoard !== e.capturedBoard) {
    problems.push(`capturedBoard=${snap.lastMove?.capturedBoard}`);
  }
  if (e.recapturedBoard !== undefined && !!snap.lastMove?.recapturedBoard !== e.recapturedBoard) {
    problems.push(`recapturedBoard=${snap.lastMove?.recapturedBoard}`);
  }
  if (e.status && snap.status !== e.status) {
    problems.push(`status=${snap.status} expected ${e.status}`);
  }
  if (e.winner !== undefined && snap.winner !== e.winner) {
    problems.push(`winner=${snap.winner} expected ${e.winner}`);
  }
  return problems;
}

let failed = 0;
for (const testCase of cases) {
  const problems = check(testCase);
  if (problems.length > 0) {
    failed += 1;
    console.log(`FAIL ${testCase.name}\n  ${problems.join("\n  ")}`);
  }
}
if (failed > 0) {
  console.log(`${failed} of ${cases.length} engine rule checks failed`);
  process.exit(1);
}
console.log(`Engine rule checks passed (${cases.length} cases)`);
