import { ArrowLeft, Search, Eye, Menu, Check } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

interface AccountHeaderProps {
  title: string;
  color?: string;
  showBack?: boolean;
  showSave?: boolean;
  showMenu?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  onMenuClick?: () => void;
}

export const AccountHeader = ({
  title,
  color = '#4CAF50',
  showBack = false,
  showSave = false,
  showMenu = true,
  onBack,
  onSave,
  onMenuClick
}: AccountHeaderProps) => {
  return (
    <header
      className="flex items-center justify-between px-4 h-16 text-white relative z-10 shadow-md"
      style={{ 
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      }}
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {showBack && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            onContextMenu={(e) => e.preventDefault()}
            className="text-white hover:bg-white/20 shrink-0 transition-fast hover:scale-110"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        {showMenu && !showBack && onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-white hover:bg-white/20 shrink-0 transition-fast hover:scale-110"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <h1 className="text-xl font-semibold truncate tracking-wide">{title}</h1>
      </div>
      <div className="flex items-center gap-0 shrink-0">
        {showSave && onSave ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            onContextMenu={(e) => e.preventDefault()}
            className="text-white hover:bg-white/20 transition-fast hover:scale-110"
          >
            <Check className="h-6 w-6" />
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 transition-fast hover:scale-110"
            >
              <Search className="h-6 w-6" />
            </Button>
            <ThemeToggle />
          </>
        )}
      </div>
    </header>
  );
};
