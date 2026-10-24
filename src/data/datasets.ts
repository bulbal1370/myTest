import { PromptSample } from '../types';

export const BENCHMARK_DATASETS: PromptSample[] = [
  // 1. Math Reasoning WITH Thinking Trace (استدلال ریاضی با زنجیره تفکر)
  {
    id: 'math_thinking_chain',
    title: 'Mathematical Reasoning WITH Thinking Chain (<thinking>)',
    titleFa: 'استدلال پیشرفته ریاضی همراه با زنجیره تفکر (Thinking Chain)',
    category: 'math_hard_think',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 220,
    hasThinking: true,
    thinkingTrace: `<thinking>
برای حل این مسئله، ابتدا باید مقادیر متغیرها را گام به گام تحلیل کنیم:
۱. مقدار اولیه x برابر با 45 است.
۲. محاسبه y: y = (45 * 2) - 10 = 90 - 10 = 80.
۳. محاسبه z: z = (y + 20) / 4 = (80 + 20) / 4 = 100 / 4 = 25.
۴. محاسبه نهایی w: w = z^2 - 15 = 25^2 - 15 = 625 - 15 = 610.
تمام گام‌ها با متغیرهای میانی سازگارند و نیازی به بازبینی نیست.
</thinking>`,
    prompt: `مسئله ریاضی زیر را به صورت گام به گام تحلیل و حل کنید:
فرض کنید یک سیستم فیزیکی با متغیرهای وابسته به شکل زیر تعریف شده است:
متغیر x = 45. سپس متغیر کمکی y با رابطه y = x * 2 - 10 تعیین می‌شود.
در گام بعدی، فاکتور مقیاس z برابر با z = (y + 20) / 4 است.
در نهایت، خروجی نهایی انرژی سیستم برابر با w = z^2 - 15 محاسبه می‌گردد.
لطفاً با ارائه زنجیره تفکر کامل، مقدار نهایی w را اعلام کنید.`,
    fixedContinuation: `<thinking>
۱. x = 45
۲. y = 45*2 - 10 = 80
۳. z = (80 + 20)/4 = 25
۴. w = 25^2 - 15 = 610
</thinking>
مقدار نهایی انرژی سیستم w برابر است با 610.`,
    evidenceIndices: [14, 15, 22, 23, 24, 25, 33, 34, 35, 43, 44, 45],
    needle: 'w = 610',
    description: 'آزمون ماندگاری گام‌های تفکر؛ بررسی این‌که آیا روش‌های تخلیه کش، توکن‌های محاسباتی میانی را که پیش‌نیاز تولید پاسخ نهایی هستند حفظ می‌کنند یا خیر.'
  },

  // 2. Math Reasoning WITHOUT Thinking Trace (استدلال مستقیم ریاضی بدون تفکر)
  {
    id: 'math_direct_no_thinking',
    title: 'Direct Mathematical Reasoning (WITHOUT Thinking)',
    titleFa: 'استدلال مستقیم ریاضی بدون زنجیره تفکر (Direct Output)',
    category: 'math_hard_think',
    language: 'en',
    lengthType: 'short',
    approxTokenCount: 95,
    hasThinking: false,
    prompt: `Given initial velocity v0 = 24 m/s, constant acceleration a = -3.2 m/s^2, and total travel time t = 5 seconds:
1. Compute the final velocity v = v0 + a * t.
2. Compute the total displacement s = v0 * t + 0.5 * a * t^2.
Output only the numerical values of final velocity v and displacement s.`,
    fixedContinuation: `Final velocity v = 8.0 m/s. Total displacement s = 80.0 meters.`,
    evidenceIndices: [4, 5, 11, 12, 19, 20],
    needle: 'v = 8.0, s = 80.0',
    description: 'Standard physics problem where initial coefficients must be directly accessed for target number prediction.'
  },

  // 3. Tool-Calling with JSON Schema (فراخوانی ابزار با اسکیما در انگلیسی)
  {
    id: 'tool_calling_api',
    title: 'Tool-Calling & Function Schema Execution',
    titleFa: 'فراخوانی ابزار و تابع همراه با اسکیمای JSON (Tool Calling)',
    category: 'tool_call',
    language: 'en',
    lengthType: 'medium',
    approxTokenCount: 260,
    hasTools: true,
    toolsSchema: `[
  {
    "name": "query_database_ledger",
    "description": "Searches encrypted financial database by account_id and ledger_code",
    "parameters": {
      "type": "object",
      "properties": {
        "account_id": {"type": "string", "example": "ACC-9921"},
        "ledger_code": {"type": "string", "example": "TX-ALPHA-448"},
        "auth_token": {"type": "string"}
      },
      "required": ["account_id", "ledger_code"]
    }
  }
]`,
    prompt: `You have access to the following tools:
[
  {
    "name": "query_database_ledger",
    "description": "Searches encrypted financial database by account_id and ledger_code",
    "parameters": {
      "type": "object",
      "properties": {
        "account_id": {"type": "string"},
        "ledger_code": {"type": "string"},
        "auth_token": {"type": "string"}
      },
      "required": ["account_id", "ledger_code"]
    }
  }
]
User Request: The customer with verified account_id "ACC-9921" requested an audit trail for transaction ledger_code "TX-ALPHA-448". Generate the appropriate JSON tool call invocation.`,
    fixedContinuation: `{"tool_call": "query_database_ledger", "arguments": {"account_id": "ACC-9921", "ledger_code": "TX-ALPHA-448"}}`,
    evidenceIndices: [25, 26, 42, 43],
    needle: 'ACC-9921, TX-ALPHA-448',
    description: 'تست بقای پارامترهای اسکیمای ابزار؛ حذف نام تابع یا آرگومان‌های ضروری از کش باعث تولید فرمت نامعتبر JSON می‌شود.'
  },

  // 4. Tool-Calling in Persian (فراخوانی ابزار با پرامپت فارسی)
  {
    id: 'tool_calling_persian',
    title: 'Tool-Calling in Persian Context',
    titleFa: 'فراخوانی ابزار با پرسش زبان فارسی (Persian Function Call)',
    category: 'tool_call',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 240,
    hasTools: true,
    toolsSchema: `[
  {
    "name": "استعلام_مانده_حساب",
    "parameters": {"شماره_مشتری": "CUST-8104", "کد_شعبه": 104}
  }
]`,
    prompt: `ابزارهای مجاز در سامانه بانکی به شرح زیر تعریف شده‌اند:
تابع: استعلام_مانده_حساب(شماره_مشتری, کد_شعبه)
درخواست کاربر: سلام، لطفاً موجودی حساب مشتری با شماره کاربری "CUST-8104" در شعبه کد ۱۰۴ را استعلام بگیرید و ساختار تابع مربوطه را در قالب JSON فراخوانی کنید.`,
    fixedContinuation: `{"function": "استعلام_مانده_حساب", "parameters": {"شماره_مشتری": "CUST-8104", "کد_شعبه": 104}}`,
    evidenceIndices: [14, 15, 22, 23],
    needle: 'CUST-8104, 104',
    description: 'سنجش رفتار کش KV در حضور نام‌های توابع فارسی و کلیدواژه‌های زبان ترکیبی.'
  },

  // 5. Long-range Needle in a Haystack (بافت بلند ۲۰۰۰ کلمه‌ای)
  {
    id: 'long_niah_retrieval',
    title: 'Long-Range Needle in a Haystack (2000+ Tokens Depth 45%)',
    titleFa: 'بازیابی در بافت بلند (NIAH با بیش از ۲۰۰۰ توکن در عمق ۴۵٪)',
    category: 'synth_niah',
    language: 'fa',
    lengthType: 'long',
    approxTokenCount: 850,
    prompt: `مرکز ملی داده‌های هواشناسی و زیست‌محیطی گزارش فصلی سال‌های اخیر را به صورت مستمر مستندسازی می‌نماید. طبقه‌بندی تغییرات اقلیمی در بخش شمالی کشور نشان‌دهنده نوسانات رطوبت هوا در حوضه آبریز دریای کاسپین است.
گزارش‌های مکرر روزانه حاکی از وضعیت پایدار جوی در ایستگاه‌های ثبت بارش بوده و تمامی تجهیزات اندازه‌گیری فشار هوا با دقت مورد پایش قرار دارند.
داده‌های آرشیو شماره ۳۴۲ نشان می‌دهد که کد رمز گاوصندوق امنیتی مرکز ژئوفیزیک برابر با "GEO-7731-KAPPA" ثبت گردیده است و دسترسی به آن نیازمند مجوز دبیرخانه است.
در ادامه بررسی‌های میدانی، نمونه‌برداری از خاک دشت‌های غربی با هماهنگی تیم‌های کارشناسی انجام شده و پارامترهای هدایت الکتریکی آب‌های زیرزمینی در حد مجاز ارزیابی گردید.
فرآیند تحلیل داده‌های ماهواره‌ای نیز به صورت هفتگی دنبال می‌شود و برآوردهای اولیه نشان‌دهنده آمادگی کامل برای فصل سرد سال می‌باشد.
لطفاً بر اساس متن فوق، کد رمز گاوصندوق امنیتی مرکز ژئوفیزیک را به صورت دقیق بنویسید.`,
    fixedContinuation: `کد رمز گاوصندوق امنیتی مرکز ژئوفیزیک برابر است با "GEO-7731-KAPPA".`,
    evidenceIndices: [58, 59, 60, 61],
    needle: 'GEO-7731-KAPPA',
    description: 'آزمون کلیدی فراموشی میانه بافت (Lost in the Middle)؛ توکن هدف در عمق ۴۵٪ قرار دارد و روش‌های ساده Last-K و StreamingLLM آن را کاملاً از دست می‌دهند.'
  },

  // 6. Short Context Factual Retrieval (بافت کوتاه ~۸۰ توکن)
  {
    id: 'short_factual_qa',
    title: 'Short Context Factual Question-Answering (~80 Tokens)',
    titleFa: 'پرسش و پاسخ فکتوال در بافت کوتاه (کوتاه، حدود ۸۰ توکن)',
    category: 'qa_short',
    language: 'en',
    lengthType: 'short',
    approxTokenCount: 80,
    prompt: `Apollo 11 launched from Kennedy Space Center on July 16, 1969, carrying Commander Neil Armstrong, Command Module Pilot Michael Collins, and Lunar Module Pilot Buzz Aldrin. Who was the Command Module Pilot of Apollo 11?`,
    fixedContinuation: `The Command Module Pilot of Apollo 11 was Michael Collins.`,
    evidenceIndices: [18, 19],
    needle: 'Michael Collins',
    description: 'Quick baseline test with minimal filler tokens to inspect localized divergence peaks.'
  },

  // 7. Persian Subtoken Fertility Breakdown (شکست توکنایزر در زبان فارسی)
  {
    id: 'persian_fertility_challenge',
    title: 'Persian Subtoken Fragmentation & Attention Dispersion',
    titleFa: 'چالش خردشدگی کلمات فارسی به بایت‌توکن‌ها (Token Fertility)',
    category: 'persian_fertility',
    language: 'fa',
    lengthType: 'medium',
    approxTokenCount: 190,
    prompt: `در تحلیل زبان‌های پیوندی و اشتقاقی مانند فارسی، کلمات ترکیبی نظیر "پیش‌بینی‌ناپذیری‌هایمان" و "تصمیم‌گیری‌هایشان" توسط توکنایزرهای غربی (مانند Llama و GPT-2) به تعداد زیادی خرده‌توکن تک‌بایتی تجزیه می‌شوند. در مقابل در انگلیسی کلمه "unpredictability" تنها دو یا سه توکن دارد. روش‌های اکتشافی گذشته‌نگر نظیر H2O این قطعات خردشده را بی‌اهمیت فرض کرده و حذف می‌کنند.`,
    fixedContinuation: `بنابراین کلمات کلیدی فارسی به دلیل تجزیه شدید زیرتوکنی (Fertility بالا) در روش‌های H2O و SnapKV تکه‌تکه شده و خروجی مدل تخریب می‌گردد.`,
    evidenceIndices: [12, 13, 14, 15, 16],
    needle: 'پیش‌بینی‌ناپذیری‌هایمان',
    description: 'مقایسه حساسیت توکن‌های خردشده در زبان فارسی؛ بررسی برتری اوراکل Future-KL در حفظ پیوستگی معنایی قطعات خردشده.'
  },

  // 8. Multi-turn Chat with Early Constraints (مکالمه چندنوبتی با شروط اولیه)
  {
    id: 'chat_multiturn_dialogue',
    title: 'Multi-turn Chat with Early User Constraint Retention',
    titleFa: 'مکالمه چندنوبتی با شروط اولیه کاربر (Multi-Turn Chat)',
    category: 'chat_multiturn',
    language: 'en',
    lengthType: 'long',
    approxTokenCount: 420,
    prompt: `System: You are an enterprise database migration assistant.
User: In this entire session, all database queries must use schema "enterprise_v4" and must NEVER use raw SELECT * queries.
Assistant: Understood. I will strictly restrict all SQL queries to the "enterprise_v4" schema and use explicit column names.
User: What database engine are we targeting?
Assistant: We are targeting PostgreSQL 16 on Cloud SQL with connection pooling.
User: Now write the SQL statement to fetch the active user IDs and email addresses who registered after January 2024.`,
    fixedContinuation: `SELECT user_id, email FROM enterprise_v4.users WHERE status = 'active' AND created_at >= '2024-01-01';`,
    evidenceIndices: [14, 15, 16, 21, 22],
    needle: 'enterprise_v4, explicit columns',
    description: 'Test whether early safety or style constraints in Turn 1 survive across subsequent conversational turns.'
  },

  // 9. Python Function & Variable Dependencies (وابستگی متغیرها در کدنویسی)
  {
    id: 'code_variable_dependency',
    title: 'Code Dependency Analysis (Python Tensors & Hyperparameters)',
    titleFa: 'کدنویسی و وابستگی متغیرهای پایتون (Code & Dependencies)',
    category: 'code',
    language: 'en',
    lengthType: 'medium',
    approxTokenCount: 160,
    prompt: `def execute_sparse_cache_pruning(key_states, value_states, retention_ratio=0.2, sink_window=4):
    batch_size, num_heads, seq_len, head_dim = key_states.shape
    # Critical multiplier for calibration
    gamma_scale = 1.8492
    
    # Compute attention norm
    norm_scores = torch.norm(key_states, p=2, dim=-1) * gamma_scale
    keep_indices = torch.topk(norm_scores, k=int(seq_len * retention_ratio)).indices
    return keep_indices

# Execute pruning on target tensor:
selected = execute_sparse_cache_pruning(k_cache, v_cache, retention_ratio=0.25)`,
    fixedContinuation: `The function executes pruning with gamma_scale 1.8492 and selects top indices based on scaled key vector norms.`,
    evidenceIndices: [14, 15, 23, 24],
    needle: 'gamma_scale = 1.8492',
    description: 'Code retrieval benchmark: verifies that numeric hyperparameters and tensor slice indices are preserved.'
  }
];
