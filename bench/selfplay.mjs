#!/usr/bin/env node
// Super T3 self-play harness.
// Plays one AI difficulty against another on the real GameEngine and reports
// win rates, think time, tactical misses (missed win-in-1, walked into loss-in-1),
// illegal moves, and AI-simulator-vs-engine parity. No dependencies, no source changes.
//
//   node bench/selfplay.mjs --games 100 --matchup hard-vs-hard --ruleset all
//   node bench/selfplay.mjs --ladder --games 20
//   node bench/selfplay.mjs --help

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DIFFICULTIES = ["easy", "normal", "hard", "expert"];
const RULESETS = ["battle", "classic", "modern"];

const USAGE = `Usage: node bench/selfplay.mjs [options]

  --games N                 games per matchup (default 50)
  --matchup A-vs-B          A and B in easy|normal|hard|expert; A plays X and moves first
  --ladder                  every pair of difficulties, both seat orders; prints a win-rate matrix
  --ruleset R               battle|classic|modern|all (default battle)
  --adaptive on|off         adaptive tuning (default off)
  --band B                  flow|struggle|coast, used when adaptive is on (default flow)
  --seed N                  base seed; game i uses seed*100003+i (default 1)
  --time-scale F            multiply every preset's time budget (0.02 forces the timeout path)
  --book on|off             opening book (default on)
  --random-opening N        play the first N plies at random (seeded), so two deterministic AIs see varied games (default 0)
  --parity on|off           compare AiSimulator with the engine on every move (default on)
  --dist-x DIR, --dist-o DIR   compiled modules per seat (default dist); use an older copy for A/B
  --tag NAME                label for the JSON file (default run)
  --out DIR                 output folder (default bench/results)
`;

function fail(message) {
  console.error(`selfplay: ${message}\n`);
  console.error(USAGE);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    games: 50, matchup: null, ladder: false, ruleset: "battle", adaptive: "off", band: "flow",
    seed: 1, timeScale: 1, book: "on", parity: "on", randomOpening: 0,
    distX: "dist", distO: "dist", tag: "run", out: "bench/results",
  };
  const keys = {
    games: "games", matchup: "matchup", ruleset: "ruleset", adaptive: "adaptive", band: "band",
    seed: "seed", "time-scale": "timeScale", book: "book", parity: "parity", "random-opening": "randomOpening",
    "dist-x": "distX", "dist-o": "distO", tag: "tag", out: "out",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (arg === "--ladder") {
      opts.ladder = true;
      continue;
    }
    const key = arg.startsWith("--") ? keys[arg.slice(2)] : undefined;
    if (!key) fail(`unknown option ${arg}`);
    const value = argv[i + 1];
    if (value === undefined) fail(`${arg} needs a value`);
    opts[key] = value;
    i += 1;
  }
  opts.games = Number(opts.games);
  opts.seed = Number(opts.seed);
  opts.timeScale = Number(opts.timeScale);
  opts.randomOpening = Number(opts.randomOpening);
  if (!Number.isInteger(opts.games) || opts.games < 1) fail("--games must be a positive integer");
  if (!Number.isInteger(opts.seed)) fail("--seed must be an integer");
  if (!(opts.timeScale > 0)) fail("--time-scale must be greater than 0");
  if (!Number.isInteger(opts.randomOpening) || opts.randomOpening < 0) fail("--random-opening must be 0 or more");
  if (!opts.ladder && !opts.matchup) fail("pass --matchup A-vs-B or --ladder");
  if (opts.matchup) {
    const [x, o, extra] = opts.matchup.split("-vs-");
    if (extra !== undefined || !DIFFICULTIES.includes(x) || !DIFFICULTIES.includes(o)) {
      fail(`--matchup must look like hard-vs-expert (got ${opts.matchup})`);
    }
    opts.x = x;
    opts.o = o;
  }
  if (opts.ruleset === "all") {
    opts.rulesets = RULESETS;
  } else if (RULESETS.includes(opts.ruleset)) {
    opts.rulesets = [opts.ruleset];
  } else {
    fail(`--ruleset must be one of ${RULESETS.join("|")}|all`);
  }
  for (const flag of ["adaptive", "book", "parity"]) {
    if (!["on", "off"].includes(opts[flag])) fail(`--${flag} must be on or off`);
  }
  if (!["flow", "struggle", "coast"].includes(opts.band)) fail("--band must be flow, struggle or coast");
  return opts;
}

// Small seedable PRNG so runs are reproducible. Replaces Math.random for the AI modules.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const aiCache = new Map();

