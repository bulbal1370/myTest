import {
  ImozuruCitation,
  ImozuruExtract,
  ImozuruHypothesisSubagent,
  ImozuruConceptNode
} from '../types';

export const IMOZURU_CITATIONS: ImozuruCitation[] = [
  {
    id: 'xiao_2024',
    title: 'Efficient Streaming Language Models with Attention Sinks',
    authors: ['Guangxuan Xiao', 'Yuandong Tian', 'Beidi Chen', 'Song Han', 'Mike Lewis'],
    year: 2024,
    venue: 'ICLR 2024 (Oral)',
    arxivId: '2309.17453',
    url: 'https://arxiv.org/abs/2309.17453',
    coreContributionFa: 'کشف پدیده سینک توجه (Attention Sink) ناشی از قید جمع-به-یک در تابع Softmax و لزوم حفظ توکن‌های اولیه BOS در استریمینگ.',
    coreContributionEn: 'Discovered attention sinks caused by the Softmax sum-to-one constraint and proposed preserving initial BOS tokens for infinite streaming.',
    significanceForFutureKl: 'اثبات می‌کند که اتنشن بالای توکن‌های اولیه ارزش معنایی ندارد بلکه سطل زباله سافت‌مکس است؛ Future-KL این توکن‌ها را از شواهد تفکیک می‌کند.'
  },
  {
    id: 'zhang_2023',
    title: 'H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models',
    authors: ['Zhenyu Zhang', 'Ying Sheng', 'Tianyi Zhou', 'Tianlong Chen', 'Lianmin Zheng', 'Ruisi Cai', 'Zhao Song', 'Yuandong Tian', 'Christopher Ré', 'Clark Barrett', 'Zhangyang Wang', 'Beidi Chen'],
    year: 2023,
    venue: 'NeurIPS 2023',
    arxivId: '2306.14048',
    url: 'https://arxiv.org/abs/2306.14048',
    coreContributionFa: 'فرموله‌سازی تخلیه کش KV به عنوان بهینه‌سازی زیرمدولار و نگهداری توکن‌های پرتکرار (Heavy Hitters) بر پایه تجمیع گذشته‌نگر اتنشن.',
    coreContributionEn: 'Formulated KV cache eviction as a dynamic submodular problem, retaining Heavy Hitters based on cumulative past attention weights.',
    significanceForFutureKl: 'روش پایه تمام هیوریستیک‌ها؛ ضعف اساسی آن گذشته‌نگر بودن است که در زنجیره‌های تفکر ریاضی و توکن‌های میانی دچار شکست محاسباتی می‌شود.'
  },
  {
    id: 'li_2024',
    title: 'SnapKV: LLM Knows What You are Looking for Before Generation',
    authors: ['Yuhong Li', 'Yingbing Huang', 'Bowen Yang', 'Baghya Venkitesh', 'Acyr Locatelli', 'Hanchen Li', 'Gaurav Keerthi', 'Patrick Huang', 'Jiawei Zhao', 'Deming Chen'],
    year: 2024,
    venue: 'ACL 2024 Findings',
    arxivId: '2404.14469',
    url: 'https://arxiv.org/abs/2404.14469',
    coreContributionFa: 'شناسایی الگوهای متمرکز توجه از طریق "پنجره مشاهده" (Observation Window) در انتهای پرامپت و انتخاب خوشه‌ای توکن‌ها.',
    coreContributionEn: 'Identified consistent attention patterns via an observation window at prompt boundary, selecting clustered KV tokens without fine-tuning.',
    significanceForFutureKl: 'تایید می‌کند که انتهای پرامپت الگوهای اتنشن را متمرکز می‌کند؛ اما پنجره مشاهده قادر به پیش‌بینی واگرایی علّی در استنتاج چندمرحله‌ای نیست.'
  },
  {
    id: 'cai_2024',
    title: 'PyramidKV: Dynamic KV Cache Compression based on Pyramidal Information Funneling',
    authors: ['Yichi Zhang', 'Bofei Gao', 'Tianyu Liu', 'Keming Lu', 'Wayne Xiong', 'Yue Dong', 'Baobao Chang', 'Junjie Hu', 'Wen Xiao'],
    year: 2024,
    venue: 'ICML 2024',
    arxivId: '2406.02069',
    url: 'https://arxiv.org/abs/2406.02069',
    coreContributionFa: 'کشف پدیده قیف اطلاعاتی هرمی: لایه‌های پایینی ترانسفورمر به بافت گسترده نیاز دارند و لایه‌های بالایی به شدت فشرده می‌شوند.',
    coreContributionEn: 'Discovered Pyramidal Information Funneling: lower layers require broader KV capacity while higher layers concentrate on very few tokens.',
    significanceForFutureKl: 'مکمل معماری Future-KL؛ نشان می‌دهد که بودجه اوراکل باید به صورت هرمی در طول لایه‌ها تخصیص یابد تا حداکثر کارایی به دست آید.'
  },
  {
    id: 'liu_2024',
    title: 'Lost in the Middle: How Language Models Use Long Contexts',
    authors: ['Nelson F. Liu', 'Kevin Lin', 'John Hewitt', 'Ashwin Paranjape', 'Michele Bevilacqua', 'Fabio Petroni', 'Percy Liang'],
    year: 2024,
    venue: 'TACL 2024',
    arxivId: '2307.03172',
    url: 'https://arxiv.org/abs/2307.03172',
    coreContributionFa: 'اثبات تجربی منحنی U-شکل در مدل‌های زبانی: افت شدید دسترسی به داده‌های واقع در میانه کانتکست (Lost in the Middle).',
    coreContributionEn: 'Empirically proved the U-shaped performance curve: LLMs severely neglect information located in the middle of long contexts.',
    significanceForFutureKl: 'ریشه افت روش StreamingLLM و پنجره‌های لغزان؛ Future-KL با سنجش علّی اطلاعات میانی، سوزن‌های واقع در عمق ۲۵٪ تا ۵۰٪ را احیا می‌کند.'
  },
  {
    id: 'sun_2024',
    title: 'AdaKV: Optimizing KV Cache Eviction by Adapting to Head-wise Variations',
    authors: ['Fei Sun', 'Zhaocheng Zhu', 'Muhan Zhang'],
    year: 2024,
    venue: 'arXiv preprint',
    arxivId: '2407.11550',
    url: 'https://arxiv.org/abs/2407.11550',
    coreContributionFa: 'تخصیص تطبیقی بودجه کش به ازای هر هد اتنشن، به دلیل تفاوت فاحش اسپارسیتی و کاربرد هدهای مختلف.',
    coreContributionEn: 'Adaptive head-wise KV cache budget allocation based on variance in head sparsity and information entropy.',
    significanceForFutureKl: 'قوی‌ترین روش خط مبنا در متون پژوهشی با ریکال ۷۷٪؛ Future-KL با اوراکل علّی حتی از این تخصیص چندگانه هد نیز فراتر می‌رود (۸۸.۴٪).'
  },
  {
    id: 'rahnema_2026',
    title: 'Future-KL: Causal Downstream Utility Oracle for KV-Cache Eviction & Theoretical Resolution of the Intervention Mismatch',
    authors: ['Mohammadreza Rahnema', 'Doctoral Research Advisory Committee'],
    year: 2026,
    venue: 'PhD Dissertation Core Proposal',
    arxivId: '2026.FUTURE-KL-PHD',
    url: '#proposal_core',
    coreContributionFa: 'ارائه اوراکل علّی Leave-One-Out مبتنی بر واگرایی KL در افق آینده، کشف گسست مداخله (Intervention Mismatch) و تقریب سبک BiLSTM.',
    coreContributionEn: 'Proposed the Leave-One-Out causal future KL divergence oracle, discovered the Intervention Mismatch anomaly, and amortized surrogate distillation.',
    significanceForFutureKl: 'سنگ بنای اصلی رساله دکتری که حد بالای نظری استخراج توکن‌های حیاتی را محقق کرده و تناقض گزارش‌های قبلی را حل می‌کند.'
  }
];

