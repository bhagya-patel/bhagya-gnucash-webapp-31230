import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatbotWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Bhagya, your financial assistant. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    'Categorize expenses',
    'Generate invoice',
    'Calculate profit/loss',
    'Budget forecast'
  ];

  const handleQuickAction = async (action: string) => {
    const userMessage: Message = { role: 'user', content: action };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          action 
        }
      });

      if (error) throw error;

      if (data?.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: Message = { role: 'user', content: message.trim() };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke('financial-chat', {
          body: { 
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
          }
        });

        if (error) throw error;

        if (data?.response) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        }
      } catch (error) {
        console.error('Error calling AI:', error);
        toast({
          title: "Error",
          description: "Failed to get response. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
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
            {messages.length === 1 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  {messages[0].content}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Ask me about your finances..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1d29] border-none text-foreground placeholder:text-muted-foreground"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 rounded-full disabled:opacity-50"
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
