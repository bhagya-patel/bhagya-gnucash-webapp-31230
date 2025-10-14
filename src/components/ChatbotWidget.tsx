import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const quickActions = [
    'Categorize expenses',
    'Generate invoice',
    'Calculate profit/loss',
    'Budget forecast'
  ];

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Handle quick action
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-24 w-[380px] h-[600px] bg-card rounded-2xl shadow-2xl flex flex-col z-40 border border-border animate-scale-in">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Bhagya Patel</h3>
                <p className="text-xs text-blue-100">Financial Expert</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 bg-[#1a1d29] p-6 overflow-y-auto">
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center text-sm leading-relaxed">
                Hi! I'm Bhagya, your financial assistant. How can I help you today?
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1a1d29] px-4 pb-4 flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full"
              >
                {action}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-[#0f1117] p-4 rounded-b-2xl flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about your finances..."
              className="flex-1 bg-[#1a1d29] border-none text-foreground placeholder:text-muted-foreground"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Chat Icon */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl z-40 animate-fade-in"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  );
};
