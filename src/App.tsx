import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Navbar, NavTab } from './components/Navbar';
import { LessonsScreen } from './components/LessonsScreen';
import { QuizScreen } from './components/QuizScreen';
import { GrammarAnalyzerScreen } from './components/GrammarAnalyzerScreen';
import { AiTutorScreen } from './components/AiTutorScreen';
import { AdminCurriculumScreen } from './components/AdminCurriculumScreen';
import type { Lesson, Quiz, UserProgress } from './types';

function MainApp() {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  // Load lessons, quizzes, and user progress
  const loadInitialData = async () => {
    try {
      const [lessonsRes, quizzesRes] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/quizzes')
      ]);

      const lessonsData = await lessonsRes.json();
      const quizzesData = await quizzesRes.json();

      if (lessonsData.success) setLessons(lessonsData.data);
      if (quizzesData.success) setQuizzes(quizzesData.data);

      if (user?.uid) {
        // Try reading user's own data from Firestore
        const { fetchUserProgressFromFirestore } = await import('./lib/firebase');
        const firestoreProgress = await fetchUserProgressFromFirestore(user.uid);
        if (firestoreProgress) {
          setProgress(firestoreProgress as UserProgress);
        } else {
          const progressRes = await fetch(`/api/progress/${user.uid}`);
          const progressData = await progressRes.json();
          if (progressData.success) {
            setProgress(progressData.data);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil data dari server, menggunakan cache/lokal:', err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Persist progress to server and Firestore
  const saveProgress = async (updated: Partial<UserProgress>) => {
    if (!user?.uid) return;
    try {
      const newProgress = {
        ...(progress || {
          userId: user.uid,
          xp: 120,
          level: 1,
          completedLessons: [],
          quizHistory: [],
          savedVocabIds: [],
          lastStudyDate: new Date().toISOString()
        }),
        ...updated
      };

      setProgress(newProgress);

      // Save to user's private Firestore sub-collection
      const { saveUserProgressToFirestore } = await import('./lib/firebase');
      await saveUserProgressToFirestore(user.uid, newProgress);

      // Also persist to API
      await fetch(`/api/progress/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgress)
      });
    } catch (err) {
      console.error('Gagal menyimpan kemajuan belajar:', err);
    }
  };

  // Complete a lesson -> add +50 XP
  const handleCompleteLesson = (lessonId: string) => {
    if (!progress) return;
    if (progress.completedLessons.includes(lessonId)) return;

    const newCompleted = [...progress.completedLessons, lessonId];
    const newXp = progress.xp + 50;
    const newLevel = Math.floor(newXp / 100) + 1;

    saveProgress({
      completedLessons: newCompleted,
      xp: newXp,
      level: newLevel
    });
  };

  // Bookmark vocabulary item
  const handleToggleBookmarkVocab = (vocabId: string) => {
    if (!progress) return;
    const isSaved = progress.savedVocabIds.includes(vocabId);
    const updated = isSaved
      ? progress.savedVocabIds.filter((id) => id !== vocabId)
      : [...progress.savedVocabIds, vocabId];

    saveProgress({ savedVocabIds: updated });
  };

  // Finish quiz -> add +score XP
  const handleQuizFinished = (quizId: string, score: number, total: number) => {
    if (!progress) return;
    const earnedXp = Math.round((score / total) * 100);
    const newXp = progress.xp + earnedXp;
    const newLevel = Math.floor(newXp / 100) + 1;

    const newHistory = [
      {
        quizId,
        score,
        totalQuestions: total,
        completedAt: new Date().toISOString()
      },
      ...progress.quizHistory
    ];

    saveProgress({
      xp: newXp,
      level: newLevel,
      quizHistory: newHistory
    });
  };

  // Admin add lesson
  const handleLessonAdded = (newLesson: Lesson) => {
    setLessons((prev) => [newLesson, ...prev]);
    setActiveTab('lessons');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-400 text-xs font-medium">Memuat Al-Arabiya Pintar...</p>
      </div>
    );
  }

  // MANDATORY LOGIN GATE:
  // If user is not authenticated, exclusively show LoginPage!
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar with tabs, user badge, and prominent logout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userXp={progress?.xp || 120}
      />

      {/* Main View Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'lessons' && (
          <LessonsScreen
            lessons={lessons}
            completedLessonIds={progress?.completedLessons || []}
            savedVocabIds={progress?.savedVocabIds || []}
            onCompleteLesson={handleCompleteLesson}
            onToggleBookmarkVocab={handleToggleBookmarkVocab}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizScreen
            quizzes={quizzes}
            onQuizFinished={handleQuizFinished}
          />
        )}

        {activeTab === 'analyzer' && (
          <GrammarAnalyzerScreen />
        )}

        {activeTab === 'tutor' && (
          <AiTutorScreen />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminCurriculumScreen
            lessons={lessons}
            onLessonAdded={handleLessonAdded}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 font-medium">
          <span>Al-Arabiya Pintar &copy; {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">•</span>
          <span className="font-arabic text-emerald-800 text-sm">مَن جَدَّ وَجَدَ</span>
          <span className="hidden sm:inline">•</span>
          <span>Media Pembelajaran Bahasa Arab Berbasis AI & Vercel Serverless</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
