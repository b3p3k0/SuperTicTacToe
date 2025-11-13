import { GameSnapshot, AiMove, Player } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiSimulator } from "../simulator.js";
import { AiDiagnostics } from "../diagnostics.js";
import { AiEvaluator } from "../evaluator.js";

interface ScoredCandidate {
  move: AiMove;
  score: number;
}

export class NormalAiStrategy {
  private static readonly BLUNDER_RATE = 0.12;
  private static readonly MAX_SEARCH_BRANCHES = 6;

  static choose(snapshot: GameSnapshot): AiMove | null {
    const candidates = AiUtils.collectCandidates(snapshot);
    if (candidates.length === 0) {
      return null;
    }

    // Always take an immediate win
    const winningMove = AiUtils.findImmediateWin(snapshot, candidates, "O");
    if (winningMove) {
      return winningMove;
    }

    // Always block opponent wins
    const blockingMove = AiUtils.findImmediateWin(snapshot, candidates, "X");
    if (blockingMove) {
      return blockingMove;
    }

    // Use scoring heuristics for other moves
    const { move, scored, errorApplied } = this.scoreAndPick(snapshot, candidates);

    AiDiagnostics.logDecision({
      difficulty: "normal",
      ruleSet: snapshot.ruleSet,
      bestMove: move,
      candidates: scored.slice(0, 5),
      metadata: {
        errorApplied,
        candidateCount: scored.length,
      },
    });

    return move;
  }

  private static scoreAndPick(
    snapshot: GameSnapshot,
    candidates: AiMove[],
  ): { move: AiMove; scored: ScoredCandidate[]; errorApplied: boolean } {
    if (candidates.length === 0) {
      throw new Error("No candidates available");
    }

    const ordered = this.orderCandidates(snapshot, candidates, "O");
    const limited = ordered.slice(0, this.MAX_SEARCH_BRANCHES);

    const scored = limited.map((entry) => ({
      move: entry.move,
      score: this.depthTwoSearch(snapshot, entry.move),
    }));

    if (scored.length === 0) {
      scored.push({ move: ordered[0]!.move, score: -Infinity });
    }

    scored.sort((a, b) => b.score - a.score);

    let chosenIndex = 0;
    let errorApplied = false;
    if (Math.random() < this.BLUNDER_RATE && scored.length > 1) {
      const maxIdx = Math.min(2, scored.length - 1);
      chosenIndex = Math.floor(Math.random() * maxIdx) + 1;
      errorApplied = chosenIndex !== 0;
    }

    return {
      move: scored[chosenIndex]!.move,
      scored,
      errorApplied,
    };
  }

  private static depthTwoSearch(snapshot: GameSnapshot, move: AiMove): number {
    const next = AiSimulator.applyMove(snapshot, move, "O");
    if (!next) {
      return -Infinity;
    }
    if (next.status !== "playing") {
      return AiEvaluator.evaluate(next, "O");
    }

    const opponentMoves = AiUtils.collectCandidates(next);
    if (opponentMoves.length === 0) {
      return AiEvaluator.evaluate(next, "O");
    }

    const orderedOpp = this.orderCandidates(next, opponentMoves, "X");
    let bestResponse = Infinity;
    const limit = orderedOpp.slice(0, this.MAX_SEARCH_BRANCHES);
    for (const { move: oppMove } of limit) {
      const afterOpp = AiSimulator.applyMove(next, oppMove, "X");
      if (!afterOpp) {
        continue;
      }
      const evalScore = AiEvaluator.evaluate(afterOpp, "O");
      if (evalScore < bestResponse) {
        bestResponse = evalScore;
      }
    }

    if (bestResponse === Infinity) {
      return AiEvaluator.evaluate(next, "O");
    }
    return bestResponse;
  }

  private static orderCandidates(
    snapshot: GameSnapshot,
    moves: AiMove[],
    player: Player,
  ): { move: AiMove; heuristic: number }[] {
    return moves
      .map((move) => {
        const board = snapshot.boards[move.boardIndex];
        let heuristic = 0;
        heuristic += BOARD_PRIORITY[move.boardIndex] ?? 0;
        heuristic += CELL_PRIORITY[move.cellIndex] ?? 0;
        if (board) {
          heuristic += AiUtils.patternOpportunityScore(board.cells, player, move.cellIndex);
          const opponent = player === "O" ? "X" : "O";
          heuristic += AiUtils.patternBlockScore(board.cells, opponent, move.cellIndex);
        }
        heuristic += RuleAwareHeuristics.moveBonus(snapshot, move, player);
        return { move, heuristic };
      })
      .sort((a, b) => b.heuristic - a.heuristic);
  }

  private static simulateImmediatePunish(snapshot: GameSnapshot, move: AiMove): number {
    const next = AiSimulator.applyMove(snapshot, move, "O");
    if (!next) {
      return 0;
    }

    const opponentCandidates = AiUtils.collectCandidates(next);
    if (opponentCandidates.length === 0) {
      return 0;
    }

    let penalty = 0;

    const immediateLoss = AiUtils.findImmediateWin(next, opponentCandidates, "X");
    if (immediateLoss) {
      penalty -= 6;
    }

    if (snapshot.ruleSet === "battle") {
      const contestedIndex = move.boardIndex;
      const contestedBoard = next.boards[contestedIndex];
      if (contestedBoard && contestedBoard.winner === "O" && !contestedBoard.isFull) {
        const recaptureCandidates = opponentCandidates.filter(
          (candidate) => candidate.boardIndex === contestedIndex,
        );
        const recaptureThreat = recaptureCandidates.some((candidate) =>
          AiUtils.completesLine(contestedBoard.cells, candidate.cellIndex, "X"),
        );
        if (recaptureThreat) {
          penalty -= 4.5;
        }
      }
    }

    return penalty;
  }
}
