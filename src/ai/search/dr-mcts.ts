import { GameSnapshot, Player, AiMove } from "../../core/types.js";
import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { AiEvaluator } from "../evaluator.js";

interface MctsNode {
  move: AiMove | null;
  state: GameSnapshot;
  parent: MctsNode | null;
  children: MctsNode[];
  unexpanded: AiMove[];
  visits: number;
  totalValue: number;
}

export interface DrMctsResult {
  move: AiMove;
  visits: number;
  value: number;
}

interface DrMctsOptions {
  maxTimeMs?: number;
  iterations?: number;
  exploration?: number;
}

export class DrMctsSearch {
  public static run(
    snapshot: GameSnapshot,
    player: Player,
    options?: DrMctsOptions,
  ): DrMctsResult[] {
    const root: MctsNode = this.createNode(null, snapshot);
    const maxTime = options?.maxTimeMs ?? 350;
    const deadline = performance.now() + maxTime;
    const maxIterations = options?.iterations ?? 600;
    const exploration = options?.exploration ?? 1.1;

    let iterations = 0;
    while (iterations < maxIterations && performance.now() < deadline) {
      iterations += 1;
      const path = this.select(root, exploration);
      const leaf = path[path.length - 1]!;
      const expanded = this.expand(leaf);
      const evalNode = expanded ?? leaf;
      const value = this.evaluateNode(evalNode, player);
      const nodesToUpdate = expanded ? [...path, expanded] : path;
      this.backpropagate(nodesToUpdate, value);
    }

    return root.children
      .filter((child) => child.move)
      .map((child) => ({
        move: child.move!,
        visits: child.visits,
        value: child.visits > 0 ? child.totalValue / child.visits : 0,
      }))
      .sort((a, b) => b.visits - a.visits);
  }

  private static createNode(move: AiMove | null, state: GameSnapshot, parent: MctsNode | null = null): MctsNode {
    return {
      move,
      state,
      parent,
      children: [],
      unexpanded: AiUtils.collectCandidates(state),
      visits: 0,
      totalValue: 0,
    };
  }

  private static select(root: MctsNode, exploration: number): MctsNode[] {
    const path: MctsNode[] = [root];
    let node = root;
    while (node.unexpanded.length === 0 && node.children.length > 0 && node.state.status === "playing") {
      node = this.bestChild(node, exploration);
      path.push(node);
    }
    return path;
  }

  private static bestChild(node: MctsNode, exploration: number): MctsNode {
    const totalVisits = Math.max(1, node.visits);
    let bestScore = -Infinity;
    let bestChild = node.children[0]!;
    for (const child of node.children) {
      const mean = child.visits > 0 ? child.totalValue / child.visits : 0;
      const bonus = Math.sqrt(Math.log(totalVisits + 1) / (child.visits + 1)) * exploration;
      const score = mean + bonus;
      if (score > bestScore) {
        bestScore = score;
        bestChild = child;
      }
    }
    return bestChild;
  }

  private static expand(node: MctsNode): MctsNode | null {
    if (node.state.status !== "playing") {
      return null;
    }
    if (node.unexpanded.length === 0) {
      return null;
    }
    const move = node.unexpanded.pop()!;
    const next = AiSimulator.applyMove(node.state, move, node.state.currentPlayer);
    if (!next) {
      return null;
    }
    const child = this.createNode(move, next, node);
    node.children.push(child);
    return child;
  }

  private static evaluateNode(node: MctsNode, player: Player): number {
    const score = AiEvaluator.evaluate(node.state, player);
    const normalized = Math.max(-1, Math.min(1, score / 1000));
    return normalized;
  }

  private static backpropagate(nodes: MctsNode[], value: number): void {
    nodes.forEach((node) => {
      node.visits += 1;
      node.totalValue += value;
    });
  }
}
