'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, X, BookOpen, Bell, Utensils } from 'lucide-react';
import menuData from '../../../public/mess_menu.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
type DayType = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
interface DayMenu { Breakfast: string[]; Lunch: string[]; Snacks: string[]; Dinner: string[]; }
interface MenuDataType { [key: string]: DayMenu; }

const dayNames: DayType[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getTodayMeal(): { day: DayType; meal: MealType; items: string[] } {
  const now = new Date();
  const day = dayNames[now.getDay()];
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  let meal: MealType = 'Breakfast';
  if (totalMinutes > 22 * 60 + 30) meal = 'Breakfast';
  else if (totalMinutes <= 9 * 60 + 30) meal = 'Breakfast';
  else if (totalMinutes <= 14 * 60 + 30) meal = 'Lunch';
  else if (totalMinutes <= 18 * 60) meal = 'Snacks';
  else meal = 'Dinner';
  const data = menuData as MenuDataType;
  const items = data[day]?.[meal] ?? [];
  return { day, meal, items };
}

function getStudentContext(): string {
  try {
    // React-query persists data in localStorage under 'REACT_QUERY_OFFLINE_CACHE'
    const raw = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    if (!raw) return '';
    const cache = JSON.parse(raw);
    const queries = cache?.clientState?.queries ?? [];

    let context = '';

    for (const q of queries) {
      const key = JSON.stringify(q.queryKey ?? q.queryHash ?? '');
      const data = q.state?.data;
      if (!data) continue;

      if (key.includes('marks') || key.includes('Marks')) {
        context += `\n\nSTUDENT MARKS DATA:\n${JSON.stringify(data, null, 2)}`;
      }
      if (key.includes('attendance') || key.includes('Attendance')) {
        context += `\n\nSTUDENT ATTENDANCE DATA:\n${JSON.stringify(data, null, 2)}`;
      }
      if (key.includes('user') || key.includes('User')) {
        const name = (data as { name?: string })?.name;
        if (name) context += `\n\nSTUDENT NAME: ${name}`;
      }
    }
    return context;
  } catch {
    return '';
  }
}

function buildSystemPrompt(): string {
  const studentCtx = getStudentContext();
  const { day, meal, items } = getTodayMeal();
  const messInfo = items.length
    ? `\n\nTODAY'S MESS MENU (${day} - ${meal}): ${items.join(', ')}`
    : '';

  return `You are Classivo AI, a dedicated academic and campus assistant for university students.
You can help with:
- Explaining concepts and topics from the student's courses
- Analysing the student's marks and attendance data (provided below) and giving personalised insights
- Providing study tips, exam prep strategies, and time management advice
- Clarifying academic terms, grades, attendance rules, and schedules
- Answering questions about today's mess/canteen menu (provided below)
- Daily reminders and notification-style updates about the student's campus life

If asked about something completely unrelated to academics or campus life (e.g., entertainment gossip, personal relationships etc.), politely decline and redirect to study/campus topics.

Be concise, warm, and student-friendly. Use the student's name when available. When analysing marks or attendance, be specific and actionable — highlight risks and opportunities.
${studentCtx}${messInfo}`;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessBanner, setShowMessBanner] = useState(true);
  const { day, meal, items } = getTodayMeal();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `📚 Hi! I'm Classivo AI — your personal campus assistant powered by NVIDIA Mistral.\n\nI can:\n• Analyse your marks & attendance\n• Help you study and prepare for exams\n• Tell you what's on the mess menu today\n• Send you academic reminders\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isOpen, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const apiReqMessages = [
        { role: 'system', content: [{ type: 'text', text: systemPrompt }] },
        ...[...messages, userMsg].map((msg) => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }]
        }))
      ];

      // Always use the local backend for the AI proxy — it holds the NVIDIA key securely
      // In production this should point to your deployed backend URL with NVIDIA_API_KEY set
      const aiBase = process.env.NEXT_PUBLIC_AI_BASE || process.env.NEXT_PUBLIC_API_BASE || '';

      const response = await fetch(`${aiBase}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-4-119b-2603',
          messages: apiReqMessages,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      if (data.choices?.length > 0) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Make sure the backend is running on port 8080. Try again shortly.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Classivo AI"
        className="fixed bottom-24 right-4 z-[200] md:bottom-6 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center skeuo-convex border border-emerald-500/30 bg-[#0f1f1a] shadow-[0_0_24px_rgba(52,211,153,0.25)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] active:scale-95 active:skeuo-pressed group"
      >
        {isOpen
          ? <X className="w-6 h-6 text-emerald-400 transition-transform duration-300" />
          : <Bot className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] group-hover:scale-110 transition-transform duration-300" />
        }
        {!isOpen && <span className="absolute inset-0 rounded-full border border-emerald-400/25 animate-ping" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[380px] sm:w-[420px] flex flex-col h-[560px] rounded-2xl skeuo-flat border border-white/5 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] border-b border-white/5 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#0f1f1a] skeuo-pressed flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white/90 leading-none">Classivo AI</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <BookOpen className="w-3 h-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-500 font-medium tracking-wide uppercase">Study & Campus Assistant · NVIDIA</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mess Notification Banner */}
          {showMessBanner && items.length > 0 && (
            <div className="px-4 py-2.5 bg-amber-950/50 border-b border-amber-800/30 flex items-start gap-2 flex-shrink-0">
              <Utensils className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-0.5">
                  🍽 Today&apos;s {meal} · {day}
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed truncate">
                  {items.slice(0, 4).join(' · ')}{items.length > 4 ? ' · ...' : ''}
                </p>
              </div>
              <button onClick={() => setShowMessBanner(false)} className="text-amber-500/50 hover:text-amber-400 transition-colors flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Capability chips */}
          <div className="px-3 py-2 bg-black/20 border-b border-white/5 flex gap-1.5 overflow-x-auto flex-shrink-0">
            {[
              { icon: Bell, label: 'My Marks', prompt: 'Analyse my marks and tell me how I am doing.' },
              { icon: BookOpen, label: 'Attendance', prompt: 'Check my attendance and tell me which subjects are risky.' },
              { icon: Utensils, label: 'Mess Menu', prompt: `What is today's mess menu for ${meal}?` },
            ].map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => { setInput(prompt); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/60 hover:text-white/90 transition-all flex-shrink-0"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/30 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center skeuo-pressed bg-[#111]">
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white/60" />
                    : <Bot className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#1a1a1a] text-white/90 skeuo-convex rounded-tr-sm'
                    : 'bg-[#0d0d0d] text-white/80 skeuo-flat rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#111] skeuo-pressed flex-shrink-0 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-[13px] bg-[#0d0d0d] text-white/50 skeuo-flat rounded-tl-sm flex items-center gap-1.5">
                  Thinking<span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#0a0a0a] border-t border-white/5 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 rounded-xl bg-[#111] skeuo-pressed outline outline-1 outline-white/5 focus-within:outline-white/15 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about marks, attendance, mess..."
                  className="w-full bg-transparent text-white/90 text-[13px] px-3 py-2.5 focus:outline-none placeholder:text-white/25"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  !input.trim() || isLoading
                    ? 'bg-[#111] text-white/20 skeuo-flat cursor-not-allowed'
                    : 'bg-[#0f1f1a] text-emerald-400 skeuo-convex border border-emerald-900/50 hover:border-emerald-700/50 active:scale-95 active:skeuo-pressed'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
