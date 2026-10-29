import React, { useState } from 'react';
import type { Lesson, VocabularyItem, DialogueItem } from '../types';
import { 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Clock, 
  GraduationCap, 
  Bookmark, 
  BookmarkCheck,
  ChevronRight,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speakArabic } from '../lib/audio';

interface LessonsScreenProps {
  lessons: Lesson[];
  completedLessonIds: string[];
  savedVocabIds: string[];
  onCompleteLesson: (lessonId: string) => void;
  onToggleBookmarkVocab: (vocabId: string) => void;
}

export const LessonsScreen: React.FC<LessonsScreenProps> = ({
  lessons,
  completedLessonIds,
  savedVocabIds,
  onCompleteLesson,
  onToggleBookmarkVocab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [modalTab, setModalTab] = useState<'materi' | 'mufrodat' | 'dialogue'>('materi');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Materi', labelArabic: 'الكَافَّة' },
    { id: 'hijaiyah', label: 'Huruf Hijaiyah', labelArabic: 'الحُرُوفُ' },
    { id: 'mufrodat', label: 'Mufrodat (Kosakata)', labelArabic: 'المُفْرَدَاتُ' },
    { id: 'qawaid', label: "Qawa'id (Tata Bahasa)", labelArabic: 'القَوَاعِدُ' },
    { id: 'muhadatsah', label: 'Muhadatsah (Percakapan)', labelArabic: 'المُحَادَثَةُ' },
  ];

  const filteredLessons = lessons.filter((les) => {
    const matchCat = selectedCategory === 'all' || les.category === selectedCategory;
    const matchLevel = selectedLevel === 'all' || les.level === selectedLevel;
    const matchSearch =
      les.title.toLowerCase().includes(search.toLowerCase()) ||
      les.titleArabic.includes(search) ||
      les.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  const handlePlayAudio = async (id: string, text: string) => {
    setSpeakingId(id);
    await speakArabic(text);
    setSpeakingId(null);
  };

  const handleFinishLesson = (id: string) => {
    onCompleteLesson(id);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner Motivasi Belajar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kurikulum Standar Bahasa Arab Terstruktur</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Koleksi Modul & Materi Pembelajaran
            </h2>
            <p className="font-arabic text-emerald-400 text-base sm:text-lg mt-1 font-semibold">
              تَعَلَّمِ اللُّغَةَ العَرَبِيَّةَ بِسُهُولَةٍ وَإِتْقَانٍ
            </p>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Pelajari kaidah huruf hijaiyah, hafalan mufrodat tematik, dasar-dasar ilmu Nahwu, dan dialog percakapan lengkap dengan audio pelafalan asli.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-slate-900/60 backdrop-blur border border-emerald-700/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Progres Pembelajaran</p>
              <p className="text-base font-bold text-white">
                {completedLessonIds.length} <span className="text-xs text-slate-400 font-normal">dari {lessons.length} modul</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Category & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi, judul Arab, atau kosakata..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Tingkat</option>
            <option value="pemula">Tingkat Pemula (Mubtadi')</option>
            <option value="menengah">Tingkat Menengah (Mutawassith)</option>
            <option value="mahir">Tingkat Mahir (Mutaqoddim)</option>
          </select>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <span>{c.label}</span>
              <span className="font-arabic text-[11px] opacity-80">{c.labelArabic}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => {
                setActiveLesson(lesson);
                setModalTab(lesson.vocabulary && lesson.vocabulary.length > 0 ? 'mufrodat' : 'materi');
              }}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-600/50 rounded-2xl p-5 flex flex-col justify-between transition cursor-pointer shadow-sm hover:shadow-emerald-900/10 active:scale-[0.99]"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {lesson.category}
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {lesson.level}
                    </span>
                  )}
                </div>

                {/* Arabic Calligraphy Title */}
                <h3 className="font-arabic text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition mb-1 leading-snug">
                  {lesson.titleArabic}
                </h3>

                {/* Indonesian Title */}
                <h4 className="text-sm font-bold text-slate-200 mb-2">
                  {lesson.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              {/* Bottom metadata */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  {lesson.vocabulary && (
                    <span>{lesson.vocabulary.length} Kosakata</span>
                  )}
                  {lesson.dialogues && (
                    <span>{lesson.dialogues.length} Baris Dialog</span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition">
                  <span>Buka Materi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-300">Materi tidak ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci lain atau ganti filter kategori.</p>
        </div>
      )}

      {/* DETAIL MODAL PEMBELAJARAN */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    {activeLesson.category}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    Tingkat {activeLesson.level}
                  </span>
                </div>
                <h2 className="font-arabic text-2xl sm:text-3xl font-bold text-amber-300 leading-normal">
                  {activeLesson.titleArabic}
                </h2>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 border-b border-slate-800 flex gap-4 text-xs font-semibold bg-slate-950/40">
              <button
                type="button"
                onClick={() => setModalTab('materi')}
                className={`py-3 border-b-2 transition cursor-pointer ${
                  modalTab === 'materi'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Penjelasan Kaidah
              </button>

              {activeLesson.vocabulary && activeLesson.vocabulary.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalTab('mufrodat')}
                  className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    modalTab === 'mufrodat'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Daftar Mufrodat ({activeLesson.vocabulary.length})</span>
                  <span className="font-arabic text-[11px]">المُفْرَدَات</span>
                </button>
              )}

              {activeLesson.dialogues && activeLesson.dialogues.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalTab('dialogue')}
                  className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    modalTab === 'dialogue'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Percakapan ({activeLesson.dialogues.length})</span>
                  <span className="font-arabic text-[11px]">المُحَادَثَة</span>
                </button>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* TAB 1: Penjelasan Teori / Kaidah */}
              {modalTab === 'materi' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
                    <p className="font-semibold text-emerald-300 mb-1">Pengantar Modul:</p>
                    <p>{activeLesson.description}</p>
                  </div>

                  <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800 font-sans">
                    <p className="font-bold text-white text-sm mb-2">Penjelasan Lengkap:</p>
                    <p>{activeLesson.explanation}</p>
                  </div>

                  {activeLesson.grammarNotes && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-200">
                      <p className="font-bold text-amber-300 mb-1.5">Catatan Penting:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {activeLesson.grammarNotes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Mufrodat dengan Audio Pelafalan */}
              {modalTab === 'mufrodat' && activeLesson.vocabulary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.vocabulary.map((vocab) => {
                    const isBookmarked = savedVocabIds.includes(vocab.id);
                    const isSpeaking = speakingId === vocab.id;

                    return (
                      <div
                        key={vocab.id}
                        className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-emerald-500/50 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-arabic text-2xl font-bold text-white text-right">
                              {vocab.arabic}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handlePlayAudio(vocab.id, vocab.audioText || vocab.arabic)}
                                className={`p-2 rounded-xl border transition cursor-pointer ${
                                  isSpeaking 
                                    ? 'bg-amber-500 text-slate-900 border-amber-400 animate-pulse' 
                                    : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30'
                                }`}
                                title="Dengarkan Suara Pelafalan Arab"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onToggleBookmarkVocab(vocab.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                title="Simpan Kosakata"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-emerald-400 font-mono">
                            {vocab.transliteration}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                            {vocab.meaning}
                          </p>
                        </div>

                        {vocab.exampleArabic && (
                          <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-xs">
                            <p className="font-arabic text-sm text-amber-200 text-right">
                              {vocab.exampleArabic}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {vocab.exampleMeaning}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: Dialog Percakapan (Muhadatsah) */}
              {modalTab === 'dialogue' && activeLesson.dialogues && (
                <div className="space-y-3">
                  {activeLesson.dialogues.map((dlg) => {
                    const isSpeaking = speakingId === dlg.id;
                    return (
                      <div
                        key={dlg.id}
                        className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {dlg.speaker[0]}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white">{dlg.speaker}</span>
                            <span className="font-arabic text-emerald-400 text-xs ml-1.5 font-bold">({dlg.speakerArabic})</span>
                          </div>
                        </div>

                        <div className="flex-1 text-right sm:px-4">
                          <p className="font-arabic text-lg sm:text-xl font-bold text-amber-200 leading-relaxed">
                            {dlg.arabic}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 text-left sm:text-right">
                            {dlg.indonesian}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayAudio(dlg.id, dlg.arabic)}
                          className={`p-2 rounded-xl self-end sm:self-center border transition cursor-pointer ${
                            isSpeaking 
                              ? 'bg-amber-500 text-slate-900 border-amber-400 animate-pulse'
                              : 'bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white border-slate-600'
                          }`}
                          title="Dengarkan Percakapan"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Modal Footer with Completion Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Poin Modul: <strong className="text-amber-400">+50 XP</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleFinishLesson(activeLesson.id)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tandai Selesai & Klaim XP</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