export const IMOZURU_EXTRACTS: ImozuruExtract[] = [
  {
    id: 'EXT_01',
    paperId: 'xiao_2024',
    section: 'Section 3.1, Equation (2)',
    verbatimQuote: 'The softmax operation in self-attention requires that the attention weights for all keys sum to 1. Even if the current query has no strong semantic match to any previous token in the context, it still must distribute the probability mass... the model learns to dump this excess probability into the initial tokens as an attention sink.',
    claimId: 'F1',
    claimSummaryFa: 'توکن‌های اولیه به علت قید جمع-به-یک در سافت‌مکس به عنوان سطل زباله احتمال عمل می‌کنند و اتنشن بالای آن‌ها ناشی از ارزش معنایی نیست.',
    claimSummaryEn: 'Initial tokens serve as probability sinks due to softmax sum-to-one constraint, not intrinsic semantic importance.',
    imozuruVineLead: 'دنبال کردن این ادعا نشان داد چرا روش‌های مبتنی بر تجمیع اتنشن (H2O) فریب می‌خورند و توکن‌های بی‌معنی را بر توکن‌های محاسباتی ترجیح می‌دهند.'
  },
  {
    id: 'EXT_02',
    paperId: 'zhang_2023',
    section: 'Section 2.2, Definition 1',
    verbatimQuote: 'We define the cumulative attention score of token i at step t as S(i, t) = \\sum_{\\tau=1}^t A_{\\tau, i}. Tokens with the highest cumulative attention scores are termed Heavy Hitters (H2). Evicting non-H2 tokens retains 80% compression with negligible accuracy loss on single-turn summarization.',
    claimId: 'F2',
    claimSummaryFa: 'تعریف توکن‌های پرچگال (Heavy Hitters) بر پایه مجموع گذشته‌نگر اتنشن‌های دریافتی از ابتدا تا گام کنونی.',
    claimSummaryEn: 'Definition of Heavy Hitters based on past cumulative attention weights up to the current generation step.',
    imozuruVineLead: 'شکاف عمیق این تعریف: توجه تجمعی فقط گذشته را می‌بیند. متغیر میانی در زنجیره تفکر هنوز متولد نشده تا اتنشن جمع کند!'
  },
  {
    id: 'EXT_03',
    paperId: 'liu_2024',
    section: 'Section 4.1, Figure 3 & Findings',
    verbatimQuote: 'Across all evaluated open-source and proprietary long-context language models, performance follows a characteristic U-shaped curve. Retrieval accuracy plummets by up to 40% when the target factual needle is positioned in the middle 20%-70% of the context length, compared to the start or end.',
    claimId: 'F4b',
    claimSummaryFa: 'افت شدید دقت مدل‌های زبانی زمانی که داده در میانه کانتکست (۲۰٪ تا ۷۰٪) قرار دارد؛ اثبات پدیده گم‌شدن در میانه.',
    claimSummaryEn: 'Severe accuracy drop when key facts are located in the middle (20%-70%) of context; empirical proof of Lost in the Middle.',
    imozuruVineLead: 'ریشه افت StreamingLLM؛ این روش توکن‌های میانه را ۱۰۰٪ دور می‌ریزد و توانایی پاسخگویی به سوزن‌های میانی را به صفر می‌رساند.'
  },
  {
    id: 'EXT_04',
    paperId: 'li_2024',
    section: 'Section 3.2, Algorithm 1',
    verbatimQuote: 'Attention heads in LLMs exhibit clustered activation patterns that are largely fixed prior to token generation. By observing the query-key interaction within a small window L_{obs} at the end of the prompt, SnapKV selects feature clusters without full sequence traversal.',
    claimId: 'F2',
    claimSummaryFa: 'پنجره مشاهده در انتهای پرامپت می‌تواند خوشه‌های اتنشن را پیش از آغاز تولید تشخیص دهد.',
    claimSummaryEn: 'Observation window at prompt boundary captures clustered attention patterns prior to generation without fine-tuning.',
    imozuruVineLead: 'این متد گامی به جلو بود اما چون فاقد ارزیابی توزیع خروجی آینده (KL) است، در استدلال‌های چندمرحله‌ای پیوستگی متغیرها را از دست می‌دهد.'
  },
  {
    id: 'EXT_05',
    paperId: 'cai_2024',
    section: 'Section 2.1, Figure 2',
    verbatimQuote: 'Transformer representations undergo pyramidal information funneling: lower layers maintain broad lexical grounding across the sequence, whereas upper layers compress this information into a tiny set of abstract tokens. Uniform layer budgets waste up to 60% of KV capacity.',
    claimId: 'F1',
    claimSummaryFa: 'قیف اطلاعاتی هرمی: لایه‌های پایین نیاز به کش وسیع دارند و لایه‌های بالا با کش بسیار فشرده کار می‌کنند.',
    claimSummaryEn: 'Pyramidal information funneling: lower layers need broad KV capacity; upper layers compress to tiny token subsets.',
    imozuruVineLead: 'توجیه ساختاری برای ادغام Future-KL با پروفایل بودجه هرمی در لایه‌های ترانسفورمر.'
  },
  {
    id: 'EXT_06',
    paperId: 'rahnema_2026',
    section: 'Finding F3 & F4b (Diagnostic Anomaly)',
    verbatimQuote: 'Physical prompt token removal (remove) alters RoPE positional encodings for all subsequent tokens, introducing severe out-of-distribution phase perturbations. Consequently, token utility rankings derived from "remove" correlate near-zero with actual KV-cache zero-masking "evict" (|Spearman rho| = 0.012, Jaccard = 0.139).',
    claimId: 'F3',
    claimSummaryFa: 'گسست مداخله: حذف فیزیکی توکن زاویه فاز RoPE را به هم می‌ریزد؛ در نتیجه برچسب‌های remove با تخلیه کش evict ناهمبسته‌اند (rho=0.012).',
    claimSummaryEn: 'Intervention Mismatch: physical removal perturbs RoPE phase angles; remove and evict rankings are orthogonal (rho=0.012).',
    imozuruVineLead: 'کشف بزرگ رساله: حل معمای گزارش report.md و اثبات این‌که سنجش تخریب حافظه باید با ماسک صفر در کش انجام شود نه حذف متنی.'
  },
  {
    id: 'EXT_07',
    paperId: 'rahnema_2026',
    section: 'Finding F9 (Learned Surrogate Amortization)',
    verbatimQuote: 'While the Leave-One-Out Future-KL oracle requires O(N * m) forward evaluations during offline annotation, a lightweight BiLSTM surrogate trained on prefill hidden states predicts token utility in a single O(N) pass, achieving Spearman rho = 0.750 [0.688, 0.811] on held-out prompts.',
    claimId: 'F9',
    claimSummaryFa: 'تقریب‌گر یادگیرنده سبک: مدل BiLSTM با یک گذر O(N) روی حالات پنهان پیش‌تکمیل به همبستگی rho=0.750 با اوراکل دست می‌یابد.',
    claimSummaryEn: 'Learned BiLSTM surrogate predicts future token utility in a single O(N) prefill pass, achieving Spearman rho = 0.750 on held-out prompts.',
    imozuruVineLead: 'پاسخ قاطع به مسئله پیچیدگی محاسباتی اوراکل و امکان‌پذیر ساختن پیاده‌سازی بلادرنگ در سیستم‌های واقعی سروینگ.'
  }
];

