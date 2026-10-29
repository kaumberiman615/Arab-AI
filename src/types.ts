export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
  photoURL?: string;
  institution?: string;
  provider?: string;
  lastLogin?: string;
}

export interface VocabularyItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  category: string;
  exampleArabic?: string;
  exampleMeaning?: string;
  audioText?: string;
}

export interface DialogueItem {
  id: string;
  speaker: string;
  speakerArabic: string;
  arabic: string;
  indonesian: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleArabic: string;
  category: 'hijaiyah' | 'mufrodat' | 'qawaid' | 'muhadatsah';
  level: 'pemula' | 'menengah' | 'mahir';
  description: string;
  explanation: string;
  vocabulary?: VocabularyItem[];
  dialogues?: DialogueItem[];
  grammarNotes?: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  arabicPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  titleArabic: string;
  difficulty: 'pemula' | 'menengah' | 'mahir';
  questions: QuizQuestion[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  completedLessons: string[];
  quizHistory: QuizResult[];
  savedVocabIds: string[];
  lastStudyDate: string;
}

export interface GrammarWordAnalysis {
  word: string;
  wordType: 'Isim' | "Fi'il" | 'Harf';
  meaning: string;
  analysis: string;
}

export interface GrammarAnalysisResponse {
  originalText: string;
  vowelizedText: string;
  indonesianTranslation: string;
  words: GrammarWordAnalysis[];
  rulesExplanation: string;
}
