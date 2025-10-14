import { Folder, Heart, BarChart3, Clock, Upload, Settings, ChevronDown, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader } from './ui/sheet';
import { Button } from './ui/button';
import { useState } from 'react';

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  onFavoritesClick?: () => void;
  onReportsClick?: () => void;
  onScheduledClick?: () => void;
}

export const NavigationDrawer = ({ open, onOpenChange, onSettingsClick, onLogout, onFavoritesClick, onReportsClick, onScheduledClick }: NavigationDrawerProps) => {
  const [bookExpanded, setBookExpanded] = useState(false);

  const menuItems = [
    { section: 'header', icon: Folder, label: 'Open...', onClick: () => {} },
    { section: 'Accounts', items: [
      { icon: Heart, label: 'Favorites', onClick: () => {} },
      { icon: BarChart3, label: 'Reports', onClick: () => {} },
    ]},
    { section: 'Transactions', items: [
      { icon: Clock, label: 'Scheduled Actions', onClick: () => {} },
      { icon: Upload, label: 'Export...', onClick: () => {} },
    ]},
    { section: 'Preferences', items: [
      { icon: Settings, label: 'Settings', onClick: () => {} },
    ]},
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-background border-r border-border shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header with logo */}
          <div className="bg-gradient-to-br from-primary to-primary-glow px-4 py-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-110">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-white dark:text-white text-xl font-semibold tracking-wide">GnuCash</h2>
            </div>
            
            {/* Book dropdown */}
            <Button
              variant="ghost"
              className="w-full justify-between text-white dark:text-white hover:bg-white/20 dark:hover:bg-white/15 px-3 h-10 transition-smooth rounded-lg"
              onClick={() => setBookExpanded(!bookExpanded)}
            >
              <span className="font-medium">Book 1</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${bookExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto bg-background">
            {/* Open item */}
            <div className="border-b border-border">
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none"
              >
                <Folder className="h-5 w-5 mr-3 transition-smooth" />
                <span className="font-medium">Open...</span>
              </Button>
            </div>

            {/* Accounts Section */}
            <div className="py-2">
              <div className="px-4 py-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accounts</h3>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
                onClick={() => {
                  onFavoritesClick && onFavoritesClick();
                }}
              >
                <Heart className="h-5 w-5 mr-3 transition-smooth group-hover:text-red-500" />
                <span className="font-medium">Favorites</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
                onClick={onReportsClick}
              >
                <BarChart3 className="h-5 w-5 mr-3 transition-smooth group-hover:text-primary" />
                <span className="font-medium">Reports</span>
              </Button>
            </div>

            {/* Transactions Section */}
            <div className="py-2 border-t border-border">
              <div className="px-4 py-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transactions</h3>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
              >
                <Clock className="h-5 w-5 mr-3 transition-smooth group-hover:text-primary" />
                <span className="font-medium" onClick={onScheduledClick}>Scheduled Actions</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
              >
                <Upload className="h-5 w-5 mr-3 transition-smooth group-hover:text-primary" />
                <span className="font-medium">Export...</span>
              </Button>
            </div>

            {/* Preferences Section */}
            <div className="py-2 border-t border-border">
              <div className="px-4 py-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferences</h3>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
                onClick={onSettingsClick}
              >
                <Settings className="h-5 w-5 mr-3 transition-smooth group-hover:text-primary" />
                <span className="font-medium">Settings</span>
              </Button>
              {onLogout && (
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto text-foreground hover:bg-accent dark:hover:bg-secondary/80 transition-smooth rounded-none group"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 mr-3 transition-smooth group-hover:text-destructive" />
                  <span className="font-medium">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
