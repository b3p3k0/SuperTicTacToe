import { GameSnapshot, AiMove } from "../../core/types.js";
import { CELL_PRIORITY, BOARD_PRIORITY } from "../../core/constants.js";
import { AiUtils } from "../utils.js";
import { RuleAwareHeuristics } from "../rule-heuristics.js";
import { AiSimulator } from "../simulator.js";
import { AiDiagnostics } from "../diagnostics.js";

interface ScoredCandidate {
  move: AiMove;
  score: number;
}

export class NormalAiStrategy {
  private static readonly BLUNDER_RATE = 0.12;

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

    const scored = candidates.map((move) => ({
      move,
      score: this.scoreMove(snapshot, move),
    }));

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

  private static scoreMove(snapshot: GameSnapshot, move: AiMove): number {
    const board = snapshot.boards[move.boardIndex];
    if (!board) {
      return -Infinity;
    }

    let score = 0;
    const isBattle = snapshot.ruleSet === "battle";
    const contestedBoard = Boolean(board.winner && isBattle && !board.isFull);

    // Base priority scores
    score += BOARD_PRIORITY[move.boardIndex] ?? 0;
    score += CELL_PRIORITY[move.cellIndex] ?? 0;

    // Board-level scoring
    if (!board.winner || contestedBoard) {
      score += AiUtils.patternOpportunityScore(board.cells, "O", move.cellIndex);
      score += AiUtils.patternBlockScore(board.cells, "X", move.cellIndex);
    } else if (board.winner === "X") {
      score -= isBattle ? 0.75 : 2;
    } else if (board.winner === "O") {
      score -= isBattle ? 0.25 : 0.5;
    }

    // Target board evaluation
    const targetBoardIndex = move.cellIndex;
    const targetBoard = snapshot.boards[targetBoardIndex];
    if (targetBoard) {
      if (targetBoard.isFull) {
        score += 2; // Sending opponent to full board is good
      } else if (targetBoard.winner === "O") {
        score += isBattle ? 0.75 : 1.5; // Still decent in battle, but riskier
      } else if (targetBoard.winner === "X") {
        score -= isBattle ? 0.75 : 1.5; // Smaller penalty in battle—they're vulnerable too
      } else {
        score += AiUtils.evaluateBoardComfort(targetBoard);
      }
    } else {
      score += 0.5;
    }

    // Rule-aware routing bonuses
    score += RuleAwareHeuristics.moveBonus(snapshot, move, "O");

    // Macro-level threat creation
    if (AiUtils.createsMacroThreat(snapshot, move)) {
      score += 2.5;
    }

    // Simulate immediate punishments (1 ply look-ahead)
    score += this.simulateImmediatePunish(snapshot, move);

    // Add tiny random factor for tie-breaking
    return score + Math.random() * 0.001;
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
