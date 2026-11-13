import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, TrendingUp, Package, DollarSign, BarChart3, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

const SUGGESTIONS = [
  { icon: DollarSign, text: 'What were my total sales this week?' },
  { icon: TrendingUp, text: 'Which products are selling fastest?' },
  { icon: Package, text: 'What products should I restock?' },
  { icon: BarChart3, text: 'Compare my sales this month vs last month' },
  { icon: TrendingUp, text: 'Which products are not selling well?' },
  { icon: DollarSign, text: 'How much profit did I make this month?' },
];

export const AssistantPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const mutation = useMutation({
    mutationFn: async (message: string) =>
      (await api.post('/assistant/chat', { message, conversationId })).data.data,
    onMutate: (message) => {
      // Optimistically add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'USER',
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      const assistantMsg: Message = {
        id: Date.now().toString() + '-ai',
        role: 'ASSISTANT',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: () => {
      const errorMsg: Message = {
        id: Date.now().toString() + '-err',
        role: 'ASSISTANT',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || mutation.isPending) return;
    mutation.mutate(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    mutation.mutate(text);
  };

  const isTyping = mutation.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-navy-700">
        <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            MarketMind AI Assistant
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full">
              <Zap size={10} /> Powered by Gemini
            </span>
          </h2>
          <p className="text-xs text-navy-400">Ask anything about your business — inventory, sales, profit, trends</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-brand-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Your AI Business Advisor</h3>
              <p className="text-sm text-navy-400 max-w-sm">
                I have access to your real business data — sales, inventory, profits, and trends.
                Ask me anything about your business.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.text)}
                  className="flex items-center gap-2.5 p-3 bg-navy-800 border border-navy-700 hover:border-brand-500/40 hover:bg-navy-700 rounded-xl text-left transition-all group"
                >
                  <s.icon size={15} className="text-brand-400 shrink-0" />
                  <span className="text-xs text-navy-300 group-hover:text-white">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3 animate-slide-up', msg.role === 'USER' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'ASSISTANT' && (
                  <div className="w-7 h-7 bg-brand-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'USER'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-navy-800 border border-navy-700 text-navy-100 rounded-tl-sm'
                )}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p className={cn('text-[10px] mt-1.5', msg.role === 'USER' ? 'text-brand-200' : 'text-navy-500')}>
                    {formatRelative(msg.createdAt)}
                  </p>
                </div>
                {msg.role === 'USER' && (
                  <div className="w-7 h-7 bg-navy-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-navy-300" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start animate-slide-up">
                <div className="w-7 h-7 bg-brand-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-brand-400" />
                </div>
                <div className="bg-navy-800 border border-navy-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 pt-3 border-t border-navy-700">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 focus-within:border-brand-500/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales, inventory, profits..."
              className="w-full bg-transparent text-sm text-navy-100 placeholder-navy-500 resize-none focus:outline-none max-h-32"
              rows={1}
              style={{ height: 'auto' }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            loading={isTyping}
            icon={<Send size={16} />}
            size="md"
          >
            Send
          </Button>
        </div>
        <p className="text-[10px] text-navy-500 mt-2 text-center">
          Responses are based on your actual business data. AI estimates are clearly indicated.
        </p>
      </div>
    </div>
  );
};
