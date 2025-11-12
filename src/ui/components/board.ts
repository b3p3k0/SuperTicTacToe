import { GameSnapshot } from "../../core/types.js";
import { BOARD_COUNT, CELLS_PER_BOARD } from "../../core/constants.js";

export class BoardRenderer {
  private boardContainer: HTMLElement;
  private miniBoards: HTMLElement[] = [];
  private cellButtons: HTMLButtonElement[][] = [];

  private onCellClick?: (boardIndex: number, cellIndex: number) => void;

  constructor(boardContainer: HTMLElement) {
    console.log("🎯 BoardRenderer constructor starting...");
    console.log("🔍 Board container:", boardContainer);
    this.boardContainer = boardContainer;
    this.buildBoards();
    console.log("✅ BoardRenderer constructor complete");
  }

  setCellClickHandler(handler: (boardIndex: number, cellIndex: number) => void): void {
    console.log("🎯 Setting cell click handler...");
    this.onCellClick = handler;
  }

  setBoardLocked(locked: boolean): void {
    this.boardContainer.classList.toggle("board-locked", locked);
  }

  private buildBoards(): void {
    console.log("🏗️ Building game boards...");
    for (let boardIndex = 0; boardIndex < BOARD_COUNT; boardIndex += 1) {
      const miniBoard = document.createElement("div");
      miniBoard.className = "mini-board";
      miniBoard.dataset.boardIndex = boardIndex.toString();
      miniBoard.setAttribute("role", "grid");
      miniBoard.setAttribute(
        "aria-label",
        `Big Board ${boardIndex + 1} (cells 1-9)`
      );

      const buttons: HTMLButtonElement[] = [];
      for (let cellIndex = 0; cellIndex < CELLS_PER_BOARD; cellIndex += 1) {
        const cellButton = document.createElement("button");
        cellButton.type = "button";
        cellButton.className = "cell";
        cellButton.dataset.boardIndex = boardIndex.toString();
        cellButton.dataset.cellIndex = cellIndex.toString();
        cellButton.setAttribute(
          "aria-label",
          `Board ${boardIndex + 1}, Square ${cellIndex + 1}`
        );

        cellButton.addEventListener("click", () => {
          console.log("🖱️ CELL EVENT FIRED:", { boardIndex, cellIndex, hasHandler: !!this.onCellClick });
          this.onCellClick?.(boardIndex, cellIndex);
        });

        miniBoard.appendChild(cellButton);
        buttons.push(cellButton);
      }

      this.boardContainer.appendChild(miniBoard);
      this.miniBoards.push(miniBoard);
      this.cellButtons.push(buttons);
    }
  }

  updateBoards(snapshot: GameSnapshot, humanInputLocked: boolean): void {
    console.log("🎯 BOARD UPDATE START");
    console.log("🎯 BOARD - humanInputLocked:", humanInputLocked);
    console.log("🎯 BOARD - snapshot.allowedBoards:", snapshot.allowedBoards);
    console.log("🎯 BOARD - snapshot.status:", snapshot.status);

    const allowedSet = new Set(snapshot.allowedBoards);

    console.log("🎯 BOARD - Setting board-locked class:", humanInputLocked);
    this.setBoardLocked(humanInputLocked);

    this.miniBoards.forEach((boardEl, index) => {
      const state = snapshot.boards[index];
      if (!state) {
        return;
      }

      // Update board classes
      boardEl.classList.toggle(
        "active-board",
        snapshot.activeBoardIndex === index && allowedSet.has(index)
      );
      boardEl.classList.toggle(
        "free-choice",
        snapshot.activeBoardIndex === null && allowedSet.has(index)
      );
      boardEl.classList.toggle("captured-p1", state.winner === "X");
      boardEl.classList.toggle("captured-p2", state.winner === "O");
      boardEl.classList.toggle("drawn", state.isDraw && !state.winner);
      boardEl.classList.toggle(
        "disabled",
        snapshot.status !== "playing" || (!allowedSet.has(index) && state.isFull)
      );

      // Update cell buttons
      const cells = this.cellButtons[index];
      if (!cells) {
        console.warn("🎯 BOARD - No cell buttons found for board", index);
        return;
      }

      let enabledCells = 0;
      let disabledCells = 0;

      cells.forEach((button, cellIdx) => {
        const value = state.cells[cellIdx];
        button.textContent = value ?? "";
        button.classList.toggle("p1", value === "X");
        button.classList.toggle("p2", value === "O");

        const shouldDisable =
          value !== null ||
          snapshot.status !== "playing" ||
          !allowedSet.has(index);

        button.disabled = shouldDisable;

        if (shouldDisable) {
          disabledCells++;
        } else {
          enabledCells++;
        }

        const isLastMove =
          !!snapshot.lastMove &&
          snapshot.lastMove.boardIndex === index &&
          snapshot.lastMove.cellIndex === cellIdx;
        button.classList.toggle("last-move", isLastMove);

        // Check if this cell should be clickable for human
        if (!shouldDisable && !humanInputLocked) {
          // Log a sample cell that should be clickable
          if (cellIdx === 0) {
            console.log("🎯 BOARD - Sample clickable cell:", {
              board: index,
              cell: cellIdx,
              hasEventHandler: !!this.onCellClick,
              buttonDisabled: button.disabled,
              humanInputLocked
            });
          }
        }
      });

      console.log(`🎯 BOARD - Board ${index}: enabled=${enabledCells}, disabled=${disabledCells}`);
    });

    console.log("🎯 BOARD - Event handler available:", !!this.onCellClick);
    console.log("🎯 BOARD UPDATE COMPLETE");
  }
}
