import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Send, Bot, User, Sparkles, TrendingUp, Package,
  DollarSign, BarChart3, Zap, Plus, ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

const SUGGESTIONS = [
  { icon: DollarSign, text: 'What were my total sales this week?', color: 'text-brand-400' },
  { icon: TrendingUp, text: 'Which products are selling fastest?', color: 'text-blue-400' },
  { icon: Package, text: 'What products should I restock?', color: 'text-amber-400' },
  { icon: BarChart3, text: 'Compare my sales this month vs last month', color: 'text-purple-400' },
  { icon: TrendingUp, text: 'Which products are not selling well?', color: 'text-red-400' },
  { icon: DollarSign, text: 'How much profit did I make this month?', color: 'text-emerald-400' },
];

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0">
        <Bot size={16} className="text-brand-400" />
      </div>
      <div className="bg-navy-800 border border-navy-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'USER';
  return (
    <div className={cn('flex gap-3 animate-slide-up', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0 mt-1">
          <Bot size={16} className="text-brand-400" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-brand-500 text-white rounded-tr-sm'
          : 'bg-navy-800 border border-navy-700/80 text-navy-100 rounded-tl-sm'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
        <p className={cn('text-[10px] mt-1.5', isUser ? 'text-brand-200 text-right' : 'text-navy-500')}>
          {formatRelative(msg.createdAt)}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center shrink-0 mt-1">
          <User size={14} className="text-navy-300" />
        </div>
      )}
    </div>
  );
}

export const AssistantPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const business = currentBusiness();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const mutation = useMutation({
    mutationFn: async (message: string) =>
      (await api.post('/assistant/chat', { message, conversationId })).data.data,
    onMutate: (message) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'USER',
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'ASSISTANT',
        content: data.reply,
        createdAt: new Date().toISOString(),
      }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'ASSISTANT',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        createdAt: new Date().toISOString(),
      }]);
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

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    inputRef.current?.focus();
  };

  const isTyping = mutation.isPending;
  const isEmpty = messages.length === 0;

  return (
    /*
     * The assistant takes over the full app content area.
     * We use fixed positioning anchored to the sidebar and TopBar edges rather
     * than the entire viewport, so the sidebar and TopBar remain visible and
     * functional. On mobile there is no sidebar (it's a drawer), so we fill
     * the full width. The BottomNav lives at z-40; we raise the assistant
     * input container to z-41 so it always sits above the BottomNav on mobile.
     *
     * iOS keyboard handling: using `dvh` on the outer container so the browser
     * correctly shrinks the available height when the keyboard is open. The
     * flex column layout means the input area naturally stays at the bottom of
     * the visible area rather than being pushed off screen.
     */
    <div
      className="flex flex-col"
      style={{ height: 'calc(100dvh - 57px)' }}
    >
      {/* Chat header */}
      <div className="bg-navy-900 border-b border-navy-700 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-400 rounded-full border-2 border-navy-900" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-white">MarketMind AI Assistant</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/20 shrink-0">
              <Zap size={9} fill="currentColor" /> AI
            </span>
          </div>
          <p className="text-[11px] text-navy-400 truncate">
            {business?.name ?? 'Your business'} · Ask anything about your data
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy-300 hover:text-white bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors touch-manipulation shrink-0"
          >
            <Plus size={13} /> New
          </button>
        )}
      </div>

      {/* Messages area — flex-1 so it fills between header and input */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 overscroll-contain"
      >
        {isEmpty ? (
          /* Welcome / suggestion screen */
          <div className="flex flex-col items-center justify-center min-h-full pb-6 gap-6 text-center">
            <div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 border border-brand-500/20">
                <Sparkles size={28} className="text-brand-400 sm:hidden" />
                <Sparkles size={36} className="text-brand-400 hidden sm:block" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Your AI Business Advisor</h3>
              <p className="text-sm text-navy-400 max-w-sm mx-auto leading-relaxed">
                I have live access to your sales, inventory, and profit data.
                Ask me anything about <span className="text-white font-medium">{business?.name ?? 'your business'}</span>.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => mutation.mutate(s.text)}
                  disabled={isTyping}
                  className="flex items-center gap-3 p-3 sm:p-3.5 bg-navy-800 border border-navy-700 hover:border-brand-500/40 hover:bg-navy-700 rounded-xl text-left transition-all group disabled:opacity-50 touch-manipulation"
                >
                  <div className="w-8 h-8 bg-navy-700 group-hover:bg-navy-600 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <s.icon size={15} className={s.color} />
                  </div>
                  <span className="text-xs text-navy-300 group-hover:text-white leading-tight">{s.text}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-navy-600 max-w-xs">
              Responses use your real business data. AI estimates are clearly indicated.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button — positioned relative to the flex container */}
      {showScrollBtn && (
        <div className="absolute right-4 sm:right-6" style={{ bottom: 'calc(var(--input-area-h, 80px) + 8px)' }}>
          <button
            onClick={() => scrollToBottom()}
            className="w-9 h-9 bg-navy-700 hover:bg-navy-600 border border-navy-600 text-navy-300 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all touch-manipulation"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Input area — always anchored at the bottom of the flex column.
          The safe-area-pb utility (defined in index.css) adds
          env(safe-area-inset-bottom) so the input stays above the iOS home
          indicator. On mobile we also add extra pb to clear the BottomNav. */}
      <div className="bg-navy-900 border-t border-navy-700 px-4 sm:px-6 py-3 shrink-0 safe-area-pb lg:pb-3">
        {/* Quick-suggestion strip — only when conversation just started */}
        {messages.length > 0 && messages.length < 4 && (
          <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => mutation.mutate(s.text)}
                disabled={isTyping}
                className="whitespace-nowrap text-[11px] px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-navy-300 hover:text-white rounded-full transition-colors disabled:opacity-50 shrink-0 touch-manipulation"
              >
                {s.text}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0 bg-navy-800 border border-navy-700 focus-within:border-brand-500/50 rounded-2xl px-4 py-3 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-grow up to 120px
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales, inventory, profits..."
              className="w-full bg-transparent text-sm text-navy-100 placeholder-navy-500 resize-none focus:outline-none leading-relaxed"
              rows={1}
              disabled={isTyping}
              // Prevent iOS from zooming in on the textarea (font-size 16px minimum)
              style={{ fontSize: '16px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 touch-manipulation',
              input.trim() && !isTyping
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand'
                : 'bg-navy-700 text-navy-500 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-navy-500 border-t-brand-400 rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-navy-600 text-center mt-2">
          Responses are based on your actual business data
        </p>
      </div>
    </div>
  );
};
