import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import resultsSticker from '@/assets/results-sticker.png';
import victorySticker from '@/assets/victory-sticker.png';

interface ResultsScreenProps {
  team1Score: number;
  team2Score: number;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const ResultsScreen = ({ team1Score, team2Score, onPlayAgain, onBackToHome }: ResultsScreenProps) => {
  const winner = team1Score > team2Score ? 1 : team2Score > team1Score ? 2 : null;
  const isDraw = team1Score === team2Score;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background p-4 overflow-hidden" dir="rtl">
      {/* Results Sticker */}
      <div className="absolute top-8">
        <img 
          src={resultsSticker} 
          alt="النتائج النهائية" 
          className="w-24 h-24 drop-shadow-lg"
        />
      </div>

      <Card className="w-full max-w-sm border-2 border-game-primary/20 bg-gradient-card backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-game-primary flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6" />
            النتائج النهائية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Winner announcement */}
          {!isDraw ? (
            <div className="text-center space-y-4">
              <img 
                src={victorySticker} 
                alt="فوز!" 
                className="w-16 h-16 mx-auto"
              />
              <div className="text-lg font-bold text-game-accent">
                🎉 الفائز 🎉
              </div>
              <Badge 
                className={`text-lg px-4 py-2 ${
                  winner === 1 ? 'bg-team-1 text-white' : 'bg-team-2 text-white'
                }`}
              >
                الفريق {winner}
              </Badge>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-lg font-bold text-game-accent">
                🤝 تعادل 🤝
              </div>
            </div>
          )}

          {/* Scores */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg border border-team-1/30 bg-team-1/10">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">الفريق الأول</div>
                <div className="text-xl font-bold text-team-1">{team1Score} نقطة</div>
              </div>
              <Trophy className="h-5 w-5 text-team-1" />
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg border border-team-2/30 bg-team-2/10">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">الفريق الثاني</div>
                <div className="text-xl font-bold text-team-2">{team2Score} نقطة</div>
              </div>
              <Trophy className="h-5 w-5 text-team-2" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onPlayAgain}
              className="w-full bg-game-primary text-game-primary-foreground hover:bg-game-primary/90 h-12"
            >
              <RotateCcw className="ml-2 h-4 w-4" />
              لعب مرة أخرى
            </Button>
            
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="w-full border-game-secondary text-game-secondary hover:bg-game-secondary hover:text-game-secondary-foreground h-12"
            >
              <Home className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};