export const IMOZURU_SUBAGENTS: ImozuruHypothesisSubagent[] = [
  {
    id: 'subagent_causal',
    nameFa: 'ساب‌ایجنت الف: مدافع علّی و نظریه‌پرداز اطلاعات (Subagent α)',
    nameEn: 'Subagent α: The Causal & Information-Theoretic Advocate',
    avatarIcon: 'BrainCircuit',
    stance: 'Causal Ground Truth via Future KL Divergence',
    hypothesisFa: '«اتنشن‌های گذشته‌نگر یک شاخص گمراه‌کننده برای اهمیت حافظه هستند؛ سودمندی حقیقی هر توکن صرفاً با میزان واگرایی توزیع توکن‌های آینده در غیاب آن (D_KL) سنجیده می‌شود.»',
    hypothesisEn: 'Past attention weights are misleading proxies. True KV token utility is strictly measured by the downstream predictive divergence caused by its eviction (D_KL).',
    evidencePointsFa: [
      'اثبات سینک سافت‌مکس (Xiao 2024): توکن‌های آغازین اتنشن بسیار زیادی را به عنوان سطل زباله جذب می‌کنند بدون آنکه ارزش معنایی داشته باشند.',
      'آزمون زنجیره تفکر: در استدلال ریاضی GSM8K، متغیر میانی z=25 در ابتدا اتنشن ندارد اما حذف آن در گام‌های بعدی باعث پرش و خطای محاسباتی می‌شود (F2).',
      'آزمون درون‌سازگاری تجربی (F4a): حذف توکن‌های برتر تعیین‌شده توسط Future-KL به طور معناداری (p < 0.0001) مدل را بیش از انتخاب تصادفی تخریب می‌کند.'
    ],
    evidencePointsEn: [
      'Softmax Sink Proof (Xiao 2024): Initial tokens absorb heavy attention as garbage collectors without real semantic content.',
      'Thinking Chain Test: Intermediate variable z=25 has low early attention but its eviction causes catastrophic downstream arithmetic failure (F2).',
      'Internal Sanity Validation (F4a): Ablating top-ranked Future-KL tokens causes significantly worse damage than random (p < 0.0001).'
    ],
    primaryExtractIds: ['EXT_01', 'EXT_02', 'EXT_06'],
    counterArgumentsFa: [
      'چگونه می‌خواهید در زمان استنتاج بلادرنگ به توکن‌های آینده Y که هنوز تولید نشده‌اند دسترسی داشته باشید؟',
      'محاسبه Leave-One-Out نیازمند N بار فوروارد است که پیچیدگی O(N*m) دارد و برای سروینگ صنعتی توجیه‌پذیر نیست.'
    ],
    counterArgumentsEn: [
      'How can you access future tokens Y at inference time before they are generated?',
      'Leave-One-Out requires N forward passes (O(N*m)), rendering it computationally intractable for online serving.'
    ],
    resolutionVerdictFa: 'اوراکل به عنوان حد بالای نظری (Upper Bound Standard) و برچسب‌زن آفلاین (Offline Teacher) برای آموزش مدل‌های سریع کاربرد دارد (F8).',
    resolutionVerdictEn: 'The Oracle serves as the privileged ground-truth upper bound and offline teacher to train fast online models (F8).'
  },
  {
    id: 'subagent_latency',
    nameFa: 'ساب‌ایجنت ب: واقع‌گرای تاخیر محاسباتی و سیستم‌های بلادرنگ (Subagent β)',
    nameEn: 'Subagent β: The Online Latency & Systems Realist',
    avatarIcon: 'Cpu',
    stance: 'Online Feasibility, Distillation & Single-Pass Inference',
    hypothesisFa: '«اوراکل آینده‌نگر به دلیل نیاز به رول‌اوت آینده و بار محاسباتی O(N*m) در محیط عملیاتی غیرممکن است؛ تمرکز رساله باید بر تقریب تک‌گذره در پیش‌تکمیل (Prefill Distillation) باشد.»',
    hypothesisEn: 'An oracle requiring future rollouts is computationally impossible in production; the core research value lies in single-pass prefill distillation.',
    evidencePointsFa: [
      'روش‌های صنعتی (مانند vLLM و TensorRT-LLM) نمی‌توانند پیش از تولید توکن‌ها چندین پاس محاسباتی روی کل کانتکست اجرا کنند.',
      'پدیده گسست مداخله (F3): تغییر فیزیکی توکن‌ها به علت جابجایی RoPE نتایج را مخدوش می‌کند؛ بنابراین تقریب باید دقیقاً بر روی ساختار درونی کش باشد.',
      'یافته پایلوت F9: شبکه BiLSTM سبک با استفاده از حالات پنهان پیش‌تکمیل توانست به ضریب همبستگی رتبه‌ای ρ = 0.750 با اوراکل بدون نیاز به تولید آینده دست یابد.'
    ],
    evidencePointsEn: [
      'Production serving engines (vLLM, TensorRT-LLM) cannot afford multiple forward passes per prompt.',
      'Intervention Mismatch (F3): Physical modifications distort RoPE phase; approximation must directly operate on internal cache states.',
      'Pilot Finding F9: A lightweight BiLSTM trained on prefill hidden states achieves Spearman rho = 0.750 with the oracle in a single pass.'
    ],
    primaryExtractIds: ['EXT_05', 'EXT_06', 'EXT_07'],
    counterArgumentsFa: [
      'روش‌های هیوریستیک سریع کنونی (H2O, SnapKV) بدون داشتن برچسب اوراکل، قادر به فهم وابستگی‌های علّی عمیق نیستند و در سوزن‌های میانی شکست می‌خورند.',
      'بدون وجود یک اوراکل دقیق (Ground Truth)، نمی‌توان تقریب‌گرها را به شکل نظارت‌شده آموزش داد.'
    ],
    counterArgumentsEn: [
      'Existing zero-shot heuristics (H2O, SnapKV) lack causal foresight and fail on intermediate needles without ground truth.',
      'Without an exact causal oracle, it is impossible to train supervised surrogate models.'
    ],
    resolutionVerdictFa: 'سنتز دو دیدگاه: همگرایی در ساختار معلم-شاگرد (Teacher-Student): اوراکل Future-KL معلم داده‌ساز است و تقریب‌گر برخط شاگرد سبک است (RQ4/F9).',
    resolutionVerdictEn: 'Dialectical Synthesis: Teacher-Student paradigm. Future-KL is the offline labeler; the lightweight surrogate is the deployed online student (RQ4/F9).'
  }
];

