
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { getProductRecommendations } from '../services/geminiService';

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your PiShop AI Assistant. I know everything about our inventory. Looking for a gift or something for yourself? Just ask!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await getProductRecommendations(userMsg.text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="bg-slate-900 p-4 flex items-center gap-3">
        <div className="p-2 bg-indigo-500 rounded-lg">
           <Bot className="text-white" size={24} />
        </div>
        <div>
           <h3 className="text-white font-bold flex items-center gap-2">Gemini AI Assistant <Sparkles size={14} className="text-amber-400" /></h3>
           <p className="text-slate-400 text-xs">Powered by Google GenAI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg)]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-[var(--color-border)] text-[var(--color-text)]' : 'bg-[var(--color-primary)] text-white'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-[var(--color-sidebar)] text-[var(--color-text)] border border-[var(--color-border)] rounded-tr-none' 
                : 'bg-[var(--color-card)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)] rounded-tl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                <Bot size={16} />
             </div>
             <div className="bg-[var(--color-card)] p-3 rounded-2xl rounded-tl-none shadow-sm border border-[var(--color-border)] flex items-center gap-2">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={16} />
                <span className="text-xs text-[var(--color-text)] opacity-50">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[var(--color-card)] border-t border-[var(--color-border)] flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products (e.g., 'Best headphones for travel?')"
          className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-[var(--color-primary)] text-white p-3 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default AiChat;
