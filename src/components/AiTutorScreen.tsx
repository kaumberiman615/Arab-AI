import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Volume2, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { speakArabic } from '../lib/audio';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Jelaskan perbedaan Isim, Fi\'il, dan Harf dengan contohnya',
  'Buatkan percakapan ta\'aruf (perkenalan) 2 orang santri di pondok',
  'Apa rumus dan tanda-tanda I\'rob Rofa\' pada Isim Mufrod?',
  'Kosakata penting perlengkapan belajar di kelas beserta harakatnya'
];

export const AiTutorScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ! 🌸
أَهْلًا وَسَهْلًا بِكُمْ فِي مَرْكَزِ اللُّغَةِ العَرَبِيَّةِ.

Saya adalah **Ustadz AI**, asisten pembelajaran bahasa Arab Anda. Anda dapat bertanya tentang:
1. Kaidah **Nahwu & Shorof** (Tata Bahasa & Perubahan Kata).
2. Perbendaharaan **Mufrodat** (Kosakata) lengkap dengan harakat dan contohnya.
3. Latihan **Muhadatsah** (Percakapan sehari-hari).
4. Koreksi kalimat bahasa Arab yang ingin Anda tulis.

Silakan pilih topik cepat di bawah atau tuliskan pertanyaan Anda!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText = input) => {
    if (!userText.trim() || loading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/arabic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'model',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            text: 'Afwan (maaf), terjadi kendala teknis saat memproses jawaban. Silakan ulangi sejenak lagi.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Koneksi ke server AI terputus. Pastikan koneksi internet Anda stabil.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract Arabic chunks for speech audio
  const handleSpeakText = (fullText: string) => {
    // Look for Arabic phrases
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
    const arabicMatches = fullText.match(arabicRegex);
    if (arabicMatches && arabicMatches.length > 0) {
      speakArabic(arabicMatches.join(' '));
    } else {
      speakArabic(fullText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-md">
            <Bot className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
              Ustadz AI
              <span className="text-xs bg-emerald-700/60 text-emerald-200 px-2 py-0.5 rounded-full font-normal">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-emerald-200">Tutor Cerdas Nahwu, Shorof & Muhadatsah</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="font-arabic text-xl text-amber-300">أُسْتَاذُ الذَّكَاءِ الاصْطِنَاعِيِّ</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 text-emerald-900 border border-amber-300'
              }`}
            >
              {msg.role === 'user' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Bot className="w-5 h-5 text-emerald-800" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm space-y-2 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-emerald-100 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[11px] opacity-75 pb-1 border-b border-black/5">
                <span className="font-semibold">
                  {msg.role === 'user' ? 'Anda (Santri)' : 'Ustadz AI'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text with Arabic friendly line-height */}
              <div className="text-sm leading-relaxed whitespace-pre-line font-normal break-words">
                {msg.text}
              </div>

              {/* Action buttons on bot response */}
              {msg.role === 'model' && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeakText(msg.text)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
                    title="Dengarkan pelafalan bahasa Arab dalam teks"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    Lafalkan Arab
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-emerald-900 border border-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-emerald-800" />
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Ustadz AI sedang menyusun penjelasan dan harakat...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0 px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Ide Tanya:
        </div>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="shrink-0 px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full text-xs font-medium text-slate-700 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-emerald-100 flex items-center gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan kaidah bahasa Arab, arti mufrodat, atau minta koreksi..."
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm transition flex items-center justify-center shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
