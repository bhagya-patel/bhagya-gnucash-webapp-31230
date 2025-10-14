import { AccountHeader } from '@/components/AccountHeader';
import { Info, Code, Mail, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutProps {
  onBack: () => void;
}

export const About = ({ onBack }: AboutProps) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AccountHeader
        title="About"
        color="#4CAF50"
        showBack
        showMenu={false}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <span className="text-5xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">GnuCash Mobile</h1>
          <p className="text-muted-foreground mb-1">Version 1.0.0</p>
          <p className="text-sm text-muted-foreground mb-8">Build 2025.10.01</p>

          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <p className="text-foreground leading-relaxed">
              A powerful double-entry accounting system designed for personal and small business finance management. 
              Track your expenses, income, assets, and liabilities with ease.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-2"
              onClick={() => window.open('https://www.gnucash.org', '_blank')}
            >
              <Info className="h-5 w-5 mr-3 text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium">Official Website</p>
                <p className="text-sm text-muted-foreground">www.gnucash.org</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-2"
            >
              <Code className="h-5 w-5 mr-3 text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium">Open Source</p>
                <p className="text-sm text-muted-foreground">Licensed under GPL v3</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-2"
            >
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <div className="flex-1 text-left">
                <p className="font-medium">Support</p>
                <p className="text-sm text-muted-foreground">support@gnucash.org</p>
              </div>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by the GnuCash Team</span>
          </div>
        </div>
      </div>
    </div>
  );
};
