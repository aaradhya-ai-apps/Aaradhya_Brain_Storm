export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR'
}

export type GameMode = 'MEMORY' | 'QUIZ' | 'TRUE_FALSE' | 'SORTER' | 'ORDER';

export interface CardData {
  id: string;
  pairId: string;
  content: string;
  type: 'term' | 'definition';
  isFlipped: boolean;
  isMatched: boolean;
}

// Game Specific Data Structures
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
}

export interface SorterItem {
  id: string;
  text: string;
  category: 'A' | 'B';
}

export interface SorterData {
  categoryA: string;
  categoryB: string;
  items: SorterItem[];
}

export interface OrderItem {
  id: string;
  content: string;
  correctIndex: number; // 0-based index
}

// Union type for all possible game data
export type GameContent = 
  | GeneratedPair[] 
  | QuizQuestion[] 
  | TrueFalseQuestion[] 
  | SorterData 
  | OrderItem[];

export interface GameConfig {
  sourceType: 'subject' | 'pdf';
  subject: string;
  pdfContent?: string;
  pdfName?: string;
  difficulty: 'Standard' | 'Advanced';
  pairCount: number; // Used as "Item Count" for all modes
  gameMode: GameMode;
}

export interface GeneratedPair {
  term: string;
  match: string;
}

export interface ScoreStats {
  moves: number; // Or "Questions Answered"
  timeElapsed: number; // in seconds
  accuracy: number; // percentage
  timestamp: number;
}
