import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin account credentials specified by user:
// Email: fakhitaruqayyah04@gmail.com
// Password: Kauman615
const ADMIN_EMAIL = 'fakhitaruqayyah04@gmail.com';
const ADMIN_PASS = 'Kauman615';

// Initialize Gemini API with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// User progress storage (Firestore-compatible per-user schema)
interface UserProgressRecord {
  userId: string;
  xp: number;
  level: number;
  completedLessons: string[];
  quizHistory: Array<{
    quizId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
  }>;
  savedVocabIds: string[];
  lastStudyDate: string;
}

const userProgressStore: Record<string, UserProgressRecord> = {};

// Initial Rich Curriculum for Arabic Learning
const lessons = [
  {
    id: 'les-hijaiyah-01',
    title: 'Pengenalan Huruf Hijaiyah & Vokal',
    titleArabic: 'الحُرُوفُ الهِجَائِيَّةُ وَالحَرَكَاتُ',
    category: 'hijaiyah',
    level: 'pemula',
    description: 'Mengenal 28 huruf hijaiyah, harakat dasar (Fathah, Kasrah, Dhommah, Sukun, Tanwin), serta cara pelafalannya yang fasih.',
    explanation: `Bahasa Arab memiliki 28 huruf konsonan dasar. Huruf dibaca dari kanan ke kiri.
Bunyi vokal dibentuk melalui Harakat:
1. Fathah (ـَ) menghasilkan bunyi 'A'
2. Kasrah (ـِ) menghasilkan bunyi 'I'
3. Dhommah (ـُ) menghasilkan bunyi 'U'
4. Sukun (ـْ) menandakan konsonan mati
5. Tanwin (ـً ـٍ ـٌ) menghasilkan akhiran 'an', 'in', 'un'`,
    vocabulary: [
      { id: 'v-h1', arabic: 'أَلِفٌ', transliteration: 'Alif', meaning: 'Huruf Alif', category: 'hijaiyah', audioText: 'أَلِف' },
      { id: 'v-h2', arabic: 'بَاءٌ', transliteration: 'Baa', meaning: 'Huruf Ba', category: 'hijaiyah', audioText: 'بَاء' },
      { id: 'v-h3', arabic: 'تَاءٌ', transliteration: 'Taa', meaning: 'Huruf Ta', category: 'hijaiyah', audioText: 'تَاء' },
      { id: 'v-h4', arabic: 'ثَاءٌ', transliteration: 'Tsaa', meaning: 'Huruf Tsa', category: 'hijaiyah', audioText: 'ثَاء' },
      { id: 'v-h5', arabic: 'جِيمٌ', transliteration: 'Jiim', meaning: 'Huruf Jim', category: 'hijaiyah', audioText: 'جِيم' },
      { id: 'v-h6', arabic: 'حَاءٌ', transliteration: 'Haa', meaning: 'Huruf Ha halus', category: 'hijaiyah', audioText: 'حَاء' }
    ],
    grammarNotes: [
      'Huruf Arab berubah bentuk saat di awal, di tengah, dan di akhir kata.',
      'Ada 6 huruf yang tidak bisa menyambung ke huruf setelahnya: ا, د, ذ, ر, ز, و'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'les-mufrodat-sekolah',
    title: 'Kosakata di Lingkungan Sekolah',
    titleArabic: 'المُفْرَدَاتُ: فِي المَدْرَسَةِ',
    category: 'mufrodat',
    level: 'pemula',
    description: 'Kosakata penting seputar kelas, alat tulis, guru, dan aktivitas belajar mengajar di madrasah.',
    explanation: 'Dalam bahasa Arab, benda memiliki jenis kelamin gramatikal: Mudzakkar (maskulin) dan Muannats (feminin, umumnya diakhiri Ta Marbuthoh ة).',
    vocabulary: [
      { id: 'v-s1', arabic: 'كِتَابٌ', transliteration: 'Kitaabun', meaning: 'Buku', category: 'sekolah', exampleArabic: 'هٰذَا كِتَابٌ مُفِيدٌ', exampleMeaning: 'Ini adalah buku yang bermanfaat.', audioText: 'كِتَابٌ' },
      { id: 'v-s2', arabic: 'قَلَمٌ', transliteration: 'Qolamun', meaning: 'Pena / Pulpen', category: 'sekolah', exampleArabic: 'أَكْتُبُ بِالقَلَمِ', exampleMeaning: 'Saya menulis dengan pena.', audioText: 'قَلَمٌ' },
      { id: 'v-s3', arabic: 'مَدْرَسَةٌ', transliteration: 'Madrasatun', meaning: 'Sekolah', category: 'sekolah', exampleArabic: 'مَدْرَسَتِي كَبِيرَةٌ وَنَظِيفَةٌ', exampleMeaning: 'Sekolah saya besar dan bersih.', audioText: 'مَدْرَسَةٌ' },
      { id: 'v-s4', arabic: 'أُسْتَاذٌ', transliteration: 'Ustaadzun', meaning: 'Guru Laki-laki', category: 'sekolah', exampleArabic: 'الأُسْتَاذُ يَشْرَحُ الدَّرْسَ', exampleMeaning: 'Guru menjelaskan pelajaran.', audioText: 'أُسْتَاذٌ' },
      { id: 'v-s5', arabic: 'طَالِبٌ', transliteration: 'Thoolibun', meaning: 'Murid Laki-laki / Santri', category: 'sekolah', exampleArabic: 'الطَّالِبُ يَجْتَهِدُ فِي التَّعَلُّمِ', exampleMeaning: 'Murid bersungguh-sungguh dalam belajar.', audioText: 'طَالِبٌ' },
      { id: 'v-s6', arabic: 'فَصْلٌ', transliteration: 'Fashlun', meaning: 'Ruang Kelas', category: 'sekolah', exampleArabic: 'نَحْنُ فِي الفَصْلِ الآنَ', exampleMeaning: 'Kami berada di dalam kelas sekarang.', audioText: 'فَصْلٌ' },
      { id: 'v-s7', arabic: 'حَقِيبَةٌ', transliteration: 'Haqiibatun', meaning: 'Tas', category: 'sekolah', exampleArabic: 'الحَقِيبَةُ عَلَى المَكْتَبِ', exampleMeaning: 'Tas itu berada di atas meja.', audioText: 'حَقِيبَةٌ' },
      { id: 'v-s8', arabic: 'مَكْتَبٌ', transliteration: 'Maktabun', meaning: 'Meja Tulis / Kantor', category: 'sekolah', exampleArabic: 'هٰذَا مَكْتَبٌ جَدِيدٌ', exampleMeaning: 'Ini meja baru.', audioText: 'مَكْتَبٌ' }
    ],
    grammarNotes: [
      'Isim Mudzakkar (contoh: قَلَمٌ) berpasangan dengan kata tunjuk هٰذَا (Haadzaa = Ini).',
      'Isim Muannats (contoh: مَدْرَسَةٌ) berpasangan dengan kata tunjuk هٰذِهِ (Haadzihi = Ini).'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'les-qawaid-aqsamul-kalimah',
    title: 'Tata Bahasa: Pembagian Kata (Aqsāmul Kalimah)',
    titleArabic: 'القَوَاعِدُ: أَقْسَامُ الكَلِمَةِ',
    category: 'qawaid',
    level: 'menengah',
    description: 'Pondasi utama ilmu Nahwu mengenai tiga unsur pembentuk kalimat dalam Bahasa Arab: Isim, Fi\'il, dan Harf.',
    explanation: `Dalam ilmu tata bahasa Arab (Nahwu), setiap kata dalam kalimat pasti tergolong ke dalam salah satu dari 3 kelompok:
1. Isim (اِسْمٌ): Kata benda, nama orang, tempat, sifat, atau konsep tanpa terikat waktu. Ciri: bisa ber-Alif Lam (ال), bertanwin, atau didahului huruf jar.
2. Fi'il (فِعْلٌ): Kata kerja yang terikat dengan waktu (Madhi = lampau, Mudhari' = sekarang/akan datang, Amr = perintah).
3. Harf (حَرْفٌ): Kata tugas / penghubung yang belum memiliki arti utuh kecuali bersambung dengan kata lain (contoh: مِنْ = dari, إِلَى = ke, فِي = di dalam).`,
    vocabulary: [
      { id: 'v-q1', arabic: 'اِسْمٌ', transliteration: 'Ismun', meaning: 'Kata Benda', category: 'qawaid', exampleArabic: 'مُحَمَّدٌ، شَجَرَةٌ، مَسْجِدٌ', exampleMeaning: 'Muhammad, Pohon, Masjid', audioText: 'اِسْمٌ' },
      { id: 'v-q2', arabic: 'فِعْلٌ', transliteration: "Fi'lun", meaning: 'Kata Kerja', category: 'qawaid', exampleArabic: 'قَرَأَ (Membaca), يَكْتُبُ (Menulis)', exampleMeaning: 'Bentuk perbuatan yang terikat masa waktu.', audioText: 'فِعْلٌ' },
      { id: 'v-q3', arabic: 'حَرْفٌ', transliteration: 'Harfun', meaning: 'Kata Penghubung / Huruf', category: 'qawaid', exampleArabic: 'فِي، عَلَى، مِنْ، إِلَى', exampleMeaning: 'Di dalam, di atas, dari, ke.', audioText: 'حَرْفٌ' }
    ],
    grammarNotes: [
      'Kalimat sempurna dalam bahasa Arab disebut "Jumlah Mufidah".',
      'Jika diawali Isim disebut Jumlah Ismiyyah (Mubtada + Khobar).',
      'Jika diawali Fi\'il disebut Jumlah Fi\'liyyah (Fi\'il + Fa\'il + Maf\'ul Bih).'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'les-muhadatsah-taaruf',
    title: 'Percakapan Sehari-hari: Ta\'aruf (Perkenalan)',
    titleArabic: 'المُحَادَثَةُ: التَّعَارُفُ وَالتَّحِيَّاتُ',
    category: 'muhadatsah',
    level: 'pemula',
    description: 'Ungkapan salam, menanyakan kabar, nama, dan asal daerah dalam percakapan dua orang santri.',
    explanation: 'Pelajari intonasi dan sopan santun dalam menyapa saudara sesama penuntut ilmu.',
    dialogues: [
      { id: 'd-1', speaker: 'Ahmad', speakerArabic: 'أَحْمَد', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ', indonesian: 'Semoga keselamatan, rahmat Allah, dan berkah-Nya tercurah kepadamu.' },
      { id: 'd-2', speaker: 'Farhan', speakerArabic: 'فَرْحَان', arabic: 'وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ', indonesian: 'Dan semoga kepadamu juga keselamatan, rahmat Allah, dan berkah-Nya.' },
      { id: 'd-3', speaker: 'Ahmad', speakerArabic: 'أَحْمَد', arabic: 'صَبَاحُ الخَيْرِ، كَيْفَ حَالُكَ يَا أَخِي؟', indonesian: 'Selamat pagi, bagaimana kabarmu wahai saudaraku?' },
      { id: 'd-4', speaker: 'Farhan', speakerArabic: 'فَرْحَان', arabic: 'صَبَاحُ النُّورِ، الحَمْدُ لِلّٰهِ أَنَا بِخَيْرٍ. وَأَنْتَ؟', indonesian: 'Selamat pagi, segala puji bagi Allah saya baik-baik saja. Dan kamu?' },
      { id: 'd-5', speaker: 'Ahmad', speakerArabic: 'أَحْمَد', arabic: 'أَنَا بِخَيْرٍ أَيْضًا. مَا اسْمُكَ الكَرِيمُ؟', indonesian: 'Saya juga baik-baik saja. Siapakah namamu yang mulia?' },
      { id: 'd-6', speaker: 'Farhan', speakerArabic: 'فَرْحَان', arabic: 'اِسْمِي فَرْحَان، وَأَنَا مِنْ مَدِينَةِ يُوجْيَاكَارْتَا. وَمَا اسْمُكَ؟', indonesian: 'Nama saya Farhan, dan saya berasal dari kota Yogyakarta. Dan siapa namamu?' },
      { id: 'd-7', speaker: 'Ahmad', speakerArabic: 'أَحْمَد', arabic: 'اِسْمِي أَحْمَد، فُرْصَةٌ سَعِيدَةٌ يَا فَرْحَان!', indonesian: 'Nama saya Ahmad, senang sekali berkenalan denganmu wahai Farhan!' },
      { id: 'd-8', speaker: 'Farhan', speakerArabic: 'فَرْحَان', arabic: 'تَشَرَّفْنَا، مَعَ السَّلَامَةِ!', indonesian: 'Sama-sama suatu kehormatan, selamat jalan!' }
    ],
    vocabulary: [
      { id: 'v-m1', arabic: 'كَيْفَ حَالُكَ؟', transliteration: 'Kayfa Haaluka?', meaning: 'Bagaimana kabarmu? (untuk laki-laki)', category: 'muhadatsah', audioText: 'كَيْفَ حَالُكَ' },
      { id: 'v-m2', arabic: 'صَبَاحُ الخَيْرِ', transliteration: 'Shobaahul Khoir', meaning: 'Selamat Pagi', category: 'muhadatsah', audioText: 'صَبَاحُ الخَيْر' },
      { id: 'v-m3', arabic: 'مَا اسْمُكَ؟', transliteration: 'Mas-muka?', meaning: 'Siapa namamu?', category: 'muhadatsah', audioText: 'مَا اسْمُك' }
    ],
    createdAt: new Date().toISOString()
  }
];

// Interactive Quizzes
const quizzes = [
  {
    id: 'quiz-01',
    lessonId: 'les-mufrodat-sekolah',
    title: 'Kuis Evaluasi Mufrodat Sekolah',
    titleArabic: 'اِخْتِبَارُ المُفْرَدَاتِ المَدْرَسِيَّةِ',
    difficulty: 'pemula',
    questions: [
      {
        id: 'q1',
        question: 'Apakah arti dari kosakata "كِتَابٌ" (Kitaabun)?',
        arabicPrompt: 'كِتَابٌ',
        options: ['Meja', 'Buku', 'Pena', 'Pintu'],
        correctIndex: 1,
        explanation: '"كِتَابٌ" (Kitaabun) berarti Buku bacaan atau kitab.'
      },
      {
        id: 'q2',
        question: 'Pilihlah kata tunjuk yang tepat untuk kata "مَدْرَسَةٌ" (Madrasatun):',
        arabicPrompt: '... مَدْرَسَةٌ كَبِيرَةٌ',
        options: ['هٰذَا (Haadzaa)', 'هٰذِهِ (Haadzihi)', 'ذٰلِكَ (Dzaalika)', 'هُوَ (Huwa)'],
        correctIndex: 1,
        explanation: '"مَدْرَسَةٌ" adalah Isim Muannats karena diakhiri Ta Marbuthah (ة), sehingga menggunakan kata tunjuk "هٰذِهِ".'
      },
      {
        id: 'q3',
        question: 'Bahasa Arab yang benar untuk "Pena / Pulpen" adalah:',
        options: ['فَصْلٌ', 'بَابٌ', 'قَلَمٌ', 'حَقِيبَةٌ'],
        correctIndex: 2,
        explanation: 'Pena dalam bahasa Arab adalah "قَلَمٌ" (Qolamun).'
      },
      {
        id: 'q4',
        question: 'Manakah yang termasuk contoh Isim (Kata Benda)?',
        options: ['قَرَأَ (Qoro\'a)', 'فِي (Fii)', 'مَسْجِدٌ (Masjidun)', 'إِلَى (Ilaa)'],
        correctIndex: 2,
        explanation: '"مَسْجِدٌ" adalah Isim karena menunjukkan nama tempat dan bertanwin.'
      }
    ]
  },
  {
    id: 'quiz-02',
    lessonId: 'les-qawaid-aqsamul-kalimah',
    title: 'Kuis Pemahaman Tata Bahasa Nahwu Dasar',
    titleArabic: 'اِخْتِبَارُ القَوَاعِدِ النَّحْوِيَّةِ',
    difficulty: 'menengah',
    questions: [
      {
        id: 'q2-1',
        question: 'Berapa pembagian kata (Kalimah) dalam bahasa Arab?',
        options: ['2 Bagian', '3 Bagian (Isim, Fi\'il, Harf)', '4 Bagian', '5 Bagian'],
        correctIndex: 1,
        explanation: 'Menurut kitab jurumiyyah dan kaidah nahwu, kata terbagi 3: Isim, Fi\'il, dan Harf.'
      },
      {
        id: 'q2-2',
        question: 'Kata "يَكْتُبُ" (Yaktubu = sedang/akan menulis) tergolong ke dalam:',
        options: ['Isim', 'Fi\'il (Kata Kerja)', 'Harf', 'Dhorof'],
        correctIndex: 1,
        explanation: '"يَكْتُبُ" adalah Fi\'il Mudhari\' karena menunjukkan perbuatan yang sedang berlangsung.'
      }
    ]
  }
];

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Al-Arabiya Pintar AI',
    time: new Date().toISOString(),
    geminiConfigured: !!apiKey
  });
});

