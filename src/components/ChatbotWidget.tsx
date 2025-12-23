import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Move } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import openaiLogo from '@/assets/openai-logo.webp';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  x: number;
  y: number;
}

const getWindowSize = () => {
  const isMobile = window.innerWidth < 640;
  return {
    width: isMobile ? Math.min(window.innerWidth - 16, 340) : 380,
    height: isMobile ? Math.min(window.innerHeight - 100, 500) : 600,
  };
};

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
  const [windowSize, setWindowSize] = useState(getWindowSize());
  
  // Draggable state for chat window only
  const [windowPosition, setWindowPosition] = useState<Position>({ 
    x: Math.max(8, window.innerWidth - windowSize.width - 26), 
    y: Math.max(8, window.innerHeight - windowSize.height - 100) 
  });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const windowDragStart = useRef<Position>({ x: 0, y: 0 });
  const windowStartPos = useRef<Position>({ x: 0, y: 0 });

  const quickActions = [
    'Categorize expenses',
    'Generate invoice',
    'Calculate profit/loss',
    'Budget forecast'
  ];

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      const newSize = getWindowSize();
      setWindowSize(newSize);
      setWindowPosition(prev => ({
        x: Math.max(0, Math.min(window.innerWidth - newSize.width, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - newSize.height, prev.y))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get client position from mouse or touch event
  const getClientPosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Handle window header dragging - Mouse
  const handleWindowMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingWindow(true);
    windowDragStart.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { ...windowPosition };
  };

  // Handle window header dragging - Touch
  const handleWindowTouchStart = (e: React.TouchEvent) => {
    setIsDraggingWindow(true);
    windowDragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    windowStartPos.current = { ...windowPosition };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingWindow) {
        const pos = getClientPosition(e);
        const deltaX = pos.x - windowDragStart.current.x;
        const deltaY = pos.y - windowDragStart.current.y;
        
        setWindowPosition({
          x: Math.max(0, Math.min(window.innerWidth - windowSize.width, windowStartPos.current.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - windowSize.height, windowStartPos.current.y + deltaY))
        });
      }
    };

    const handleEnd = () => {
      setIsDraggingWindow(false);
    };

    if (isDraggingWindow) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingWindow, windowSize]);

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

  const handleIconClick = () => {
    // Center the window on mobile
    const newX = window.innerWidth < 640 
      ? (window.innerWidth - windowSize.width) / 2 
      : Math.max(8, window.innerWidth - windowSize.width - 26);
    const newY = window.innerWidth < 640 
      ? 50 
      : Math.max(8, window.innerHeight - windowSize.height - 100);
    setWindowPosition({ x: newX, y: newY });
    setIsOpen(true);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bg-card rounded-2xl shadow-2xl flex flex-col z-40 border border-border animate-scale-in"
          style={{ 
            left: windowPosition.x, 
            top: windowPosition.y,
            width: windowSize.width,
            height: windowSize.height
          }}
        >
          {/* Header - Draggable */}
          <div 
            className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-2xl flex items-center justify-between cursor-move select-none touch-none"
            onMouseDown={handleWindowMouseDown}
            onTouchStart={handleWindowTouchStart}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Bhagya Patel</h3>
                <p className="text-xs text-blue-100">Financial Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Move className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 bg-[#1a1d29] p-4 sm:p-6 overflow-y-auto">
            {messages.length === 1 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-center text-xs sm:text-sm leading-relaxed px-2">
                  {messages[0].content}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2 sm:p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-xs sm:text-sm">{msg.content}</p>
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

          {/* Quick Actions - Only show at the start */}
          {messages.length === 1 && (
            <div className="bg-[#1a1d29] px-3 sm:px-4 pb-3 sm:pb-4 flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="text-[10px] sm:text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full px-2 sm:px-3 h-7 sm:h-8"
                >
                  {action}
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="bg-[#0f1117] p-3 sm:p-4 rounded-b-2xl flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Ask me about your finances..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1d29] border-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Chat Icon - Fixed position */}
      {!isOpen && (
        <button
          onClick={handleIconClick}
          className="fixed right-[104px] bottom-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl z-40 overflow-hidden p-0 border-0 cursor-pointer"
        >
          <img src={openaiLogo} alt="Chat" className="h-full w-full object-cover pointer-events-none" />
        </button>
      )}
    </>
  );
};
