import { useState } from 'react';
import { AccountHeader } from '@/components/AccountHeader';
import { Settings2, BookOpen, Building2, ArrowRightLeft, Cloud, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsProps {
  onNavigate: (page: string) => void;
  onBack: () => void;
}

export const Settings = ({ onNavigate, onBack }: SettingsProps) => {
  const settingsItems = [
    { id: 'general', icon: Settings2, label: 'General', onClick: () => onNavigate('general') },
    { id: 'books', icon: BookOpen, label: 'Manage Books', onClick: () => onNavigate('books') },
    { id: 'accounts', icon: Building2, label: 'Accounts', onClick: () => onNavigate('accounts') },
    { id: 'transactions', icon: ArrowRightLeft, label: 'Transactions', onClick: () => onNavigate('transactions') },
    { id: 'backup', icon: Cloud, label: 'Backup & export', onClick: () => onNavigate('backup') },
    { id: 'about', icon: Info, label: 'About', onClick: () => onNavigate('about') },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="Settings"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start px-6 py-6 h-auto text-foreground hover:bg-secondary/80 transition-smooth rounded-none border-b border-border group"
              onClick={item.onClick}
            >
              <Icon className="h-6 w-6 mr-4 text-muted-foreground group-hover:text-primary transition-smooth" />
              <span className="font-medium text-lg">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