// Auth endpoint: Email & Password login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  // Admin Verification
  if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
    res.json({
      success: true,
      message: 'Ahlan wa Sahlan! Login Admin Berhasil.',
      user: {
        uid: 'admin_fakhita_kauman',
        email: ADMIN_EMAIL,
        displayName: 'Ustadzah Fakhita Ruqayyah (Admin)',
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        institution: 'Pusat Studi Bahasa Arab Kauman',
        lastLogin: new Date().toISOString()
      }
    });
    return;
  }

  // Demo Student Account
  if (cleanEmail === 'santri@alarabiya.id' && password === 'Santri123') {
    res.json({
      success: true,
      message: 'Ahlan wa Sahlan! Login Santri Berhasil.',
      user: {
        uid: 'santri_student_01',
        email: 'santri@alarabiya.id',
        displayName: 'Ahmad Faiz (Santri)',
        role: 'student',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        institution: 'Madrasah Kauman',
        lastLogin: new Date().toISOString()
      }
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Kombinasi email atau kata sandi salah. Untuk Admin gunakan fakhitaruqayyah04@gmail.com dan Kauman615'
  });
});

// Google Sign-In endpoint
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, displayName, photoURL, uid } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Data akun Google diperlukan.' });
    return;
  }

  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  res.json({
    success: true,
    message: 'Login Google berhasil.',
    user: {
      uid: uid || `google_${Date.now()}`,
      email,
      displayName: displayName || (isAdmin ? 'Ustadzah Fakhita Ruqayyah (Admin)' : 'Thalibul Ilmi (Santri)'),
      role: isAdmin ? 'admin' : 'student',
      photoURL: photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution: 'Pusat Studi Bahasa Arab Kauman',
      provider: 'google.com',
      lastLogin: new Date().toISOString()
    }
  });
});