export const IMOZURU_CONCEPTS: ImozuruConceptNode[] = [
  {
    id: 'attention_sink',
    termEn: 'Attention Sinks (Softmax Leak)',
    termFa: 'سینک‌های توجه (سطل زباله سافت‌مکس)',
    category: 'mechanism',
    definitionFa: 'پدیده‌ای که در آن اولین توکن‌های ورودی (مانند <s> یا BOS) به علت قید جمع-به-یک در سافت‌مکس و دید همگانی، اتنشن بسیار زیادی را به عنوان سطل زباله جذب می‌کنند.',
    definitionEn: 'Phenomenon where initial tokens absorb disproportionately high attention weights due to the Softmax sum-to-one constraint and global visibility.',
    originPaperId: 'xiao_2024',
    keyResearchers: ['Guangxuan Xiao', 'Song Han', 'Mike Lewis'],
    connectedConcepts: ['heavy_hitters', 'future_kl_divergence'],
    supportedFindings: ['F1', 'F2']
  },
  {
    id: 'heavy_hitters',
    termEn: 'Heavy Hitters (H2 Tokens)',
    termFa: 'توکن‌های پرچگال توجه (H2)',
    category: 'mechanism',
    definitionFa: 'مجموعه کوچکی از توکن‌ها که بیشترین وزن انباشته اتنشن را در طول گام‌های پیشین تولید متن دریافت کرده‌اند.',
    definitionEn: 'A sparse subset of tokens accumulating the majority of attention weight mass during historical autoregressive decoding steps.',
    originPaperId: 'zhang_2023',
    keyResearchers: ['Zhenyu Zhang', 'Ying Sheng', 'Beidi Chen'],
    connectedConcepts: ['attention_sink', 'observation_window'],
    supportedFindings: ['F2', 'F4a']
  },
  {
    id: 'intervention_mismatch',
    termEn: 'Intervention Mismatch Disconnect',
    termFa: 'گسست معنایی مداخله (Remove در برابر Evict)',
    category: 'anomaly',
    definitionFa: 'ناهماهنگی اساسی میان حذف فیزیکی توکن از پرامپت (که موقعیت و زوایای فاز RoPE را جابجا می‌کند) و ماسک کردن بردار KV با صفر در کش (rho ≈ 0.012).',
    definitionEn: 'Fundamental semantic disconnect between physical prompt deletion (altering RoPE position IDs) and in-cache zero-masking (rho ≈ 0.012).',
    originPaperId: 'rahnema_2026',
    keyResearchers: ['Mohammadreza Rahnema', 'Doctoral Committee'],
    connectedConcepts: ['future_kl_divergence', 'pyramidal_funneling'],
    supportedFindings: ['F3', 'F4b', 'F5']
  },
  {
    id: 'future_kl_divergence',
    termEn: 'Downstream Causal KL Divergence',
    termFa: 'واگرایی علّی آینده در غیاب توکن (Future-KL)',
    category: 'causal_theory',
    definitionFa: 'سنجش میزان تغییر در توزیع پیش‌بینی توکن‌های آینده در افق m زمانی که توکن iام با ماسک صفر از حافظه KV خارج می‌شود: D_KL(P_full || P_{\\i}).',
    definitionEn: 'Causal impact of masking token i on the predictive distribution of downstream tokens over horizon m: D_KL(P_full || P_{\\i}).',
    originPaperId: 'rahnema_2026',
    keyResearchers: ['Mohammadreza Rahnema'],
    connectedConcepts: ['intervention_mismatch', 'surrogate_distillation'],
    supportedFindings: ['F1', 'F2', 'F4a', 'F7', 'F8']
  },
  {
    id: 'pyramidal_funneling',
    termEn: 'Pyramidal Information Funneling',
    termFa: 'قیف اطلاعاتی هرمی لایه‌ها',
    category: 'architectural',
    definitionFa: 'ساختار توزیع اطلاعات در لایه‌های ترانسفورمر که در آن لایه‌های زیرین توجه پراکنده دارند و لایه‌های بالاتر به شدت روی توکن‌های معدودی متمرکز می‌شوند.',
    definitionEn: 'Hierarchical transformer information flow where lower layers need broad KV retention and higher layers compress into sparse representations.',
    originPaperId: 'cai_2024',
    keyResearchers: ['Yichi Zhang', 'Wen Xiao', 'Junjie Hu'],
    connectedConcepts: ['heavy_hitters', 'future_kl_divergence'],
    supportedFindings: ['F1', 'F9']
  },
  {
    id: 'surrogate_distillation',
    termEn: 'Amortized Prefill Surrogate',
    termFa: 'تقریب‌گر یادگیرنده تک‌گذره در پیش‌تکمیل',
    category: 'causal_theory',
    definitionFa: 'مدل یادگیرنده سبک (مانند BiLSTM یا MLP بین‌لایه‌ای) که در مرحله پیش‌تکمیل با یک گذر O(N) اهمیت علّی توکن‌ها را بدون نیاز به تولید آینده پیش‌بینی می‌کند.',
    definitionEn: 'A lightweight neural probe predicting future token utility in a single O(N) prefill pass without rollout execution.',
    originPaperId: 'rahnema_2026',
    keyResearchers: ['Mohammadreza Rahnema'],
    connectedConcepts: ['future_kl_divergence'],
    supportedFindings: ['F9', 'RQ4']
  }
];