async function loadAi(distDir, opts) {
  const abs = resolve(distDir);
  if (aiCache.has(abs)) return aiCache.get(abs);
  const load = (file) => import(pathToFileURL(resolve(abs, file)).href);
  const [engine, controller, utils, simulator, tuning, book] = await Promise.all([
    load("core/engine.js"),
    load("ai/controller.js"),
    load("ai/utils.js"),
    load("ai/simulator.js"),
    load("ai/adaptive-tuning.js"),
    load("ai/opening-book.js"),
  ]);

  // Runtime patches on this module instance, so no source changes are needed.
  const { AdaptiveTuning } = tuning;
  const scalePreset = (preset) => {
    if (!preset) return preset;
    const out = { ...preset };
    if (typeof out.maxTimeMs === "number") out.maxTimeMs = Math.max(1, Math.round(out.maxTimeMs * opts.timeScale));
    return out;
  };
  if (opts.timeScale !== 1) {
    const origHard = AdaptiveTuning.staticHardPreset.bind(AdaptiveTuning);
    const origExpert = AdaptiveTuning.staticExpertPreset.bind(AdaptiveTuning);
    const origResolve = AdaptiveTuning.resolve.bind(AdaptiveTuning);
    AdaptiveTuning.staticHardPreset = () => scalePreset(origHard());
    AdaptiveTuning.staticExpertPreset = () => scalePreset(origExpert());
    AdaptiveTuning.resolve = (difficulty, band) => {
      const map = origResolve(difficulty, band);
      if (map.hard) map.hard = scalePreset(map.hard);
      if (map.expert) map.expert = scalePreset(map.expert);
      return map;
    };
  }
  if (opts.book === "off" && book.OpeningBook) {
    book.OpeningBook.lookup = () => null;
  }

  const api = {
    dir: abs,
    GameEngine: engine.GameEngine,
    AiController: controller.AiController,
    AiUtils: utils.AiUtils,
    AiSimulator: simulator.AiSimulator,
  };
  aiCache.set(abs, api);
  return api;
}

// The AI only knows how to play O. To let it play X we show it a mirrored board.
const flip = (mark) => (mark === "X" ? "O" : mark === "O" ? "X" : mark);
const flipMove = (move) => (move ? { ...move, player: flip(move.player) } : move);

function mirror(snapshot) {
  return {
    ...snapshot,
    boards: snapshot.boards.map((b) => ({ ...b, cells: b.cells.map(flip), winner: flip(b.winner) })),
    currentPlayer: flip(snapshot.currentPlayer),
    winner: flip(snapshot.winner),
    lastMove: flipMove(snapshot.lastMove),
    history: snapshot.history.map((entry) => ({
      turnNumber: entry.turnNumber,
      p1Move: flipMove(entry.p2Move),
      p2Move: flipMove(entry.p1Move),
    })),
  };
}

// Tactical oracle: cheap ground truth about one-move wins and losses.
const moveKey = (move) => `${move.boardIndex}:${move.cellIndex}`;

function winningMoves(ai, snapshot, seat) {
  return ai.AiUtils.collectCandidates(snapshot).filter(
    (move) => ai.AiSimulator.applyMove(snapshot, move, seat)?.winner === seat,
  );
}

function opponentWinsAfter(ai, snapshot, move, seat) {
  const next = ai.AiSimulator.applyMove(snapshot, move, seat);
  if (!next || next.status !== "playing") return false;
  return winningMoves(ai, next, flip(seat)).length > 0;
}

// Compare what the AI's internal simulator predicts with what the engine did.
function parityCheck(ai, before, move, seat, after) {
  const predicted = ai.AiSimulator.applyMove(before, move, seat);
  if (!predicted) return "simulator rejected the move";
  for (let i = 0; i < 9; i += 1) {
    const p = predicted.boards[i];
    const a = after.boards[i];
    if (p.cells.join() !== a.cells.join() || p.winner !== a.winner || p.isDraw !== a.isDraw || p.isFull !== a.isFull) {
      return `boards[${i}]`;
    }
  }
  if (predicted.activeBoardIndex !== after.activeBoardIndex) return "activeBoardIndex";
  if (predicted.allowedBoards.join() !== after.allowedBoards.join()) return "allowedBoards";
  if (predicted.status !== after.status) return "status";
  if (predicted.winner !== after.winner) return "winner";
  return null;
}

function blankStats() {
  return { moves: 0, ms: 0, maxMs: 0, winChances: 0, missedWins: 0, dangerPositions: 0, blunders: 0, illegal: 0 };
}

