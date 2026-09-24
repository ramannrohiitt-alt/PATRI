import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  groundingFactors?: any;
  suggestedActions?: string[];
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings Control Officer. I am PATRI AI, your explainable railway maintenance decision-support assistant. My reasoning is grounded in live database telemetry, OR-Tools CP-SAT solver results, and multi-department coordination logs. How can I assist your shift today?',
      suggestedActions: [
        'Why was T104 scheduled at 2 AM?',
        'What conflicts exist tomorrow?',
        'Which sections have the highest maintenance risk?',
        'How much block time did PATRI save?'
      ],
      timestamp: 'Just now'
    }
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.chatAI(query);
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: res.data.response,
        suggestedActions: res.data.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: 'Error contacting explanation service. Please ensure the backend is running.',
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col justify-between space-y-4">
      <PageHeader
        badge="Autonomous Reasoning"
        title="Grounded AI Explanation Engine"
        description="Explains mathematical solver rationale, train clearance windows, and multi-department coordination gains."
        breadcrumbs={['Operations', 'AI', 'Assistant']}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-pale/80 border border-accent-brown/30 text-accent-brown text-xs font-mono font-semibold shadow-warm-xs">
            <Cpu className="w-4 h-4 text-accent-brown" />
            <span>DATA GROUNDED &bull; OR-TOOLS</span>
          </div>
        }
      />

      {/* Messages Scroll Area */}
      <GlassCard className="flex-1 p-5 overflow-y-auto space-y-5 border-[#E7E0D2] min-h-0">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-warm-sm ${
                m.sender === 'user'
                  ? 'bg-accent-brown text-white rounded-tr-xs'
                  : 'bg-white/95 border border-[#E7E0D2] text-stone-800 rounded-tl-xs'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 font-mono text-[10px] ${
                  m.sender === 'user' ? 'text-accent-pale/90' : 'text-stone-500'
                }`}
              >
                {m.sender === 'ai' ? (
                  <Sparkles className="w-3.5 h-3.5 text-accent-brown" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-pale" />
                )}
                <span className="font-semibold">
                  {m.sender === 'user' ? 'Traffic Controller' : 'PATRI Intelligence'}
                </span>
                <span>&bull; {m.timestamp}</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">{m.text}</p>

              {/* Suggested Questions Chips */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="pt-3 border-t border-[#EFE9DC] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-accent-brown block uppercase tracking-wider">
                    Recommended Questions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {m.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action)}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-accent-pale border border-[#E7E0D2] hover:border-accent-brown/40 rounded-xl text-[11px] text-stone-700 hover:text-stone-900 transition-all shadow-warm-xs flex items-center gap-1 font-medium group"
                      >
                        <span>{action}</span>
                        <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-accent-brown group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 italic p-3 rounded-xl bg-white/70 border border-[#E7E0D2] w-fit">
            <Bot className="w-4 h-4 animate-bounce text-accent-brown" />
            <span>Consulting OR-Tools solver telemetry &amp; train movement logs...</span>
          </div>
        )}
      </GlassCard>

      {/* Bottom Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI why a task was scheduled, check conflicts, or test train additions..."
          className="flex-1 bg-white/95 border border-[#E7E0D2] rounded-xl px-4 py-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-accent-brown/30 font-sans shadow-warm-sm"
        />
        <GlowButton
          type="submit"
          variant="secondary"
          disabled={loading || !input.trim()}
          icon={<Send className="w-4 h-4" />}
        >
          Ask
        </GlowButton>
      </form>
    </div>
  );
};
