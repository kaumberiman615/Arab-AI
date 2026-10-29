import React, { useState } from 'react';
import { Sparkles, Volume2, ArrowRight, BookOpen, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { GrammarAnalysisResponse } from '../types';
import { speakArabic } from '../lib/audio';

const SAMPLE_SENTENCES = [
  { text: 'ذَهَبَ الطَّالِبُ إِلَى المَدْرَسَةِ', label: 'Pergi ke Madrasah (Fi\'liyah)' },
  { text: 'القُرْآنُ كَلَامُ اللهِ المُنَزَّلُ', label: 'Al-Qur\'an Kalamullah (Ismiyah)' },
  { text: 'يَكْتُبُ مُحَمَّدٌ الدَّرْسَ فِي الدَّفْتَرِ', label: 'Menulis Pelajaran (Maf\'ul Bih)' },
  { text: 'العِلْمُ نُورٌ وَالجَهْلُ ظَلَامٌ', label: 'Ilmu Adalah Cahaya (Mubtada & Khobar)' }
];

export const GrammarAnalyzerScreen: React.FC = () => {
  const [inputSentence, setInputSentence] = useState('ذَهَبَ الطَّالِبُ إِلَى المَدْرَسَةِ');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GrammarAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (sentenceToAnalyze = inputSentence) => {
    if (!sentenceToAnalyze.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: sentenceToAnalyze })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
      } else {
        setError(data.message || 'Gagal menganalisis kalimat.');
      }
    } catch {
      setError('Koneksi terputus. Pastikan server aktif.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    if (type?.toLowerCase().includes('isim')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (type?.toLowerCase().includes('fi\'il') || type?.toLowerCase().includes('fiil')) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-purple-100 text-purple-800 border-purple-300';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/30 rounded-full text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Teknologi AI Nahwu & Shorof
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            Penganalisis Tata Bahasa Arab (I'rob)
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Ketik atau tempel kalimat bahasa Arab berharakat atau gundul. Kecerdasan Buatan (Gemini 3.8 Flash) akan menguraikan kata demi kata (Isim, Fi'il, Harf), harakat, makna, serta kaidah nahwu yang berlaku.
          </p>
        </div>

        {/* Decorative Arabesque */}
        <div className="absolute right-4 -bottom-6 select-none pointer-events-none opacity-15 font-arabic text-9xl text-amber-300">
          إِعْرَاب
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Masukkan Kalimat Bahasa Arab (جُمْلَة عَرَبِيَّة):
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
              placeholder="مثال: يَقْرَأُ الأُسْتَاذُ الكِتَابَ فِي المَسْجِدِ..."
              dir="rtl"
              className="w-full text-xl sm:text-2xl font-arabic font-medium py-3.5 px-4 pr-12 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/20 text-slate-900 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
            />
            {inputSentence && (
              <button
                type="button"
                onClick={() => speakArabic(inputSentence)}
                title="Dengarkan pelafalan"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70 rounded-lg transition"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Sample Sentences Chips */}
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-2">Contoh Kalimat Cepat:</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SENTENCES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputSentence(sample.text);
                  handleAnalyze(sample.text);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent transition"
              >
                <span className="font-arabic font-semibold">{sample.text}</span>
                <span className="text-[10px] text-slate-400">({sample.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={loading || !inputSentence.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-medium shadow-sm transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menganalisis Kaidah...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Bedah Kalimat & I'rob
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          {/* Main Sentence Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Teks Terstruktur Berharakat
                </span>
                <div className="text-2xl sm:text-3xl font-arabic font-bold text-slate-900 mt-1" dir="rtl">
                  {analysis.vowelizedText}
                </div>
              </div>
              <button
                type="button"
                onClick={() => speakArabic(analysis.vowelizedText)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-medium text-sm transition self-start sm:self-center"
              >
                <Volume2 className="w-4 h-4" />
                Dengarkan Suara
              </button>
            </div>

            <div className="pt-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Terjemahan Bahasa Indonesia:
              </span>
              <p className="text-slate-800 font-medium text-base mt-0.5">
                "{analysis.indonesianTranslation}"
              </p>
            </div>
          </div>

          {/* Word-by-Word Analysis Table */}
          {analysis.words && analysis.words.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Penguraian Kata per Kata (تَحْلِيلُ المُفْرَدَات)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.words.map((w, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/20 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeBadgeColor(w.wordType)}`}>
                        {w.wordType}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakArabic(w.word)}
                        className="text-slate-400 hover:text-emerald-700 p-1"
                        title="Dengarkan kata"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-2xl font-arabic font-bold text-emerald-950 text-right" dir="rtl">
                      {w.word}
                    </div>

                    <div className="text-sm font-semibold text-slate-800">
                      Artinya: <span className="font-normal text-slate-600">{w.meaning}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-700">Analisis:</strong> {w.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Rules Card */}
          {analysis.rulesExplanation && (
            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200/70">
              <div className="flex items-center gap-2 mb-2 text-emerald-900">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h4 className="text-base font-bold">Kaidah & Faedah Nahwiyah</h4>
              </div>
              <div className="text-sm text-emerald-950 leading-relaxed whitespace-pre-line">
                {analysis.rulesExplanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide Card */}
      {!analysis && !loading && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-semibold text-slate-700">Siap Menganalisis Kalimat Bahasa Arab</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Gunakan salah satu tombol contoh di atas atau masukkan kalimat sendiri untuk melihat pembagian Isim (kata benda/sifat), Fi'il (kata kerja), dan Harf (kata penghubung).
          </p>
        </div>
      )}
    </div>
  );
};
