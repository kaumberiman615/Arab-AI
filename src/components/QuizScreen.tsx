import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import { 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Sparkles,
  Trophy,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakArabic } from '../lib/audio';

interface QuizScreenProps {
  quizzes: Quiz[];
  onQuizFinished: (quizId: string, score: number, total: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ quizzes, onQuizFinished }) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);

  const startQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = activeQuiz?.questions[currentIndex];
    if (currentQ && index === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    if (currentIndex + 1 < activeQuiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      const total = activeQuiz.questions.length;
      const finalScore = Math.round((score / total) * 100);
      onQuizFinished(activeQuiz.id, finalScore, total);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner Kuis */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-800/40 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Evaluasi & Uji Pemahaman Santri</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Latihan & Kuis Interaktif Bahasa Arab
            </h2>
            <p className="font-arabic text-amber-400 text-lg sm:text-xl mt-1 font-semibold">
              اِخْتَبِرْ مَعْلُومَاتِكَ فِي اللُّغَةِ العَرَبِيَّةِ
            </p>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Uji hafalan kosakata, pemahaman kaidah nahwu, dan terjemahan kalimat. Setiap kuis berhasil diselesaikan akan menambah XP santri!
            </p>
          </div>
        </div>
      </div>

      {/* Quizzes List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-600/50 rounded-2xl p-5 flex flex-col justify-between transition shadow-sm hover:shadow-amber-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Tingkat {quiz.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {quiz.questions.length} Soal
                </span>
              </div>

              <h3 className="font-arabic text-xl sm:text-2xl font-bold text-amber-300 mb-1">
                {quiz.titleArabic}
              </h3>
              <h4 className="text-sm font-bold text-white mb-2">
                {quiz.title}
              </h4>
              <p className="text-xs text-slate-400">
                Latihan soal pilihan ganda dengan pembahasan langsung setelah menjawab.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold">
                Hadiah: +100 XP
              </span>
              <button
                type="button"
                onClick={() => startQuiz(quiz)}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Mulai Kuis
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE QUIZ MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-200">
            
            {!showResult ? (
              <>
                {/* Header & Progress */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-400">
                      Soal {currentIndex + 1} dari {activeQuiz.questions.length}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {activeQuiz.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                  />
                </div>

                {/* Question Area */}
                {currentQuestion && (
                  <div className="space-y-4">
                    {/* Arabic Text Prompt if present */}
                    {currentQuestion.arabicPrompt && (
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center flex items-center justify-center gap-3">
                        <span className="font-arabic text-2xl sm:text-3xl font-bold text-amber-300">
                          {currentQuestion.arabicPrompt}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakArabic(currentQuestion.arabicPrompt || '')}
                          className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition cursor-pointer"
                          title="Dengarkan Suara"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {currentQuestion.question}
                    </h4>

                    {/* Options list */}
                    <div className="space-y-2.5">
                      {currentQuestion.options.map((opt, idx) => {
                        let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';

                        if (isAnswered) {
                          if (idx === currentQuestion.correctIndex) {
                            btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold';
                          } else if (idx === selectedOption) {
                            btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-300';
                          } else {
                            btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectOption(idx)}
                            disabled={isAnswered}
                            className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && idx === currentQuestion.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if answered */}
                    {isAnswered && (
                      <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-1">
                        <p className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pembahasan Kaidah:</span>
                        </p>
                        <p className="text-slate-300">{currentQuestion.explanation}</p>
                      </div>
                    )}

                    {/* Next Button */}
                    {isAnswered && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/30 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>{currentIndex + 1 < activeQuiz.questions.length ? 'Soal Berikutnya' : 'Lihat Hasil Kuis'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* RESULTS SUMMARY */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="font-arabic text-emerald-400 text-2xl font-bold">
                  مُمْتَازٌ! بَارَكَ اللهُ فِيكَ
                </div>
                <h3 className="text-xl font-bold text-white">Kuis Selesai!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Anda telah menyelesaikan kuis <strong>{activeQuiz.title}</strong>
                </p>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-xs mx-auto">
                  <p className="text-xs text-slate-400">Skor Akhir:</p>
                  <p className="text-3xl font-extrabold text-amber-400 mt-1">
                    {Math.round((score / activeQuiz.questions.length) * 100)} / 100
                  </p>
                  <p className="text-xs text-emerald-400 font-bold mt-1">
                    Benar {score} dari {activeQuiz.questions.length} Soal (+100 XP)
                  </p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startQuiz(activeQuiz)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Kuis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/30 cursor-pointer"
                  >
                    Kembali ke Daftar Kuis
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
