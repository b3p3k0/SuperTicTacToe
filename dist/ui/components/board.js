import { BOARD_COUNT, CELLS_PER_BOARD } from "../../core/constants.js";
export class BoardRenderer {
    constructor(boardContainer) {
        this.miniBoards = [];
        this.cellButtons = [];
        this.boardContainer = boardContainer;
        this.buildBoards();
    }
    setCellClickHandler(handler) {
        this.onCellClick = handler;
    }
    setBoardLocked(locked) {
        this.boardContainer.classList.toggle("board-locked", locked);
    }
    buildBoards() {
        for (let boardIndex = 0; boardIndex < BOARD_COUNT; boardIndex += 1) {
            const miniBoard = document.createElement("div");
            miniBoard.className = "mini-board";
            miniBoard.dataset.boardIndex = boardIndex.toString();
            miniBoard.setAttribute("role", "grid");
            miniBoard.setAttribute("aria-label", `Big Board ${boardIndex + 1} (cells 1-9)`);
            const buttons = [];
            for (let cellIndex = 0; cellIndex < CELLS_PER_BOARD; cellIndex += 1) {
                const cellButton = document.createElement("button");
                cellButton.type = "button";
                cellButton.className = "cell";
                cellButton.dataset.boardIndex = boardIndex.toString();
                cellButton.dataset.cellIndex = cellIndex.toString();
                cellButton.setAttribute("aria-label", `Board ${boardIndex + 1}, Square ${cellIndex + 1}`);
                cellButton.addEventListener("click", () => {
                    var _a;
                    (_a = this.onCellClick) === null || _a === void 0 ? void 0 : _a.call(this, boardIndex, cellIndex);
                });
                miniBoard.appendChild(cellButton);
                buttons.push(cellButton);
            }
            this.boardContainer.appendChild(miniBoard);
            this.miniBoards.push(miniBoard);
            this.cellButtons.push(buttons);
        }
    }
    updateBoards(snapshot, humanInputLocked) {
        const allowedSet = new Set(snapshot.allowedBoards);
        this.setBoardLocked(humanInputLocked);
        this.miniBoards.forEach((boardEl, index) => {
            const state = snapshot.boards[index];
            if (!state) {
                return;
            }
            // Update board classes
            boardEl.classList.toggle("active-board", snapshot.activeBoardIndex === index && allowedSet.has(index));
            boardEl.classList.toggle("free-choice", snapshot.activeBoardIndex === null && allowedSet.has(index));
            boardEl.classList.toggle("captured-p1", state.winner === "X");
            boardEl.classList.toggle("captured-p2", state.winner === "O");
            boardEl.classList.toggle("drawn", state.isDraw && !state.winner);
            boardEl.classList.toggle("disabled", snapshot.status !== "playing" || (!allowedSet.has(index) && state.isFull));
            // Update cell buttons
            const cells = this.cellButtons[index];
            if (!cells) {
                console.warn("🎯 BOARD - No cell buttons found for board", index);
                return;
            }
            cells.forEach((button, cellIdx) => {
                const value = state.cells[cellIdx];
                button.textContent = value !== null && value !== void 0 ? value : "";
                button.classList.toggle("p1", value === "X");
                button.classList.toggle("p2", value === "O");
                const shouldDisable = value !== null ||
                    snapshot.status !== "playing" ||
                    !allowedSet.has(index);
                button.disabled = shouldDisable;
                const isLastMove = !!snapshot.lastMove &&
                    snapshot.lastMove.boardIndex === index &&
                    snapshot.lastMove.cellIndex === cellIdx;
                button.classList.toggle("last-move", isLastMove);
            });
        });
    }
}
