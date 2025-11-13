type Player = "X" | "O";
type CellValue = Player | null;

type GameStatus = "playing" | "won" | "draw";

type GameMode = "local" | "solo";
type Difficulty = "easy" | "normal" | "hard" | "expert";
type ModeStep = "players" | "difficulty";
type ThemeName =
  | "default"
  | "insomniac"
  | "krayon"
  | "wopr"
  | "sakura"
  | "sunset"
  | "twotone"
  | "vibewave"
  | "redmond"
  | "cupertino";
type StartPreference = "human" | "ai" | "random";
type RuleSet = "classic" | "modern" | "battle";

interface ThemeConfig {
  label: string;
  tokens: Record<string, string>;
}

interface MiniBoardState {
  cells: CellValue[];
  winner: Player | null;
  isDraw: boolean;
  isFull: boolean;
}

interface MoveInfo {
  player: Player;
  boardIndex: number;
  cellIndex: number;
  forcedBoardFull: boolean;
  capturedBoard?: boolean;
  recapturedBoard?: boolean;
  deadBoard?: boolean;
}

interface HistoryEntry {
  turnNumber: number;
  p1Move?: MoveInfo | undefined;
  p2Move?: MoveInfo | undefined;
}

interface GameSnapshot {
  boards: MiniBoardState[];
  currentPlayer: Player;
  activeBoardIndex: number | null;
  allowedBoards: number[];
  status: GameStatus;
  winner: Player | null;
  moveCount: number;
  history: HistoryEntry[];
  lastMove?: MoveInfo | undefined;
  ruleSet: RuleSet;
}

interface MoveAttemptResult {
  success: boolean;
  reason?: string;
}

interface AiProfile {
  difficulty: Difficulty;
}

interface AiMove {
  boardIndex: number;
  cellIndex: number;
}

export type {
  Player,
  CellValue,
  GameStatus,
  GameMode,
  Difficulty,
  ModeStep,
  ThemeName,
  StartPreference,
  RuleSet,
  ThemeConfig,
  MiniBoardState,
  MoveInfo,
  HistoryEntry,
  GameSnapshot,
  MoveAttemptResult,
  AiProfile,
  AiMove,
};
