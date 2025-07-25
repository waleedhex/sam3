import { useState } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { DifficultyScreen } from '@/components/DifficultyScreen';
import { GameScreen } from '@/components/GameScreen';
import { ResultsScreen } from '@/components/ResultsScreen';

type GamePhase = 'auth' | 'setup' | 'playing' | 'results';

const Index = () => {
  const [phase, setPhase] = useState<GamePhase>('auth');
  const [gameSettings, setGameSettings] = useState<{
    difficulty: 'easy' | 'hard' | 'random';
    timeLimit: number;
  } | null>(null);
  const [gameResults, setGameResults] = useState<{
    team1Score: number;
    team2Score: number;
  } | null>(null);

  const handleAuthenticated = () => {
    setPhase('setup');
  };

  const handleStartGame = (difficulty: 'easy' | 'hard' | 'random', timeLimit: number) => {
    setGameSettings({ difficulty, timeLimit });
    setPhase('playing');
  };

  const handleGameEnd = (team1Score: number, team2Score: number) => {
    setGameResults({ team1Score, team2Score });
    setPhase('results');
  };

  const handleBackToSetup = () => {
    setPhase('setup');
    setGameSettings(null);
    setGameResults(null);
  };

  if (phase === 'auth') {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (phase === 'setup') {
    return <DifficultyScreen onStartGame={handleStartGame} />;
  }

  if (phase === 'playing' && gameSettings) {
    return (
      <GameScreen
        difficulty={gameSettings.difficulty}
        timeLimit={gameSettings.timeLimit}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (phase === 'results' && gameResults) {
    return (
      <ResultsScreen
        team1Score={gameResults.team1Score}
        team2Score={gameResults.team2Score}
        onPlayAgain={() => {
          setGameResults(null);
          setPhase('playing');
        }}
        onBackToHome={handleBackToSetup}
      />
    );
  }

  return null;
};

export default Index;
