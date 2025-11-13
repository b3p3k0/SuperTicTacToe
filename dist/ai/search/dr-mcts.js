import { AiUtils } from "../utils.js";
import { AiSimulator } from "../simulator.js";
import { AiEvaluator } from "../evaluator.js";
export class DrMctsSearch {
    static run(snapshot, player, options) {
        var _a, _b, _c;
        const root = this.createNode(null, snapshot);
        const maxTime = (_a = options === null || options === void 0 ? void 0 : options.maxTimeMs) !== null && _a !== void 0 ? _a : 350;
        const deadline = performance.now() + maxTime;
        const maxIterations = (_b = options === null || options === void 0 ? void 0 : options.iterations) !== null && _b !== void 0 ? _b : 600;
        const exploration = (_c = options === null || options === void 0 ? void 0 : options.exploration) !== null && _c !== void 0 ? _c : 1.1;
        let iterations = 0;
        while (iterations < maxIterations && performance.now() < deadline) {
            iterations += 1;
            const path = this.select(root, exploration);
            const leaf = path[path.length - 1];
            const expanded = this.expand(leaf);
            const evalNode = expanded !== null && expanded !== void 0 ? expanded : leaf;
            const value = this.evaluateNode(evalNode, player);
            const nodesToUpdate = expanded ? [...path, expanded] : path;
            this.backpropagate(nodesToUpdate, value);
        }
        return root.children
            .filter((child) => child.move)
            .map((child) => ({
            move: child.move,
            visits: child.visits,
            value: child.visits > 0 ? child.totalValue / child.visits : 0,
        }))
            .sort((a, b) => b.visits - a.visits);
    }
    static createNode(move, state, parent = null) {
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
    static select(root, exploration) {
        const path = [root];
        let node = root;
        while (node.unexpanded.length === 0 && node.children.length > 0 && node.state.status === "playing") {
            node = this.bestChild(node, exploration);
            path.push(node);
        }
        return path;
    }
    static bestChild(node, exploration) {
        const totalVisits = Math.max(1, node.visits);
        let bestScore = -Infinity;
        let bestChild = node.children[0];
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
    static expand(node) {
        if (node.state.status !== "playing") {
            return null;
        }
        if (node.unexpanded.length === 0) {
            return null;
        }
        const move = node.unexpanded.pop();
        const next = AiSimulator.applyMove(node.state, move, node.state.currentPlayer);
        if (!next) {
            return null;
        }
        const child = this.createNode(move, next, node);
        node.children.push(child);
        return child;
    }
    static evaluateNode(node, player) {
        const score = AiEvaluator.evaluate(node.state, player);
        const normalized = Math.max(-1, Math.min(1, score / 1000));
        return normalized;
    }
    static backpropagate(nodes, value) {
        nodes.forEach((node) => {
            node.visits += 1;
            node.totalValue += value;
        });
    }
}
