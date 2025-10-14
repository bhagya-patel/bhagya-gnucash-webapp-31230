import { useState, useEffect } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { Palette, Lock, KeyRound, PieChart } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AppSettings } from '@/types/book';

interface GeneralPreferencesProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const GeneralPreferences = ({ onBack, settings, onUpdateSettings }: GeneralPreferencesProps) => {
  const toggleTheme = () => {
    const root = window.document.documentElement;
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    onUpdateSettings({ ...settings, theme: newTheme });
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="General Preferences"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Appearance Section */}
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Appearance</h3>
          
          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent group"
            onClick={toggleTheme}
          >
            <Palette className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-base">Theme</p>
              <p className="text-sm text-muted-foreground capitalize">{settings.theme} Mode</p>
            </div>
          </Button>
        </div>

        {/* Passcode Section */}
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Passcode Preferences</h3>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Enable passcode</p>
              </div>
            </div>
            <Switch
              checked={settings.passcodeEnabled}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, passcodeEnabled: checked })
              }
            />
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start px-0 py-4 h-auto hover:bg-transparent group"
            disabled={!settings.passcodeEnabled}
          >
            <KeyRound className="h-6 w-6 mr-4 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className={`font-medium text-base ${settings.passcodeEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                Change Passcode
              </p>
            </div>
          </Button>
        </div>

        {/* Report Preferences */}
        <div className="px-6 py-4">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">Report Preferences</h3>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-4">
              <PieChart className="h-6 w-6 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground text-base">Account color in reports</p>
                <p className="text-sm text-muted-foreground">Use account color in the bar/pie chart</p>
              </div>
            </div>
            <Switch
              checked={settings.accountColorInReports}
              onCheckedChange={(checked) => 
                onUpdateSettings({ ...settings, accountColorInReports: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
