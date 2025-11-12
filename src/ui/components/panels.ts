import { HistoryEntry, MoveInfo } from "../../core/types.js";
import { PLAYER_LABELS } from "../../core/constants.js";

export class PanelManager {
  private historyList: HTMLElement;
  private illegalDialog: HTMLDialogElement | null = null;
  private illegalMessage: HTMLElement | null = null;

  constructor() {
    const historyList = document.getElementById("history-list");
    if (!historyList) {
      throw new Error("Missing history list element.");
    }
    this.historyList = historyList;

    this.illegalDialog = document.getElementById("illegal-move-dialog") as HTMLDialogElement;
    this.illegalMessage = document.getElementById("illegal-move-message");

    this.initPanelToggles();
    this.initIllegalDialog();
  }

  private initPanelToggles(): void {
    const panelButtons = document.querySelectorAll(".panel-toggle");
    panelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = (button as HTMLElement).dataset.target;
        if (!targetId) return;

        const panel = document.getElementById(targetId);
        if (!panel) return;

        const expanded = panel.dataset.expanded === "true";
        panel.dataset.expanded = (!expanded).toString();
        button.textContent = expanded ? "Show" : "Hide";
        button.setAttribute("aria-expanded", (!expanded).toString());
      });
    });
  }

  private initIllegalDialog(): void {
    const dialogClose = document.getElementById("illegal-move-close");
    dialogClose?.addEventListener("click", () => this.closeIllegalDialog());

    this.illegalDialog?.addEventListener("close", () => {
      this.illegalDialog?.classList.remove("open");
    });
  }

  updateHistory(history: HistoryEntry[]): void {
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
  }

  private formatHistoryEntry(entry: HistoryEntry): string {
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

  private describeMove(move: MoveInfo): string {
    const boardLabel = move.boardIndex + 1;
    const cellLabel = move.cellIndex + 1;
    const tags: string[] = [];

    if (move.forcedBoardFull) {
      tags.push("F");
    }
    if (move.capturedBoard) {
      tags.push("C");
    } else if (move.deadBoard) {
      tags.push("D");
    }

    const suffix = tags.length ? `(${tags.join("")})` : "";
    return `${PLAYER_LABELS[move.player]}BB${boardLabel}LB${cellLabel}${suffix}`;
  }

  showIllegalMove(reason: string): void {
    const message = `Oops! can't move there because ${reason}`;

    if (this.illegalDialog && typeof this.illegalDialog.showModal === "function") {
      if (this.illegalMessage) {
        this.illegalMessage.textContent = message;
      }

      if (!this.illegalDialog.open) {
        this.illegalDialog.showModal();
      } else if (this.illegalMessage) {
        this.illegalDialog.close();
        this.illegalDialog.showModal();
      }
      return;
    }

    // Fallback to alert
    window.alert(message);
  }

  closeIllegalDialog(): void {
    if (this.illegalDialog?.open) {
      this.illegalDialog.close();
    }
  }
}