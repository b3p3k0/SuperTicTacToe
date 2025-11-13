import { PLAYER_LABELS } from "../../core/constants.js";
export class PanelManager {
    constructor() {
        this.illegalDialog = null;
        this.illegalMessage = null;
        const historyList = document.getElementById("history-list");
        if (!historyList) {
            throw new Error("Missing history list element.");
        }
        this.historyList = historyList;
        this.illegalDialog = document.getElementById("illegal-move-dialog");
        this.illegalMessage = document.getElementById("illegal-move-message");
        this.initPanelToggles();
        this.initIllegalDialog();
        this.syncHistoryLimits();
    }
    initPanelToggles() {
        const panelButtons = document.querySelectorAll(".panel-toggle");
        panelButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.dataset.target;
                if (!targetId)
                    return;
                const panel = document.getElementById(targetId);
                if (!panel)
                    return;
                const expanded = panel.dataset.expanded === "true";
                panel.dataset.expanded = (!expanded).toString();
                button.textContent = expanded ? "Show" : "Hide";
                button.setAttribute("aria-expanded", (!expanded).toString());
                if (targetId === "rules-panel") {
                    this.syncHistoryLimits();
                }
            });
        });
    }
    initIllegalDialog() {
        var _a;
        const dialogClose = document.getElementById("illegal-move-close");
        dialogClose === null || dialogClose === void 0 ? void 0 : dialogClose.addEventListener("click", () => this.closeIllegalDialog());
        (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.addEventListener("close", () => {
            var _a;
            (_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.classList.remove("open");
        });
    }
    updateHistory(history) {
        this.historyList.innerHTML = "";
        if (history.length === 0) {
            const placeholder = document.createElement("li");
            placeholder.textContent = "No moves yet.";
            placeholder.style.color = "var(--muted)";
            this.historyList.appendChild(placeholder);
            return;
        }
        history.forEach((entry) => {
            const item = document.createElement("li");
            item.textContent = this.formatHistoryEntry(entry);
            this.historyList.appendChild(item);
        });
        this.historyList.scrollTop = this.historyList.scrollHeight;
    }
    formatHistoryEntry(entry) {
        const left = entry.p1Move ? this.describeMove(entry.p1Move) : "";
        const right = entry.p2Move ? this.describeMove(entry.p2Move) : "";
        if (left && right) {
            return `T${entry.turnNumber}: ${left} -> ${right}`;
        }
        if (left) {
            return `T${entry.turnNumber}: ${left}`;
        }
        if (right) {
            return `T${entry.turnNumber}: -> ${right}`;
        }
        return `T${entry.turnNumber}:`;
    }
    describeMove(move) {
        const boardLabel = move.boardIndex + 1;
        const cellLabel = move.cellIndex + 1;
        const tags = [];
        if (move.forcedBoardFull) {
            tags.push("F");
        }
        if (move.capturedBoard) {
            tags.push("C");
            if (move.recapturedBoard) {
                tags.push("R");
            }
        }
        else if (move.deadBoard) {
            tags.push("D");
        }
        const suffix = tags.length ? `(${tags.join("")})` : "";
        return `${PLAYER_LABELS[move.player]}BB${boardLabel}LB${cellLabel}${suffix}`;
    }
    showIllegalMove(reason) {
        const message = `Oops! can't move there because ${reason}`;
        if (this.illegalDialog && typeof this.illegalDialog.showModal === "function") {
            if (this.illegalMessage) {
                this.illegalMessage.textContent = message;
            }
            if (!this.illegalDialog.open) {
                this.illegalDialog.showModal();
            }
            else if (this.illegalMessage) {
                this.illegalDialog.close();
                this.illegalDialog.showModal();
            }
            return;
        }
        // Fallback to alert
        window.alert(message);
    }
    closeIllegalDialog() {
        var _a;
        if ((_a = this.illegalDialog) === null || _a === void 0 ? void 0 : _a.open) {
            this.illegalDialog.close();
        }
    }
    syncHistoryLimits() {
        const rulesPanel = document.getElementById("rules-panel");
        const expanded = (rulesPanel === null || rulesPanel === void 0 ? void 0 : rulesPanel.dataset.expanded) === "true";
        this.historyList.classList.toggle("compact-history", expanded);
    }
}