function playGame({ engine, seats, ruleSet, seed, opts, ai }) {
  Math.random = mulberry32(seed);
  engine.reset("X", ruleSet);
  const game = { seed, winner: null, length: 0, moves: [], parityMismatches: 0, parityFirst: null };

  for (;;) {
    const before = engine.getSnapshot();
    if (before.status !== "playing") break;
    const seat = before.currentPlayer;
    const { controller, stats } = seats[seat];
    const candidates = ai.AiUtils.collectCandidates(before);
    if (candidates.length === 0) throw new Error(`no legal moves while status is playing (seed ${seed})`);

    let move;
    if (game.moves.length < opts.randomOpening) {
      // Scripted opening ply: a random legal move, not counted against either AI.
      move = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      const t0 = performance.now();
      move = controller.chooseMove(seat === "X" ? mirror(before) : before);
      const ms = performance.now() - t0;
      stats.moves += 1;
      stats.ms += ms;
      if (ms > stats.maxMs) stats.maxMs = ms;

      const legal = move && candidates.some((c) => moveKey(c) === moveKey(move));
      if (!legal) {
        stats.illegal += 1;
        move = candidates[0];
      }

      const wins = winningMoves(ai, before, seat);
      const tookWin = wins.some((w) => moveKey(w) === moveKey(move));
      if (wins.length > 0) {
        stats.winChances += 1;
        if (!tookWin) stats.missedWins += 1;
      }
      if (!tookWin) {
        const losing = new Set(candidates.filter((c) => opponentWinsAfter(ai, before, c, seat)).map(moveKey));
        if (losing.size > 0 && losing.size < candidates.length) {
          stats.dangerPositions += 1;
          if (losing.has(moveKey(move))) stats.blunders += 1;
        }
      }
    }

    const outcome = engine.attemptMove(move.boardIndex, move.cellIndex);
    if (!outcome.success) throw new Error(`engine rejected ${moveKey(move)}: ${outcome.reason}`);
    game.moves.push(moveKey(move));

    if (opts.parity === "on") {
      const after = engine.getSnapshot();
      const diff = parityCheck(ai, before, move, seat, after);
      if (diff) {
        game.parityMismatches += 1;
        game.parityFirst ??= { move: game.moves.length, seat, field: diff };
      }
    }
  }

  const final = engine.getSnapshot();
  game.winner = final.status === "won" ? final.winner : null;
  game.length = final.moveCount;
  return game;
}

async function runMatchup(x, o, ruleSet, opts) {
  const aiX = await loadAi(opts.distX, opts);
  const aiO = await loadAi(opts.distO, opts);
  const adaptive = opts.adaptive === "on";
  const band = adaptive ? opts.band : null;
  const byDifficulty = {};
  const statsFor = (difficulty) => (byDifficulty[difficulty] ??= blankStats());
  const seats = {
    X: { difficulty: x, controller: new aiX.AiController(x, band, adaptive), stats: statsFor(x) },
    O: { difficulty: o, controller: new aiO.AiController(o, band, adaptive), stats: statsFor(o) },
  };
  // The O side's modules are the reference for rules, oracle and parity (use --dist-x for the old copy).
  const engine = new aiO.GameEngine();
  const games = [];
  const label = `${x}(X) vs ${o}(O) ${ruleSet}`;
  for (let i = 0; i < opts.games; i += 1) {
    games.push(playGame({ engine, seats, ruleSet, seed: opts.seed * 100003 + i, opts, ai: aiO }));
    if ((i + 1) % 10 === 0 || i + 1 === opts.games) process.stderr.write(`\r  ${label}: game ${i + 1}/${opts.games}`);
  }
  process.stderr.write("\r" + " ".repeat(label.length + 24) + "\r");

  const lengths = games.map((g) => g.length);
  const parityMoves = games.reduce((sum, g) => sum + g.moves.length, 0);
  return {
    x, o, ruleSet, adaptive, band, games: opts.games, seed: opts.seed, timeScale: opts.timeScale, randomOpening: opts.randomOpening,
    bySeat: {
      xWins: games.filter((g) => g.winner === "X").length,
      oWins: games.filter((g) => g.winner === "O").length,
      draws: games.filter((g) => g.winner === null).length,
    },
    byDifficulty: Object.fromEntries(Object.entries(byDifficulty).map(([name, s]) => [name, {
      moves: s.moves,
      avgMs: s.moves ? Number((s.ms / s.moves).toFixed(1)) : 0,
      maxMs: Number(s.maxMs.toFixed(1)),
      winChances: s.winChances,
      missedWins: s.missedWins,
      dangerPositions: s.dangerPositions,
      blunders: s.blunders,
      illegal: s.illegal,
    }])),
    length: {
      avg: Number((lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1)),
      min: Math.min(...lengths),
      max: Math.max(...lengths),
    },
    parity: {
      checked: opts.parity === "on",
      mismatches: games.reduce((sum, g) => sum + g.parityMismatches, 0),
      moves: parityMoves,
      firstExample: games.find((g) => g.parityFirst)
        ? { seed: games.find((g) => g.parityFirst).seed, ...games.find((g) => g.parityFirst).parityFirst }
        : null,
    },
    gameLog: games.map((g) => ({ seed: g.seed, winner: g.winner, length: g.length, moves: g.moves.join(" ") })),
  };
}

