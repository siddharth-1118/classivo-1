'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, X, BookOpen, Bell, Utensils } from 'lucide-react';
import menuData from '../../../public/mess_menu.json';
import { getApiBase } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
type DayType = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
interface DayMenu { Breakfast: string[]; Lunch: string[]; Snacks: string[]; Dinner: string[]; }
interface MenuDataType { [key: string]: DayMenu; }
interface CachedMark {
  subject?: string;
  course?: string;
  total?: { obtained?: number; maxMark?: number };
}

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

function getCachedMarks(): CachedMark[] {
  try {
    const raw = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    if (!raw) return [];

    const cache = JSON.parse(raw);
    const queries = cache?.clientState?.queries ?? [];
    for (const q of queries) {
      const key = JSON.stringify(q.queryKey ?? q.queryHash ?? '');
      const data = q.state?.data;
      if (data && (key.includes('marks') || key.includes('Marks')) && Array.isArray(data)) {
        return data as CachedMark[];
      }
    }
    return [];
  } catch {
    return [];
  }
}

function buildLocalFallbackResponse(prompt: string): string | null {
  const promptText = prompt.toLowerCase();
  const marks = getCachedMarks();

  if ((promptText.includes('mark') || promptText.includes('score') || promptText.includes('performance')) && marks.length > 0) {
    const scored = marks
      .map((mark) => {
        const obtained = Number(mark.total?.obtained ?? 0);
        const max = Number(mark.total?.maxMark ?? 0);
        const percentage = max > 0 ? (obtained / max) * 100 : 0;
        return {
          subject: mark.subject || mark.course || 'Subject',
          percentage,
        };
      })
      .filter((mark) => mark.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);

    if (scored.length === 0) return null;

    const average = scored.reduce((sum, item) => sum + item.percentage, 0) / scored.length;
    const strongest = scored[0];
    const weakest = scored[scored.length - 1];

    return `Here is a quick marks analysis from your local data.\n\nOverall average: ${average.toFixed(1)}%\nStrongest subject: ${strongest.subject} at ${strongest.percentage.toFixed(1)}%\nNeeds attention: ${weakest.subject} at ${weakest.percentage.toFixed(1)}%\n\nYou are doing ${average >= 75 ? 'well overall' : average >= 60 ? 'decently, but there is room to improve' : 'below a comfortable level right now'}. Focus first on lifting your weakest subject while maintaining your strongest one.`;
  }

  return null;
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

If someone asks who made this website, who built this website, or who created Classivo, clearly answer: "This website was made by vss."

Be concise, warm, and student-friendly. Use the student's name when available. When analysing marks or attendance, be specific and actionable - highlight risks and opportunities.
${studentCtx}${messInfo}`;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessBanner, setShowMessBanner] = useState(true);
  const { day, meal, items } = getTodayMeal();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Classivo AI, your personal campus assistant.\n\nI can:\n- Analyse your marks and attendance\n- Help you study and prepare for exams\n- Tell you today's mess menu\n- Guide your daily academic priorities\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

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

      const aiBase = process.env.NEXT_PUBLIC_AI_BASE || getApiBase();
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
      const fallback = buildLocalFallbackResponse(userMsg.content);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallback || (error instanceof Error
            ? `Sorry, I hit an error while responding: ${error.message}`
            : 'Sorry, I hit an error while responding. Please try again in a moment.')
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Classivo AI"
        className="fixed bottom-24 right-4 z-[220] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-zinc-200 shadow-[0_8px_20px_rgba(0,0,0,0.28)] md:bottom-6 md:right-6 md:h-16 md:w-16"
      >
        {isOpen
          ? <X className="h-6 w-6 text-emerald-300" />
          : <Bot className="h-6 w-6 text-emerald-300" />
        }
      </button>

      {isOpen && (
        <>
          <button
            aria-label="Close AI chat"
            className="fixed inset-0 z-[205] bg-[linear-gradient(180deg,rgba(3,6,10,0.42),rgba(3,6,10,0.62))]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-28 right-3 z-[210] flex h-[580px] w-[calc(100vw-1.5rem)] max-w-[430px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950 shadow-[0_16px_38px_rgba(0,0,0,0.4)] md:bottom-6 md:right-6 md:w-[430px]">

            <div className="relative z-10 flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-zinc-950 px-4 py-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900">
                <Bot className="h-5 w-5 text-zinc-200" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="leading-none font-semibold text-white">Classivo AI</h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-zinc-400" />
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-400">Study and Campus Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-white/40 hover:text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            {showMessBanner && items.length > 0 && (
              <div className="relative z-10 mx-4 mt-4 flex flex-shrink-0 items-start gap-3 rounded-2xl border border-amber-400/15 bg-[linear-gradient(180deg,rgba(120,53,15,0.28),rgba(69,26,3,0.24))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Utensils className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                    Today&apos;s {meal} | {day}
                  </p>
                  <p className="truncate text-[11px] leading-relaxed text-amber-100/80">
                    {items.slice(0, 4).join(' | ')}{items.length > 4 ? ' | ...' : ''}
                  </p>
                </div>
                <button onClick={() => setShowMessBanner(false)} className="flex-shrink-0 text-amber-200/45 transition-colors hover:text-amber-200">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="relative z-10 mx-4 mt-3 flex flex-shrink-0 gap-2 overflow-x-auto pb-1">
              {[
                { icon: Bell, label: 'My Marks', prompt: 'Analyse my marks and tell me how I am doing.' },
                { icon: BookOpen, label: 'Attendance', prompt: 'Check my attendance and tell me which subjects are risky.' },
                { icon: Utensils, label: 'Mess Menu', prompt: `What is today's mess menu for ${meal}?` },
              ].map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => setInput(prompt)}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70 hover:bg-white/10"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            <div className="relative z-10 mt-3 flex min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <div className="w-full space-y-4 rounded-[20px] border border-white/8 bg-zinc-900 p-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/8 bg-[#101317]">
                      {msg.role === 'user'
                        ? <User className="h-3.5 w-3.5 text-white/70" />
                        : <Bot className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <div className={`max-w-[84%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm border border-white/10 bg-zinc-800 text-white/92'
                        : 'rounded-tl-sm border border-white/10 bg-black/30 text-white/84'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/8 bg-[#101317]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-black/30 px-4 py-3 text-[13px] text-white/55">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="relative z-10 flex-shrink-0 border-t border-white/8 bg-black/25 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 rounded-2xl border border-white/10 bg-black px-1 outline outline-1 outline-transparent focus-within:border-white/20">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about marks, attendance, mess..."
                    className="w-full bg-transparent px-3 py-3 text-[13px] text-white/90 placeholder:text-white/30 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                    !input.trim() || isLoading
                      ? 'cursor-not-allowed border border-white/8 bg-[#111315] text-white/20'
                      : 'border border-white/10 bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};
