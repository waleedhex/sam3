import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Eye, 
  RotateCcw, 
  Users, 
  Trophy,
  Volume2,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GameState, GameRound } from '@/types/game';
import countdownSticker from '@/assets/countdown-sticker.png';
import waitingSticker from '@/assets/waiting-sticker.png';

interface GameScreenProps {
  difficulty: 'easy' | 'hard' | 'random';
  timeLimit: number;
  onGameEnd: (team1Score: number, team2Score: number) => void;
}

export const GameScreen = ({ difficulty, timeLimit, onGameEnd }: GameScreenProps) => {
  const [gameState, setGameState] = useState<GameState>({
    difficulty,
    timeLimit,
    currentRound: 1,
    team1Score: 0,
    team2Score: 0,
    currentTeam: 1,
    isPlaying: false,
    timeRemaining: timeLimit,
    showSolution: false,
    audioPlayed: false,
  });

  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const generateRound = (): GameRound => {
    // عدد الملفات حسب المستوى
    const fileCount = {
      easy: 30,  // 30 ملف في المستوى السهل
      hard: 70   // 70 ملف في المستوى الصعب
    };
    
    let roundDifficulty: 'easy' | 'hard';
    
    if (difficulty === 'random') {
      roundDifficulty = Math.random() > 0.5 ? 'easy' : 'hard';
    } else {
      roundDifficulty = difficulty;
    }
    
    const maxFiles = fileCount[roundDifficulty];
    const roundNumber = Math.floor(Math.random() * maxFiles) + 1;

    return {
      audioFile: `/assets/${roundDifficulty}/audio${roundNumber}.mp3`,
      imageFile: `/assets/${roundDifficulty}/image${roundNumber}.webp`,
      difficulty: roundDifficulty,
    };
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          startRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRound = () => {
    const round = generateRound();
    setCurrentRound(round);
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      timeRemaining: timeLimit,
      showSolution: false,
      audioPlayed: false,
    }));

    // Play audio automatically after countdown
    setTimeout(() => {
      playAudio();
    }, 500);

    // Start timer
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 0.1;
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, timeRemaining: 0, isPlaying: false };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 100);
  };

  const playAudio = () => {
    if (currentRound && audioRef.current) {
      audioRef.current.src = currentRound.audioFile;
      audioRef.current.play().catch(() => {
        toast({
          title: "خطأ في تشغيل الصوت",
          description: "تعذر تشغيل الملف الصوتي",
          variant: "destructive",
        });
      });
    }
  };

  const replayAudio = () => {
    setGameState(prev => ({ ...prev, audioPlayed: true }));
    playAudio();
  };

  const showSolution = () => {
    setGameState(prev => ({ ...prev, showSolution: true }));
  };

  const addScore = () => {
    const points = gameState.audioPlayed ? 1 : 2;
    setGameState(prev => ({
      ...prev,
      [`team${prev.currentTeam}Score`]: prev.currentTeam === 1 ? prev.team1Score + points : prev.team2Score + points,
    }));

    toast({
      title: `نقاط للفريق ${gameState.currentTeam}!`,
      description: `تم إضافة ${points} نقطة`,
    });
  };

  const nextRound = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Check if game should end (after 10 rounds or if one team has significant lead)
    if (gameState.currentRound >= 10 || Math.abs(gameState.team1Score - gameState.team2Score) >= 5) {
      onGameEnd(gameState.team1Score, gameState.team2Score);
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentTeam: prev.currentTeam === 1 ? 2 : 1,
      isPlaying: false,
      showSolution: false,
      audioPlayed: false,
    }));
    
    startCountdown();
  };

  useEffect(() => {
    startCountdown();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const progressPercentage = ((timeLimit - gameState.timeRemaining) / timeLimit) * 100;

  if (isCountingDown) {
    return (
      <div className="min-h-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background pb-safe pt-safe overflow-y-auto">
        <div className="text-center">
          <img 
            src={countdownSticker} 
            alt="عداد تنازلي" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <div className="text-6xl font-bold text-game-primary mb-4 animate-pulse">
            {countdown}
          </div>
          <div className="text-lg text-muted-foreground">
            الجولة {gameState.currentRound} - الفريق {gameState.currentTeam}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col landscape:flex-row-reverse bg-gradient-to-br from-background via-card to-background pb-safe pt-safe overflow-y-auto" dir="rtl">
      <audio ref={audioRef} />
      
      {/* Header with scores - Portrait mode only */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0 landscape:hidden">
        <Card className="border border-white/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1 border-white/20">
                  الجولة {gameState.currentRound}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 ${
                    gameState.currentTeam === 1 ? 'border-team-1 text-team-1' : 'border-team-2 text-team-2'
                  }`}
                >
                  الفريق {gameState.currentTeam}
                </Badge>
              </div>
              
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">فريق 1</div>
                  <div className="text-lg font-bold text-team-1 flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {gameState.team1Score}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">فريق 2</div>
                  <div className="text-lg font-bold text-team-2 flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {gameState.team2Score}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image area - Right side in landscape, increased height in portrait */}
      <div className="flex-[2] px-4 pb-2 landscape:px-2 landscape:pb-4 landscape:w-1/2 landscape:flex-1">
        <Card className="h-full border border-white/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-4 h-full flex flex-col landscape:p-3">
            <div className="flex-1 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center bg-muted/20 relative">
              {gameState.showSolution && currentRound ? (
                <img 
                  src={currentRound.imageFile} 
                  alt="الحل"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={() => {
                    toast({
                      title: "خطأ في تحميل الصورة",
                      description: "تعذر عرض الصورة",
                      variant: "destructive",
                    });
                  }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <img 
                    src={waitingSticker} 
                    alt="انتظار" 
                    className="w-32 h-32 mx-auto mb-2"
                  />
                  <p className="text-sm">اضغط "إظهار الحل" لرؤية الصورة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls area - Left side in landscape */}
      <div className="px-4 pb-4 flex-shrink-0 landscape:px-2 landscape:pb-4 landscape:w-1/2 landscape:flex landscape:flex-col">
        <Card className="border border-white/20 bg-gradient-card backdrop-blur-sm landscape:h-full">
          <CardContent className="p-4 space-y-3 landscape:p-3 landscape:space-y-2 landscape:h-full landscape:flex landscape:flex-col">
            
            {/* Header with scores - Landscape mode only */}
            <div className="hidden landscape:block">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-1 border-white/20">
                  الجولة {gameState.currentRound}
                </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 ${
                      gameState.currentTeam === 1 ? 'border-team-1 text-team-1' : 'border-team-2 text-team-2'
                    }`}
                  >
                    الفريق {gameState.currentTeam}
                  </Badge>
                </div>
                
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">فريق 1</div>
                    <div className="text-sm font-bold text-team-1 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {gameState.team1Score}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground">فريق 2</div>
                    <div className="text-sm font-bold text-team-2 flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {gameState.team2Score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Audio section */}
            <div className="text-center space-y-3 landscape:flex-1 landscape:flex landscape:flex-col landscape:justify-center">
              <div className="flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-game-primary" />
              </div>
              
              {/* Timer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الوقت المتبقي</span>
                  <span className="text-lg font-bold">
                    {Math.floor(gameState.timeRemaining / 60)}:{Math.floor(gameState.timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
              </div>

              {/* Audio controls */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={replayAudio}
                  variant="outline"
                  size="sm"
                  className="border-game-secondary text-game-secondary hover:bg-game-secondary hover:text-game-secondary-foreground"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  إعادة
                </Button>
                
                <Button
                  onClick={showSolution}
                  variant="outline"
                  size="sm"
                  className="border-game-accent text-game-accent hover:bg-game-accent hover:text-game-accent-foreground"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  إظهار الحل
                </Button>
              </div>
            </div>

            {/* Game controls */}
            <div className="flex flex-col gap-3 landscape:gap-2">
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={addScore}
                  size="sm"
                  className="bg-game-primary text-game-primary-foreground hover:bg-game-primary/90 flex-1"
                >
                  <Trophy className="mr-1 h-4 w-4" />
                  نقطة
                </Button>
                
                <Button
                  onClick={nextRound}
                  size="sm"
                  className="bg-game-secondary text-game-secondary-foreground hover:bg-game-secondary/90 flex-1"
                >
                  التالي
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={() => onGameEnd(gameState.team1Score, gameState.team2Score)}
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full"
              >
                إنهاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};