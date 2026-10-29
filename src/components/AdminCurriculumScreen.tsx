import React, { useState } from 'react';
import { PlusCircle, Sparkles, BookOpen, Volume2, CheckCircle2, Shield, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Lesson, VocabularyItem } from '../types';
import { speakArabic } from '../lib/audio';

interface AdminCurriculumScreenProps {
  lessons: Lesson[];
  onLessonAdded: (newLesson: Lesson) => void;
}

export const AdminCurriculumScreen: React.FC<AdminCurriculumScreenProps> = ({
  lessons,
  onLessonAdded
}) => {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleArabic, setTitleArabic] = useState('');
  const [category, setCategory] = useState<'hijaiyah' | 'mufrodat' | 'qawaid' | 'muhadatsah'>('mufrodat');
  const [level, setLevel] = useState<'pemula' | 'menengah' | 'mahir'>('pemula');
  const [description, setDescription] = useState('');
  const [explanation, setExplanation] = useState('');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);

  // Temp vocab item input
  const [newVocabArabic, setNewVocabArabic] = useState('');
  const [newVocabLatin, setNewVocabLatin] = useState('');
  const [newVocabMeaning, setNewVocabMeaning] = useState('');
  const [newVocabExample, setNewVocabExample] = useState('');

  // Handle AI Lesson Generation
  const handleGenerateWithAi = async () => {
    if (!topicPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicPrompt,
          category,
          level
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        const gen = data.data;
        setTitle(`Materi: ${topicPrompt}`);
        setTitleArabic(gen.titleArabic || '');
        setDescription(gen.description || '');
        setExplanation(gen.explanation || '');
        if (Array.isArray(gen.vocabulary)) {
          const mappedVocab: VocabularyItem[] = gen.vocabulary.map((v: any, index: number) => ({
            id: `v-ai-${Date.now()}-${index}`,
            arabic: v.arabic,
            transliteration: v.transliteration || '',
            meaning: v.meaning || '',
            category: topicPrompt,
            exampleArabic: v.exampleArabic || '',
            exampleMeaning: v.exampleMeaning || '',
            audioText: v.audioText || v.arabic
          }));
          setVocabulary(mappedVocab);
        }
        setSuccessMessage('Materi berhasil di-generate secara otomatis oleh Gemini AI!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.message || 'Gagal men-generate materi.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi ke server AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualVocab = () => {
    if (!newVocabArabic || !newVocabMeaning) return;
    const newItem: VocabularyItem = {
      id: `v-man-${Date.now()}`,
      arabic: newVocabArabic,
      transliteration: newVocabLatin || newVocabArabic,
      meaning: newVocabMeaning,
      category: title || 'Umum',
      exampleArabic: newVocabExample,
      audioText: newVocabArabic
    };
    setVocabulary((prev) => [...prev, newItem]);
    setNewVocabArabic('');
    setNewVocabLatin('');
    setNewVocabMeaning('');
    setNewVocabExample('');
  };

  const handleRemoveVocab = (id: string) => {
    setVocabulary((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !titleArabic) {
      setErrorMessage('Judul Indonesia dan Judul Arab wajib diisi.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          titleArabic,
          category,
          level,
          description,
          explanation,
          vocabulary,
          dialogues: []
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        onLessonAdded(data.data);
        setSuccessMessage(`Materi "${title}" berhasil disimpan dan diterbitkan ke santri!`);
        // Reset form
        setTitle('');
        setTitleArabic('');
        setDescription('');
        setExplanation('');
        setVocabulary([]);
        setTopicPrompt('');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.message || 'Gagal menyimpan materi.');
      }
    } catch {
      setErrorMessage('Gagal menghubungi server untuk menyimpan materi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Admin Privilege Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Portal Pengasuh & Admin Khusus
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen Kurikulum & Materi Arab
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Selamat datang Ustadzah Fakhita Ruqayyah. Di sini Anda dapat menambahkan bab pembelajaran baru, memperkaya bank mufrodat, atau memanfaatkan AI untuk membuat silabus secara instan.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-center shrink-0">
            <span className="text-xs text-emerald-300 font-medium">Total Materi Terbit:</span>
            <div className="text-3xl font-black text-white mt-1">{lessons.length}</div>
            <span className="text-[11px] text-slate-300">Modul Aktif</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Fast Generator Tool */}
      <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-900">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base">Generate Materi Otomatis dengan Gemini 3.8 Flash</h3>
        </div>
        <p className="text-xs text-slate-600">
          Cukup masukkan topik bahasa Arab yang ingin Anda buat (misalnya: "Alat Transportasi", "Di Pasar Tradisional", "Fi'il Mudhari' Marfu'"). AI akan otomatis membuat judul bahasa Arab berharakat, penjelasan teori, dan tabel kosakata beserta contohnya.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            placeholder="Ketik topik materi... contoh: 'Peralatan Medis di Rumah Sakit'"
            className="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={isGenerating || !topicPrompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Merancang Materi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Kurikulum
              </>
            )}
          </button>
        </div>
      </div>

      {/* Curriculum Edit & Submit Form */}
      <form onSubmit={handleSaveLesson} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-lg text-slate-900">Formulir Penerbitan Materi Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Bahasa Indonesia *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mufrodat Fasilitas Sekolah"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Bahasa Arab (Berharakat) *
            </label>
            <input
              type="text"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
              placeholder="مِثَال: مُفْرَدَاتُ المَرَافِقِ المَدْرَسِيَّةِ"
              dir="rtl"
              required
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-base font-arabic font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Pembelajaran
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="hijaiyah">Huruf Hijaiyah & Fonetik (حُرُوف الهِجَائِيَّة)</option>
              <option value="mufrodat">Mufrodat / Kosakata Tematik (المُفْرَدَات)</option>
              <option value="qawaid">Qawa'id Nahwu & Shorof (القَوَاعِد)</option>
              <option value="muhadatsah">Muhadatsah / Percakapan (المُحَادَثَة)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tingkat Kesulitan
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="pemula">Tingkat Pemula (مُبْتَدِئ)</option>
              <option value="menengah">Tingkat Menengah (مُتَوَسِّط)</option>
              <option value="mahir">Tingkat Mahir (مُتَقَدِّم)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Deskripsi Ringkas
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ringkasan tentang apa yang akan dipelajari santri..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Penjelasan Teori / Kaidah Lengkap
          </label>
          <textarea
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Uraikan materi, rumus nahwu, atau tips menghafal..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-normal leading-relaxed"
          />
        </div>

        {/* Vocabulary Builder Subsection */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">
              Daftar Kosakata Materi ({vocabulary.length} Kata)
            </h4>
          </div>

          {/* Table of current vocabularies */}
          {vocabulary.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {vocabulary.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => speakArabic(item.arabic)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                      title="Dengar suara"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div>
                      <span className="font-arabic font-bold text-lg text-emerald-950 ml-2" dir="rtl">
                        {item.arabic}
                      </span>
                      <span className="text-xs text-slate-500">[{item.transliteration}]</span>
                      <span className="text-slate-800 font-medium ml-2">— {item.meaning}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveVocab(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
              Belum ada mufrodat. Anda dapat menggunakan generator AI di atas atau menambahkannya secara manual di bawah.
            </div>
          )}

          {/* Add Manual Vocab Row */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700">Tambah Mufrodat Manual:</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Kata Arab (مثال: قَلَمٌ)"
                dir="rtl"
                value={newVocabArabic}
                onChange={(e) => setNewVocabArabic(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-arabic font-bold"
              />
              <input
                type="text"
                placeholder="Cara baca (Qalamun)"
                value={newVocabLatin}
                onChange={(e) => setNewVocabLatin(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                placeholder="Arti (Pena/Pulpen)"
                value={newVocabMeaning}
                onChange={(e) => setNewVocabMeaning(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                placeholder="Contoh kalimat (opsional)"
                value={newVocabExample}
                onChange={(e) => setNewVocabExample(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddManualVocab}
                disabled={!newVocabArabic || !newVocabMeaning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Tambahkan Kata
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !title || !titleArabic}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-md transition"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menerbitkan Materi...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Terbitkan Materi Kurikulum
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
