import { PromptSample } from '../types';

export const SAMPLE_PROMPTS: PromptSample[] = [
  {
    id: 'persian_niah',
    title: 'بازیابی سوزن در بافت فارسی (NIAH با عبارات مزاحم)',
    titleFa: 'بازیابی سوزن در بافت فارسی (NIAH با عبارات مزاحم)',
    category: 'persian_fertility',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 160,
    prompt: `شرکت فناوری پردازش داده در سال ۱۴۰۳ قراردادهای متعددی با مراکز تحقیقاتی منعقد نمود. طبق آیین‌نامه داخلی، گزارش عملکرد هر سه ماه یک‌بار توسط تیم حسابرسی مستقل بررسی می‌گردد. کد رمز دسترسی به صندوق اسناد مالی محرمانه شرکت برابر با 7492-FXZ تعیین شده است و فقط مسئول حراست مجاز به استفاده از آن می‌باشد. پروژه‌های هوش مصنوعی و بهینه‌سازی حافظه نیز طبق برنامه زمان‌بندی با موفقیت ادامه دارند. لطفاً کد رمز دسترسی به صندوق اسناد محرمانه را اعلام فرمایید.`,
    fixedContinuation: `کد رمز دسترسی به صندوق اسناد مالی محرمانه برابر است با 7492-FXZ.`,
    evidenceIndices: [27, 28, 29, 30],
    needle: '7492-FXZ',
    description: 'تست بازیابی اطلاعات حساس در متن فارسی؛ ارزیابی مقاومت روش‌ها در برابر حذف توکن‌های حاوی رمز عبور در حضور توکن‌های متنی فراوان.'
  },
  {
    id: 'english_niah',
    title: 'Synthetic Needle in a Haystack (Long-range Retrieval)',
    titleFa: 'بازیابی سوزن مصنوعی در انبار کاه انگلیسی',
    category: 'synth_niah',
    language: 'en',
    lengthType: 'short',
    approxTokenCount: 95,
    prompt: `The climate records of the station indicate significant seasonal variance throughout 2024. Routine temperature readings were taken every hour. The secret access passcode to the nuclear telemetry archive is 9841-OMEGA. Meteorological observers noted irregular barometric pressure trends during the early autumn cycle. All experimental sensors remained calibrated. What is the secret access passcode?`,
    fixedContinuation: `The secret access passcode to the nuclear telemetry archive is 9841-OMEGA.`,
    evidenceIndices: [24, 25, 26, 27],
    needle: '9841-OMEGA',
    description: 'Standard synthetic retrieval test. Checks if eviction methods drop the crucial key/passcode or maintain it in the retained KV budget.'
  },
  {
    id: 'math_reasoning',
    title: 'استدلال زنجیره‌ای چندمرحله‌ای (Multi-Hop Math Reasoning)',
    titleFa: 'استدلال زنجیره‌ای چندمرحله‌ای با روابط وابسته',
    category: 'math_hard_think',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 180,
    hasThinking: true,
    prompt: `فرض کنید x = 45 و y = x * 2 - 10 باشد. سپس مقدار z به صورت z = (y + 20) / 4 تعریف می‌شود. در مرحله نهایی، متغیر نتیجه w = z^2 - 15 محاسبه می‌گردد. با توجه به این روابط گام به گام، مقدار نهایی w را دقیقاً محاسبه کنید.`,
    fixedContinuation: `گام ۱: y = 45 * 2 - 10 = 80. گام ۲: z = (80 + 20) / 4 = 25. گام ۳: w = 25^2 - 15 = 625 - 15 = 610. پاسخ نهایی برابر ۶۱۰ است.`,
    evidenceIndices: [3, 4, 10, 11, 12, 13, 21, 22, 23],
    needle: 'w = 610',
    description: 'آزمون تعامل علّی توکن‌ها (Synergy): حذف تعاریف میانی باعث به هم خوردن گام‌های استدلال ریاضی و افت شدید درست‌نمایی خروجی می‌شود.'
  },
  {
    id: 'persian_fertility_breakdown',
    title: 'چالش شکست توکنایزر در فارسی (Token Fertility Breakdown)',
    titleFa: 'چالش شکست توکنایزر در فارسی بر روی کلمات مشتق و متصل',
    category: 'persian_fertility',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 140,
    prompt: `در الگوریتم‌های رایج مانند H2O و SnapKV، توکن‌ها بر اساس تجمیع وزن توجه انتخاب می‌شوند. در زبان انگلیسی یک کلمه مانند "evaporation" به ۱ یا ۲ توکن تبدیل می‌شود؛ اما در زبان فارسی، کلمه‌ای مانند "پیش‌بینی‌ناپذیری" ممکن است به ۵ الی ۷ بایت‌توکن خرد شود. این امر توجه مدل را روی چندین قطعه پراکنده کرده و باعث شکست روش‌های متداول تخلیه کش می‌شود.`,
    fixedContinuation: `بنابراین تمرکز توجه در فارسی به شدت کاهش یافته و روش‌های وابسته به تمرکز (attention sparsity) کارایی خود را از دست می‌دهند.`,
    evidenceIndices: [22, 23, 24, 25, 26, 27, 28],
    needle: 'پیش‌بینی‌ناپذیری',
    description: 'مقایسه حساسیت توکن‌های تکه‌تکه‌شده؛ بررسی تفاوت اثر leave-one-out روی بایت‌توکن‌های فارسی در مقایسه با کلمات یکپارچه انگلیسی.'
  },
  {
    id: 'code_function',
    title: 'تحلیل وابستگی در قطعه کد پایتون (Python Function Dependency)',
    titleFa: 'تحلیل وابستگی در توابع پایتون و متغیرهای کلیدی',
    category: 'code',
    language: 'en',
    lengthType: 'short',
    approxTokenCount: 110,
    prompt: `def calculate_weighted_divergence(p_full, p_masked, horizon=100, eps=1e-10):
    # Core mathematical transformation
    scale_factor = 2.4589
    kl_matrix = np.sum(p_full * np.log((p_full + eps) / (p_masked + eps)), axis=-1)
    adjusted_score = np.sum(kl_matrix[:horizon]) * scale_factor
    return adjusted_score

# Now call the function with sample distributions:
val = calculate_weighted_divergence(dist_a, dist_b, 50)`,
    fixedContinuation: `The function returns the accumulated Kullback-Leibler divergence over 50 steps multiplied by scale_factor 2.4589.`,
    evidenceIndices: [9, 10, 11, 25, 26],
    needle: 'scale_factor = 2.4589',
    description: 'Code comprehension test where critical numeric parameters and function signatures must survive cache eviction.'
  }
];
