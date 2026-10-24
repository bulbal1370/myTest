import React from 'react';
import { 
  BrainCircuit, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Languages, 
  SplitSquareVertical,
  Scale,
  Binary
} from 'lucide-react';

interface DeepInsightsTabProps {
  lang: 'fa' | 'en';
}

export const DeepInsightsTab: React.FC<DeepInsightsTabProps> = ({ lang }) => {
  const isFa = lang === 'fa';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isFa 
                ? 'تحلیل‌های عمیق روش‌شناختی: حل پارادوکس اوراکل و چالش زبان فارسی' 
                : 'Methodological Insights: The Intervention Mismatch & Cross-Lingual Fertility'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {isFa
              ? 'این بخش به دو پرسش اساسی در پروپوزال دکتری شما پاسخ می‌دهد: (۱) چرا در گزارش اولیه به اشتباه تصور شد Idea6 از Random بدتر است و چگونه نظریه گسست مداخله این تناقض را حل کرد؟ و (۲) چرا الگوریتم‌های رایج مقالات (H2O, SnapKV) روی زبان فارسی دچار شکست می‌شوند؟'
              : 'Theoretical foundations addressing the core research questions: resolving the superficial oracle contradiction and explaining why heuristic KV methods break on fragmented multilingual vocabularies.'}
          </p>
        </div>
      </div>

      {/* Insight 1: The Intervention Mismatch Theorem (Core PhD Contribution!) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <SplitSquareVertical className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {isFa 
                ? '۱. نظریه گسست معناشناسی مداخله (The Intervention Mismatch Theorem)' 
                : '1. The Intervention Mismatch Theorem'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa ? 'حل تناقض ظاهری: یافته F4a در برابر F4b و اثبات F2' : 'Resolving F4a vs F4b & Establishing F2'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Card A: Remove scheme */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                مداخله حذف فیزیکی (Prompt Deletion / Remove)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                P \ &#123;t_i&#125;
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              {isFa
                ? 'توکن از ابتدای پردازش وجود ندارد. تمام توکن‌های بعد از آن هرگز اطلاعات i را ندیده‌اند. بنابراین نمایش مخفی (Hidden States) تمام لایه‌ها تغییر می‌کند.'
                : 'Token never exists from the start. Representations of all subsequent tokens are completely transformed.'}
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">نتیجه آزمون Sanity درون‌مداخله‌ای (F4a):</div>
              <div className="text-emerald-400 font-bold">Top (+1.652) ≫ Random (+0.473) ≫ Bottom (+0.008)</div>
              <div className="text-[10px] text-slate-500">p &lt; 0.0001 (Wilcoxon paired) - کاملاً معتبر درون تعریف خودش!</div>
            </div>
          </div>

          {/* Card B: Evict scheme */}
          <div className="bg-slate-950 border border-emerald-900/30 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                مداخله تخلیه کش (KV-Cache Eviction / Evict)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                KV Cache Mask
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              {isFa
                ? 'مدل ابتدا کل پرامپت را می‌بیند و K/V توکن‌ها را می‌سازد؛ سپس فقط ستون K/V توکن i در کش صفر می‌شود. اطلاعات i هنوز در بردار پنهان توکن‌های بعدی باقی مانده است!'
                : 'Prefill sees full prompt. Later, only specific KV columns are masked. Prior causal traces remain in hidden states!'}
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">نتیجه ارزیابی در موتور KV (یافته F2):</div>
              <div className="text-emerald-400 font-bold">Future-KL: 2.36 (ایده ما) vs 8.49 (Random)</div>
              <div className="text-[10px] text-emerald-400">Evidence Recall: 73.2% vs 19.8% - برتری مطلق بر خطوط پایه!</div>
            </div>
          </div>
        </div>

        {/* The Fundamental Conclusion Box */}
        <div className="bg-indigo-950/30 border border-indigo-500/40 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isFa ? 'اصل دوم منشور پژوهش (Constitution Principle II):' : 'Research Constitution Principle II:'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            {isFa ? (
              <>
                <strong className="text-white">«اهمیت یک توکن، ویژگی ذاتی مدل نیست؛ بلکه ویژگی تعریف مداخله (Intervention) است.»</strong>
                <br />
                همبستگی برچسب‌های remove و evict در مدل Qwen2.5 برابر با 
                <span className="font-mono text-amber-400 mx-1">ρ = 0.012</span> 
                و شباهت Jaccard آن‌ها تنها 
                <span className="font-mono text-amber-400 mx-1">13.9%</span> 
                است! در گزارش اولیه، برچسب‌های محاسبه‌شده با روش remove را در موتور کش evict ارزیابی کردند و نتیجه ضعیف شد (F4b). اما وقتی هر مداخله در بستر خود سنجیده شود (F2)، اوراکل کارایی فوق‌العاده‌ای دارد. این کشف نظری یکی از مهم‌ترین دستاوردهای رساله شماست!
              </>
            ) : (
              'Importance is an intervention-dependent property, not an intrinsic model attribute. Spearman correlation between remove and evict is rho = 0.012.'
            )}
          </p>
        </div>
      </div>

      {/* Insight 2: Cross-Lingual & Persian Token Fertility */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Languages className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {isFa 
                ? '۲. معمای زبان فارسی: چرا H2O و SnapKV در زبان‌های پربار (High-Fertility) می‌شکنند؟' 
                : '2. The Multilingual Token Fertility Dilemma'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa ? 'چرا توجه در زبان‌های غیرلاتین پراکنده می‌شود و چگونه Future-KL آن را حل می‌کند؟' : 'Why heuristic attention methods fail on subtoken-fragmented languages'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>انگلیسی (Fertility ≈ 1.3)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">توکن‌های یکپارچه</span>
            </div>
            <div className="font-mono bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              Word: <span className="text-amber-400">"university"</span> → 1 token: <span className="text-emerald-400">[university]</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              در انگلیسی، مفهوم کلمه در یک یا دو توکن متمرکز است. روش‌های هیوریستیک مثل H2O به راحتی وزن بالای توجه این یک توکن را شناسایی می‌کنند و آن را نگه می‌دارند.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>فارسی (Fertility ≈ 3.5 - 6.0)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">خردشدن به بایت‌توکن</span>
            </div>
            <div className="font-mono bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
              کلمه: <span className="text-amber-400">"پیش‌بینی‌ناپذیری"</span> → ۵ توکن: <span className="text-rose-400">[پیش, بینی, ‌, نا, پذیری]</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              وزن توجه بین ۵ قطعه تقسیم می‌شود؛ بنابراین هیچ قطعه‌ای به حد نصاب «Heavy Hitter» روش H2O نمی‌رسد! مدل تصادفاً ۲ قطعه را حذف کرده و کل کلمه را تحریف می‌کند.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 text-xs space-y-2">
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {isFa ? 'چرا ایده Future-KL در برابر این مشکل مقاوم است؟' : 'Why Future-KL solves this:'}
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {isFa
              ? 'روش Future-KL به وزن توجه گذشته نگاه نمی‌کند؛ بلکه بررسی می‌کند که اگر این قطعه حذف شود، آیا خروجی ۱۰۰ توکن آینده تغییر می‌کند یا خیر؟ چون حذف حتی یک تکه از کلمه کلیدی، توزیع آینده را به شدت دگرگون می‌سازد، Future-KL تمام قطعات حامل معنا را با امتیاز واگرایی بالا حفظ می‌کند.'
              : 'Future-KL evaluates downstream distributional impact. Ablating any critical sub-piece causes massive multi-step divergence, successfully retaining fragmented Persian words.'}
          </p>
        </div>
      </div>

      {/* Insight 3: Metric Dissection - KL vs ΔNLL vs Evidence Recall */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Scale className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {isFa ? '۳. کالبدشکافی سه معیار: چرا روش‌ها در KL خوب ولی در ΔNLL متفاوتند؟' : '3. Metric Dissection: KL vs ΔNLL vs Evidence Recall'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa ? 'پارادوکس خلاصه نماینده در برابر واقعیت مشخص' : 'The Representative Summary vs Specific Fact trade-off'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-400 block font-mono">1. Future-KL (واگرایی توزیع)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>چه می‌پرسد؟</strong> «آیا مدل به‌طور کلی ساختار زبان و عدم‌قطعیت کلمات بعدی را حفظ کرده است؟»
              <br />
              یک معیار میانگین‌گیر و نرم که به متن خاص وابسته نیست و نویز پایینی دارد.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 block font-mono">2. ΔNLL (آسیب به پاسخ مرجع)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>چه می‌پرسد؟</strong> «آیا احتمال کلمات دقیق همان پاسخ درست مرجع کاهش یافته است؟»
              <br />
              یک معیار نقطه‌ای و حساس. اگر پاسخ دقیق کلمه "۷۴۹۲" باشد، افت احتمال همان عدد ΔNLL را بالا می‌برد.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 block font-mono">3. Evidence Recall (پوشش شاهد)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>چه می‌پرسد؟</strong> «آیا توکن‌هایی که پاسخ از آن‌ها استخراج می‌شود در ۲۰٪ کش باقی ماندند؟»
              <br />
              معیار کیفی نهایی برای کارهای بازیابی، پرسش و پاسخ، و کدنویسی.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
