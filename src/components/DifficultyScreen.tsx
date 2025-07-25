import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Clock, Gamepad2, Download } from 'lucide-react';
import { PWAInstallDialog } from '@/components/PWAInstallDialog';
import { usePWA } from '@/hooks/usePWA';

interface DifficultyScreenProps {
  onStartGame: (difficulty: 'easy' | 'hard' | 'random', timeLimit: number) => void;
}

export const DifficultyScreen = ({ onStartGame }: DifficultyScreenProps) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | 'random'>('easy');
  const [timeLimit, setTimeLimit] = useState([30]); // in seconds
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const { isStandalone } = usePWA();

  const handleStart = () => {
    onStartGame(difficulty, timeLimit[0]);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} ثانية`;
    }
    return `${Math.floor(seconds / 60)} دقيقة`;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4 overflow-hidden">
      <Card className="w-full max-w-sm border-2 border-game-primary/20 bg-gradient-card backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-game-primary flex items-center justify-center gap-2">
            <Gamepad2 className="h-6 w-6" />
            إعدادات اللعبة
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            اختر مستوى الصعوبة ووقت الإجابة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">مستوى الصعوبة</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as 'easy' | 'hard' | 'random')}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-game-primary/20 hover:border-game-primary/40 transition-colors">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy" className="cursor-pointer text-right flex-1">
                  <div className="font-semibold text-game-primary text-sm">سهل</div>
                  <div className="text-xs text-muted-foreground">أصوات واضحة</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-game-secondary/20 hover:border-game-secondary/40 transition-colors">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard" className="cursor-pointer text-right flex-1">
                  <div className="font-semibold text-game-secondary text-sm">صعب</div>
                  <div className="text-xs text-muted-foreground">أصوات معقدة</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border border-game-accent/20 hover:border-game-accent/40 transition-colors">
                <RadioGroupItem value="random" id="random" />
                <Label htmlFor="random" className="cursor-pointer text-right flex-1">
                  <div className="font-semibold text-game-accent text-sm">عشوائي</div>
                  <div className="text-xs text-muted-foreground">خليط متنوع</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              وقت الإجابة: {formatTime(timeLimit[0])}
            </Label>
            <Slider
              value={timeLimit}
              onValueChange={setTimeLimit}
              max={120}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 ثواني</span>
              <span>دقيقتان</span>
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-game-primary text-game-primary-foreground hover:bg-game-primary/90 transition-all duration-300 text-base py-4 h-12"
          >
            <Play className="mr-2 h-4 w-4" />
            ابدأ اللعبة
          </Button>

          {!isStandalone && (
            <Button
              onClick={() => setShowInstallDialog(true)}
              variant="outline"
              className="w-full border-game-primary/30 text-game-primary hover:bg-game-primary/10 transition-all duration-300 text-sm py-3 h-10"
            >
              <Download className="mr-2 h-4 w-4" />
              حفظ كتطبيق
            </Button>
          )}
        </CardContent>
      </Card>
      
      <PWAInstallDialog 
        open={showInstallDialog} 
        onOpenChange={setShowInstallDialog} 
      />
    </div>
  );
};