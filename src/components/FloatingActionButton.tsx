import { Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-accent to-accent-glow text-accent-foreground shadow-material-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 z-50 animate-pulse-glow"
      size="icon"
    >
      <Plus className="h-8 w-8 text-white transition-transform group-hover:rotate-90" />
    </Button>
  );
};
