import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PWAInstallDialog = ({ open, onOpenChange }: PWAInstallDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-game-primary flex items-center justify-center gap-2">
            <Download className="h-5 w-5" />
            حفظ كتطبيق
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 text-right">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-game-primary mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              للهواتف الذكية:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• اضغط على زر المشاركة في المتصفح</li>
              <li>• اختر "إضافة إلى الشاشة الرئيسية"</li>
              <li>• اكتب اسم التطبيق واضغط "إضافة"</li>
            </ul>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-game-primary mb-2">للكمبيوتر:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• اضغط على أيقونة التنزيل في شريط العنوان</li>
              <li>• أو من قائمة المتصفح اختر "تثبيت التطبيق"</li>
            </ul>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            سيعمل التطبيق بدون إنترنت بعد التثبيت
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};