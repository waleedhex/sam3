export interface GameCode {
  code: string;
  used?: boolean;
}

export interface GameState {
  difficulty: 'easy' | 'hard' | 'random';
  timeLimit: number; // in seconds
  currentRound: number;
  team1Score: number;
  team2Score: number;
  currentTeam: 1 | 2;
  isPlaying: boolean;
  timeRemaining: number;
  showSolution: boolean;
  audioPlayed: boolean;
}

export interface GameRound {
  audioFile: string;
  imageFile: string;
  difficulty: 'easy' | 'hard';
}