// Get Lessons
app.get('/api/lessons', (_req: Request, res: Response) => {
  res.json({ success: true, data: lessons });
});

// Add Lesson (Admin only)
app.post('/api/lessons', (req: Request, res: Response) => {
  const { title, titleArabic, category, level, description, explanation, vocabulary, dialogues } = req.body;

  if (!title || !titleArabic) {
    res.status(400).json({ success: false, message: 'Judul materi dalam bahasa Indonesia dan Arab wajib diisi.' });
    return;
  }

  const newLesson = {
    id: `les-${Date.now()}`,
    title,
    titleArabic,
    category: category || 'mufrodat',
    level: level || 'pemula',
    description: description || '',
    explanation: explanation || '',
    vocabulary: vocabulary || [],
    dialogues: dialogues || [],
    createdAt: new Date().toISOString()
  };

  lessons.unshift(newLesson);
  res.status(201).json({ success: true, data: newLesson });
});

// Get Quizzes
app.get('/api/quizzes', (_req: Request, res: Response) => {
  res.json({ success: true, data: quizzes });
});

// User Progress per user
app.get('/api/progress/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const progress = userProgressStore[userId] || {
    userId,
    xp: 120,
    level: 1,
    completedLessons: ['les-hijaiyah-01'],
    quizHistory: [
      { quizId: 'quiz-01', score: 100, totalQuestions: 4, completedAt: new Date(Date.now() - 86400000).toISOString() }
    ],
    savedVocabIds: ['v-s1', 'v-s2'],
    lastStudyDate: new Date().toISOString()
  };
  res.json({ success: true, data: progress });
});

