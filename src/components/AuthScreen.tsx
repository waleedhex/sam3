import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePWA } from '@/hooks/usePWA';
import welcomeSticker from '@/assets/welcome-sticker.png';
import waitingSticker from '@/assets/logo-sticker.png';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen = ({ onAuthenticated }: AuthScreenProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isStandalone } = usePWA();

  // Auto-fill code in PWA mode
  useEffect(() => {
    if (isStandalone) {
      const savedCode = localStorage.getItem('gameCode');
      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, [isStandalone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/assets/codes.json');
      const data = await response.json();
      
      if (data.codes.map(c => c.toLowerCase()).includes(code.trim().toLowerCase())) {
        // Save code for PWA auto-fill
        if (isStandalone) {
          localStorage.setItem('gameCode', code.trim());
        }
        
        toast({
          title: "تم قبول الرمز!",
          description: "مرحباً بك في اللعبة",
        });
        onAuthenticated();
      } else {
        toast({
          title: "رمز غير صحيح",
          description: "يرجى التحقق من الرمز والمحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في التحقق من الرمز",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background p-4 overflow-hidden landscape:flex-row landscape:gap-8">
      {/* Welcome Sticker */}
      <div className="absolute top-8">
        <img 
          src={welcomeSticker} 
          alt="مرحباً" 
          className="w-32 h-32 drop-shadow-lg"
        />
      </div>

      <Card className="w-full max-w-sm border-2 border-game-primary/20 bg-gradient-card backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-game-primary">
            أبو مسامع
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            أدخل رمز الدخول للبدء
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="رمز الدخول"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg border-game-primary/30 focus:border-game-primary h-12"
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-game-primary text-game-primary-foreground hover:bg-game-primary/90 transition-all duration-300 h-12"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحقق..." : "دخول"}
            </Button>
          </form>
          
          {/* Bottom Waiting Sticker - Clickable */}
          <div className="text-center mt-6">
            <img 
              src={waitingSticker} 
              alt="حياكم في متجرنا" 
              className="w-24 h-24 mx-auto cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => window.open('https://hex-store.com', '_blank')}
            />
            <p className="text-muted-foreground text-sm mt-2">
              حياكم في متجرنا
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};