function summarize(r) {
  const lines = [];
  const extra = (r.timeScale !== 1 ? ` time-scale=${r.timeScale}` : "") + (r.randomOpening ? ` random-opening=${r.randomOpening}` : "");
  lines.push(`${r.x}(X) vs ${r.o}(O)   ruleset=${r.ruleSet} adaptive=${r.adaptive ? r.band : "off"} games=${r.games} seed=${r.seed}${extra}`);
  lines.push(`  by seat        X wins ${r.bySeat.xWins}   O wins ${r.bySeat.oWins}   draws ${r.bySeat.draws}`);
  lines.push(`  game length    avg ${r.length.avg}   min ${r.length.min}   max ${r.length.max}`);
  for (const [name, s] of Object.entries(r.byDifficulty)) {
    lines.push(`  think ms       ${name}: avg ${s.avgMs}   max ${s.maxMs}   (${s.moves} moves)`);
  }
  for (const [name, s] of Object.entries(r.byDifficulty)) {
    lines.push(`  oracle         ${name}: missed win-in-1 ${s.missedWins}/${s.winChances}   walked into loss ${s.blunders}/${s.dangerPositions}   illegal ${s.illegal}`);
  }
  if (r.parity.checked) {
    const first = r.parity.firstExample
      ? `   first: seed ${r.parity.firstExample.seed} move ${r.parity.firstExample.move} (${r.parity.firstExample.seat}) ${r.parity.firstExample.field}`
      : "";
    lines.push(`  parity         ${r.parity.mismatches} mismatches / ${r.parity.moves} moves${first}`);
  }
  return lines.join("\n");
}

function ladderPairs() {
  const pairs = [];
  for (let i = 0; i < DIFFICULTIES.length; i += 1) {
    for (let j = i + 1; j < DIFFICULTIES.length; j += 1) {
      pairs.push([DIFFICULTIES[i], DIFFICULTIES[j]]);
      pairs.push([DIFFICULTIES[j], DIFFICULTIES[i]]);
    }
  }
  return pairs;
}

// score[a][b] = (wins + 0.5 * draws) / games for a against b, both seat orders pooled.
function ladderMatrix(results) {
  const tally = {};
  const bump = (a, b, points, games) => {
    tally[a] ??= {};
    tally[a][b] ??= { points: 0, games: 0 };
    tally[a][b].points += points;
    tally[a][b].games += games;
  };
  for (const r of results) {
    bump(r.x, r.o, r.bySeat.xWins + 0.5 * r.bySeat.draws, r.games);
    bump(r.o, r.x, r.bySeat.oWins + 0.5 * r.bySeat.draws, r.games);
  }
  const score = (a, b) => (tally[a]?.[b] ? tally[a][b].points / tally[a][b].games : null);
  const cell = (v) => (v === null ? "-" : v.toFixed(2)).padStart(8);
  const lines = [""];
  lines.push("Ladder: row score against column (1.00 = won every game, 0.50 = even)");
  lines.push("          " + DIFFICULTIES.map((d) => d.padStart(8)).join(""));
  for (const a of DIFFICULTIES) {
    lines.push(a.padEnd(10) + DIFFICULTIES.map((b) => (a === b ? "-".padStart(8) : cell(score(a, b)))).join(""));
  }
  const violations = [];
  for (let i = 1; i < DIFFICULTIES.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const s = score(DIFFICULTIES[i], DIFFICULTIES[j]);
      if (s !== null && s <= 0.5) violations.push(`${DIFFICULTIES[i]} does not beat ${DIFFICULTIES[j]} (${s.toFixed(2)})`);
    }
  }
  lines.push(`  ordering check: ${violations.length === 0 ? "OK" : "VIOLATION " + violations.join("; ")}`);
  return lines.join("\n");
}

function writeReport(report, opts) {
  mkdirSync(opts.out, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = resolve(opts.out, `run-${opts.tag}-${stamp}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  return file;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const started = Date.now();
  const matchups = opts.ladder ? ladderPairs() : [[opts.x, opts.o]];
  const results = [];
  for (const [x, o] of matchups) {
    for (const ruleSet of opts.rulesets) {
      const result = await runMatchup(x, o, ruleSet, opts);
      results.push(result);
      console.log(summarize(result));
      console.log("");
    }
  }
  if (opts.ladder) console.log(ladderMatrix(results));
  const report = {
    meta: {
      date: new Date().toISOString(),
      node: process.version,
      seed: opts.seed,
      timeScale: opts.timeScale,
      distX: resolve(opts.distX),
      distO: resolve(opts.distO),
      args: process.argv.slice(2),
      durationMs: Date.now() - started,
    },
    matchups: results,
  };
  const file = writeReport(report, opts);
  console.log(`\n${results.length} matchup(s), ${((Date.now() - started) / 1000).toFixed(1)} s. JSON: ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