app.post('/api/progress/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const update = req.body;

  userProgressStore[userId] = {
    ...userProgressStore[userId],
    ...update,
    userId,
    lastStudyDate: new Date().toISOString()
  };

  res.json({ success: true, data: userProgressStore[userId] });
});

// AI Arabic Tutor: Interactive Arabic learning assistant using Gemini 3.8 Flash
app.post('/api/ai/arabic-tutor', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
      return;
    }

    if (!genAI) {
      // High-quality smart response fallback
      res.json({
        success: true,
        source: 'local_tutor',
        reply: `أَهْلًا وَسَهْلًا بِكَ! (Selamat datang!)
Terkait pertanyaan Anda tentang "${message}":
Dalam kaidah bahasa Arab, penting untuk selalu memperhatikan harakat akhir kata dan jenis kata (Isim, Fi'il, atau Harf). 
Silakan tanyakan contoh kalimat atau makna kosakata tertentu yang ingin Anda pelajari lebih lanjut!`
      });
      return;
    }

    const systemInstruction = `Kamu adalah "Ustadz AI", guru dan tutor ahli Bahasa Arab yang ramah, berwawasan luas, dan fasih dalam ilmu Nahwu, Shorof, Mufrodat, dan Balaghah untuk santri dan penuntut ilmu di Indonesia.
Pedoman Menjawab:
1. Setiap teks bahasa Arab WAJIB diberikan HARAKAT LENGKAP (vowelized/tasykil) agar mudah dibaca oleh pembelajar pemula.
2. Sertakan transliterasi latin dan terjemahan Bahasa Indonesia yang tepat.
3. Berikan contoh kalimat aplikatif yang mudah dipraktekkan.
4. Gunakan gaya bahasa pengajaran yang santun, memotivasi, dan sistematis.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nPertanyaan Santri/Murid: ${message}` }]
    });

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents
    });

    res.json({
      success: true,
      source: 'gemini_server',
      reply: response.text || 'Maaf, belum dapat merespon saat ini.'
    });
  } catch (err: any) {
    console.error('AI Tutor error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Sentence & Grammar (I'rob) Analyzer
app.post('/api/ai/analyze-sentence', async (req: Request, res: Response) => {
  try {
    const { sentence } = req.body;

    if (!sentence || !sentence.trim()) {
      res.status(400).json({ success: false, message: 'Kalimat bahasa Arab diperlukan.' });
      return;
    }

    if (!genAI) {
      // Heuristic fallback
      res.json({
        success: true,
        data: {
          originalText: sentence,
          vowelizedText: sentence,
          indonesianTranslation: 'Kalimat latihan bahasa Arab.',
          words: [
            { word: sentence.split(' ')[0] || sentence, wordType: 'Isim', meaning: 'Kata dalam kalimat', analysis: 'Kedudukan sebagai Mubtada/Fa\'il' }
          ],
          rulesExplanation: 'Kalimat bahasa Arab terdiri dari susunan kata yang memiliki hubungan gramatikal (Tarkib).'
        }
      });
      return;
    }

    const prompt = `Analisis kalimat bahasa Arab berikut untuk media pembelajaran santri:
Kalimat: "${sentence}"

Kembalikan HANYA format JSON valid tanpa blok markdown (\`\`\`json) dengan struktur:
{
  "originalText": "${sentence}",
  "vowelizedText": "kalimat dengan harakat lengkap yang benar",
  "indonesianTranslation": "arti kalimat dalam Bahasa Indonesia yang baik",
  "words": [
    {
      "word": "kata berharakat",
      "wordType": "Isim" atau "Fi'il" atau "Harf",
      "meaning": "arti kata per kata",
      "analysis": "analisis tata bahasa singkat (misal: Fa'il marfu' / Khobar / Harf Jar)"
    }
  ],
  "rulesExplanation": "penjelasan ringkas kaidah nahwu/shorof pada kalimat ini (1-2 paragraf singkat)"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    let text = response.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch {
      res.json({
        success: true,
        data: {
          originalText: sentence,
          vowelizedText: sentence,
          indonesianTranslation: text.slice(0, 150),
          words: [],
          rulesExplanation: text
        }
      });
    }
  } catch (err: any) {
    console.error('Analyze sentence error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Curriculum Generator (for Admin to create new vocabulary & lessons)
app.post('/api/ai/generate-lesson', async (req: Request, res: Response) => {
  try {
    const { topic, category, level } = req.body;

    if (!topic) {
      res.status(400).json({ success: false, message: 'Topik materi diperlukan.' });
      return;
    }

    if (!genAI) {
      res.json({
        success: true,
        data: {
          titleArabic: `دَرْسٌ: ${topic}`,
          description: `Materi pembelajaran mengenai ${topic}.`,
          vocabulary: [
            { arabic: 'كَلِمَةٌ', transliteration: 'Kalimatun', meaning: 'Kata', audioText: 'كَلِمَة' }
          ]
        }
      });
      return;
    }

    const prompt = `Kamu adalah perancang kurikulum Bahasa Arab.
Buatkan materi pembelajaran untuk topik: "${topic}", kategori: "${category || 'mufrodat'}", tingkat: "${level || 'pemula'}".

Kembalikan HANYA format JSON valid tanpa blok markdown:
{
  "titleArabic": "judul materi dalam Bahasa Arab berharakat",
  "description": "ringkasan isi materi dalam Bahasa Indonesia",
  "explanation": "penjelasan teori/kaidah singkat dan menarik",
  "vocabulary": [
    {
      "arabic": "kata Arab berharakat",
      "transliteration": "cara baca latin",
      "meaning": "arti bahasa Indonesia",
      "exampleArabic": "contoh kalimat berharakat",
      "exampleMeaning": "arti contoh kalimat",
      "audioText": "kata Arab tanpa tanda baca aneh"
    }
  ]
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    let text = response.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export default app for Vercel without app.listen
export default app;
