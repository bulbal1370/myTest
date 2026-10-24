import React, { useState } from 'react';
import {
  AccessibilitySettings,
  ImozuruCitation,
  ImozuruExtract,
  ImozuruHypothesisSubagent,
  ImozuruConceptNode
} from '../types';
import {
  IMOZURU_CITATIONS,
  IMOZURU_EXTRACTS,
  IMOZURU_SUBAGENTS,
  IMOZURU_CONCEPTS
} from '../data/imozuruResearchData';
import {
  BookOpen,
  GitBranch,
  Quote,
  Scale,
  BrainCircuit,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Bookmark,
  Compass,
  ArrowRight,
  ShieldCheck,
  FileCode,
  FileText
} from 'lucide-react';

interface ImozuruDeepResearchTabProps {
  lang: 'fa' | 'en';
  accessibility: AccessibilitySettings;
}

export const ImozuruDeepResearchTab: React.FC<ImozuruDeepResearchTabProps> = ({
  lang,
  accessibility
}) => {
  const isFa = lang === 'fa';

  const [activeSubTab, setActiveSubTab] = useState<'hypotheses' | 'extracts' | 'map' | 'export'>('hypotheses');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<ImozuruConceptNode>(IMOZURU_CONCEPTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredExtracts = IMOZURU_EXTRACTS.filter((ext) => {
    const matchesPaper = selectedPaperFilter === 'all' || ext.paperId === selectedPaperFilter;
    const matchesSearch = !searchQuery || 
      ext.verbatimQuote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.claimSummaryFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.claimId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPaper && matchesSearch;
  });

  // Export full Imozuru Dossier
  const handleExportDossier = (type: 'markdown' | 'json' | 'html') => {
    let content = '';
    let filename = '';
    let mime = 'text/plain';

    if (type === 'markdown') {
      filename = 'imozuru_futurekl_dossier.md';
      content = `# IMOZURU DEEP RESEARCH DOSSIER: Future-KL & KV-Cache Token Utility
*Methodology: MaryCache/imozuru (Bates's Berrypicking & Primary Source Lineage)*
*Date: 2026-10-24 | Target: PhD Dissertation Research Committee*

---

## 1. Domain Concept Map (map.md)
${IMOZURU_CONCEPTS.map(c => `### ${c.termEn} (${c.termFa})
- Category: ${c.category}
- Origin Paper: ${c.originPaperId}
- Key Researchers: ${c.keyResearchers.join(', ')}
- Definition: ${c.definitionEn}
- Supported Doctoral Findings: ${c.supportedFindings.join(', ')}
`).join('\n')}

---

## 2. Dual Subagent Hypotheses & Dialectical Synthesis
${IMOZURU_SUBAGENTS.map(agent => `### ${agent.nameEn}
- Core Hypothesis: ${agent.hypothesisEn}
- Evidence Points:
${agent.evidencePointsEn.map(p => `  * ${p}`).join('\n')}
- Counter-Arguments:
${agent.counterArgumentsEn.map(c => `  * ${c}`).join('\n')}
- Final Resolution: ${agent.resolutionVerdictEn}
`).join('\n')}

---

## 3. Primary Verbatim Extracts & Citations (extracts.json)
${IMOZURU_EXTRACTS.map(ext => {
  const paper = IMOZURU_CITATIONS.find(p => p.id === ext.paperId);
  return `### Extract [${ext.id}] - Supporting Claim ${ext.claimId}
- Source: ${paper?.title} (${paper?.authors[0]} et al., ${paper?.year}, ${paper?.venue})
- Section: ${ext.section}
- URL: ${paper?.url}
- Verbatim Quote:
  > "${ext.verbatimQuote}"
- Claim Summary: ${ext.claimSummaryEn}
- Imozuru Vine Lead: ${ext.imozuruVineLead}
`;
}).join('\n')}
`;
    } else if (type === 'json') {
      filename = 'imozuru_extracts.json';
      mime = 'application/json';
      content = JSON.stringify({
        project: 'Future-KL KV-Cache Token Utility',
        methodology: 'MaryCache/imozuru',
        version: '1.0.0',
        citations: IMOZURU_CITATIONS,
        extracts: IMOZURU_EXTRACTS,
        subagents: IMOZURU_SUBAGENTS,
        concepts: IMOZURU_CONCEPTS
      }, null, 2);
    } else {
      filename = 'imozuru_report.html';
      mime = 'text/html';
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Imozuru Deep Research Report - Future-KL Causal Token Utility</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 20px; color: #1e293b; background: #f8fafc; }
    h1, h2, h3 { color: #0f172a; }
    blockquote { border-left: 4px solid #6366f1; padding: 10px 20px; background: #e0e7ff; margin: 15px 0; border-radius: 4px; font-style: italic; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #ede9fe; color: #6d28d9; }
    .card { background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  </style>
</head>
<body>
  <h1>🍠 Imozuru Deep Research Report: Future-KL KV-Cache Utility</h1>
  <p><strong>Methodology:</strong> Primary source citation tracking (Imozuru-shiki) & dual subagent dialectic arbitration.</p>
  
  <h2>1. Primary Extracts & Direct Citations</h2>
  ${IMOZURU_EXTRACTS.map(ext => {
    const paper = IMOZURU_CITATIONS.find(p => p.id === ext.paperId);
    return `
    <div class="card">
      <span class="badge">${ext.claimId}</span>
      <h3>${paper?.title} (${paper?.year})</h3>
      <p><strong>Section:</strong> ${ext.section} | <strong>Venue:</strong> ${paper?.venue}</p>
      <blockquote>"${ext.verbatimQuote}"</blockquote>
      <p><strong>Significance:</strong> ${ext.claimSummaryEn}</p>
      <p><strong>Vine Lead:</strong> ${ext.imozuruVineLead}</p>
    </div>`;
  }).join('')}
</body>
</html>`;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Top Banner: The Imozuru Methodology */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Compass className="w-3.5 h-3.5" />
                <span>{isFa ? 'روش تحقیق کتابداری ایموزورو (Imozuru-shiki Research)' : 'Imozuru Librarian Deep Research Engine'}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                MaryCache/imozuru Spec
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Primary Sources • Zero Summaries
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isFa ? 'ردیابی زنجیره ادعاها تا مقالات و معادلات اصلی' : 'Tracing Every Claim Backward to Primary Sources & Equations'}
            </h1>
            <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
              {isFa
                ? 'ایموزورو (芋づる式 - بیرون کشیدن ساقه سیب‌زمینی شیرین) روش تحقیق کتابداران حرفه‌ای است. به جای تکرار خلاصه‌های کلیشه‌ای هوش مصنوعی، دو ساب‌ایجنت با فرضیه‌های متضاد به دنبال منابع اصلی، نویسندگان، معادلات و نقل‌قول‌های دقیق خط‌به‌خط می‌روند تا ریشه علمی ایده Future-KL و چرایی برتری آن نسبت به ۲۲ روش مقالات تا تهِ ماجرا اثبات شود.'
                : 'Imozuru (芋づる式) mimics deep librarian research: rather than repeating generic AI summaries, it deploys dual subagents with opposing hypotheses to follow citation links, authors, and equations backward to original source papers, outputting verifiable extracts for your doctoral dissertation.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExportDossier('markdown')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFa ? 'دانلود پرونده پژوهشی (.md)' : 'Export Dossier (.md)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'hypotheses', labelFa: 'میدان مناظره ساب‌ایجنت‌ها (Dual Subagents)', labelEn: 'Dual Subagent Hypotheses', icon: Scale },
          { id: 'extracts', labelFa: 'مخزن نقل‌قول‌های دقیق مقالات (Verbatim Vault)', labelEn: 'Verbatim Primary Extracts', icon: Quote },
          { id: 'map', labelFa: 'نقشه مفاهیم و ساقه علّی (Imozuru Concept Vine)', labelEn: 'Concept Vine & Map (map.md)', icon: GitBranch },
          { id: 'export', labelFa: 'استخراج داده و گزارش کامل (Dossier Exporter)', labelEn: 'Report & Exports (report.html)', icon: FileCode }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isFa ? tab.labelFa : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Dual Subagent Dialectic */}
      {activeSubTab === 'hypotheses' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4 text-xs text-slate-400 leading-relaxed flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                {isFa
                  ? 'به کارگیری دو Subagent مستقل با فرضیه‌های متضاد تضمین می‌کند که پژوهش از ابتدا دچار سوگیری تایید (Confirmation Bias) نشود؛ یکی از دیدگاه تئوری اطلاعات و علّیت دفاع می‌کند و دیگری چالش‌های تاخیر محاسباتی و کاربرد صنعتی را مطرح می‌نماید.'
                  : 'Running dual subagents with opposing hypotheses prevents confirmation bias: Subagent α advocates for causal ground truth, while Subagent β raises rigorous systems latency and online deployment challenges.'}
              </span>
            </div>
            <span className="font-mono text-indigo-400 shrink-0 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/40 text-[11px]">
              Dialectical Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {IMOZURU_SUBAGENTS.map((agent) => {
              const isCausal = agent.id === 'subagent_causal';
              return (
                <div
                  key={agent.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between shadow-lg space-y-5 ${
                    isCausal
                      ? 'border-violet-500/30 bg-gradient-to-b from-violet-950/20 to-slate-900/80'
                      : 'border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/80'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          isCausal ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {isCausal ? <BrainCircuit className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {isFa ? agent.nameFa : agent.nameEn}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">{agent.stance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Core Hypothesis Block */}
                    <div className={`p-4 rounded-xl text-xs font-medium leading-relaxed border ${
                      isCausal ? 'bg-violet-950/40 text-violet-200 border-violet-800/40' : 'bg-amber-950/40 text-amber-200 border-amber-800/40'
                    }`}>
                      <span className="font-bold block mb-1">{isFa ? 'فرضیه اصلی:' : 'Core Hypothesis:'}</span>
                      {isFa ? agent.hypothesisFa : agent.hypothesisEn}
                    </div>

                    {/* Evidence Points */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isFa ? 'نقاط اتکا در مقالات اصلی (Primary Evidence):' : 'Primary Source Evidence Points:'}</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {(isFa ? agent.evidencePointsFa : agent.evidencePointsEn).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                            <span className="text-emerald-400 font-bold shrink-0">[✓]</span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges Faced */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-rose-400" />
                        <span>{isFa ? 'چالش‌ها و انتقادات ساب‌ایجنت مقابل:' : 'Counter-Arguments & Challenges:'}</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {(isFa ? agent.counterArgumentsFa : agent.counterArgumentsEn).map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                            <span className="text-rose-400 font-bold shrink-0">[!]</span>
                            <span className="leading-relaxed">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Resolution Verdict */}
                  <div className="pt-3 border-t border-slate-800/80 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-indigo-300 block mb-1">
                      {isFa ? 'نتیجه‌گیری و سنتز علمی ساب‌ایجنت:' : 'Resolution & Synthesis Verdict:'}
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {isFa ? agent.resolutionVerdictFa : agent.resolutionVerdictEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dialectical Synthesis Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isFa ? 'سنتز دیالکتیکی ایموزورو: حل مساله در قالب پارادایم معلم-شاگرد (Teacher-Student)' : 'Dialectical Synthesis: Teacher-Student Causal Amortization Paradigm'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {isFa
                ? 'تحقیق عمیق ایموزورو نشان داد که هیچ تضادی میان نظریه اطلاعات و سرعت محاسباتی وجود ندارد: اوراکل Future-KL به عنوان "معلم ممتاز آفلاین" (Offline Privileged Teacher) حد بالای تجربی و برچسب‌های دقیق سودمندی توکن را برای دیتاست‌ها تولید می‌کند (حل چالش ساب‌ایجنت الف). سپس یک مدل سبک BiLSTM یا MLP در مرحله پیش‌تکمیل به عنوان "شاگرد برخط" (Online Student) این اهمیت را با همبستگی رتبه‌ای ρ = 0.750 بدون هیچ تاخیری تقلید می‌نماید (حل چالش ساب‌ایجنت ب و اعتبارسنجی F9).'
                : 'Imozuru synthesis resolves the tension: Future-KL serves as the privileged offline Teacher establishing theoretical ground-truth bounds (Subagent α), which is distilled into an amortized single-pass prefill Student (Subagent β, validated in Finding F9 with Spearman rho = 0.750).'}
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Verbatim Primary Extracts */}
      {activeSubTab === 'extracts' && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium shrink-0">
                {isFa ? 'فیلتر بر اساس مقاله:' : 'Filter by Source Paper:'}
              </span>
              <select
                value={selectedPaperFilter}
                onChange={(e) => setSelectedPaperFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">{isFa ? 'تمامی مقالات اصلی (All 7 Papers)' : 'All Primary Papers'}</option>
                {IMOZURU_CITATIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.title.slice(0, 45)}... ({p.year})</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFa ? 'جستجو در نقل‌قول‌ها، معادلات، شواهد...' : 'Search verbatim text, equations...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Extracts Feed */}
          <div className="space-y-4">
            {filteredExtracts.map((ext) => {
              const paper = IMOZURU_CITATIONS.find((p) => p.id === ext.paperId);
              return (
                <div
                  key={ext.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 shadow-sm hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {ext.claimId}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {paper?.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({paper?.authors[0]} et al., {paper?.year} • {paper?.venue})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">
                        {ext.section}
                      </span>
                      {paper?.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
                          title="Open paper arXiv link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleCopy(ext.verbatimQuote, ext.id)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Copy verbatim quote"
                      >
                        {copiedId === ext.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Verbatim Quote Box */}
                  <blockquote className="rounded-xl bg-slate-950 border-r-4 rtl:border-r-4 rtl:border-l-0 border-l-4 border-indigo-500 p-4 text-xs font-mono text-slate-200 leading-relaxed italic">
                    &quot;{ext.verbatimQuote}&quot;
                  </blockquote>

                  {/* Contextual Significance & Vine Lead */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-emerald-300 block">
                        {isFa ? 'تطابق با یافته رساله دکتری:' : 'Supported Doctoral Claim:'}
                      </span>
                      <p className="text-slate-300">
                        {isFa ? ext.claimSummaryFa : ext.claimSummaryEn}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-amber-300 block">
                        {isFa ? 'سرنخ ساقه ایموزورو (Imozuru Vine Lead):' : 'Imozuru Vine Lead:'}
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {ext.imozuruVineLead}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Concept Vine & Topic Map (map.md) */}
      {activeSubTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Concept Nodes List (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                {isFa ? 'ساقه مفاهیم ایموزورو (Topic Map)' : 'Imozuru Concept Tree'}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {IMOZURU_CONCEPTS.length} Nodes
              </span>
            </div>

            <div className="space-y-2">
              {IMOZURU_CONCEPTS.map((concept) => {
                const isSelected = selectedConcept.id === concept.id;
                return (
                  <button
                    key={concept.id}
                    onClick={() => setSelectedConcept(concept)}
                    className={`w-full text-left rtl:text-right p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold font-sans">
                        {isFa ? concept.termFa : concept.termEn}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {concept.termEn}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                      {concept.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Concept Deep Dive (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-6 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {selectedConcept.category}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2">
                {isFa ? selectedConcept.termFa : selectedConcept.termEn}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {selectedConcept.termEn}
              </p>
            </div>

            {/* Definition */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5 text-xs">
              <span className="font-bold text-slate-300 block">
                {isFa ? 'تعریف فنی دقیق:' : 'Precise Technical Definition:'}
              </span>
              <p className="text-slate-300 leading-relaxed">
                {isFa ? selectedConcept.definitionFa : selectedConcept.definitionEn}
              </p>
            </div>

            {/* Primary Source Reference */}
            {(() => {
              const origPaper = IMOZURU_CITATIONS.find((p) => p.id === selectedConcept.originPaperId);
              return origPaper ? (
                <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/30 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">
                      {isFa ? 'منبع اصلی مفهوم (Primary Origin):' : 'Primary Origin Paper:'}
                    </span>
                    {origPaper.url && (
                      <a
                        href={origPaper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                      >
                        <span>arXiv:{origPaper.arxivId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <h5 className="font-semibold text-white">{origPaper.title}</h5>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {origPaper.authors.join(', ')} ({origPaper.year}) • {origPaper.venue}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Supported Findings & Connected Concepts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-1.5">
                <span className="font-semibold text-slate-300 block">
                  {isFa ? 'یافته‌های تجربی تاییدشده (F1-F13):' : 'Supported Findings (F1-F13):'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedConcept.supportedFindings.map((fId) => (
                    <span key={fId} className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {fId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-1.5">
                <span className="font-semibold text-slate-300 block">
                  {isFa ? 'پژوهشگران کلیدی:' : 'Key Primary Researchers:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedConcept.keyResearchers.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] font-sans bg-slate-800 text-slate-300">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Export Dossier */}
      {activeSubTab === 'export' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              {isFa ? 'استخراج بسته کامل پرونده پژوهشی ایموزورو (Imozuru Archive)' : 'Export Full Imozuru Research Dossier'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isFa
                ? 'این پکیج شامل نقشه کامل موضوعی (map.md)، لاگ ردیابی پیوندها (log.md)، نقل‌قول‌های دقیق ساختاریافته (extracts.json)، و گزارش مستقل HTML است که می‌توانید آن را مستقیماً به عنوان ضمیمه متدولوژی به اساتید راهنما ارائه دهید.'
                : 'Contains the complete research graph (map.md), citation log (log.md), verified extracts (extracts.json), and standalone report.html.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                  Markdown Dossier
                </span>
                <h4 className="text-sm font-bold text-white mt-2">imozuru_futurekl_dossier.md</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isFa ? 'فایل یکپارچه متنی با فرمت استاندارد گیت‌هاب و مقالات.' : 'Full unified markdown dossier with citations and subagent findings.'}
                </p>
              </div>
              <button
                onClick={() => handleExportDossier('markdown')}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isFa ? 'دانلود فایل Markdown' : 'Download Markdown'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                  Structured JSON
                </span>
                <h4 className="text-sm font-bold text-white mt-2">imozuru_extracts.json</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isFa ? 'داده‌های ساختاریافته JSON سازگار با ابزارهای مدیریت استناد و OpenAlex.' : 'Structured JSON extracts with section and equation metadata.'}
                </p>
              </div>
              <button
                onClick={() => handleExportDossier('json')}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isFa ? 'دانلود فایل JSON' : 'Download JSON'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                  Interactive HTML Report
                </span>
                <h4 className="text-sm font-bold text-white mt-2">imozuru_report.html</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isFa ? 'گزارش مستقل قابل باز شدن در مرورگر با نقل‌قول‌های دقیق برای تصمیم‌گیری شخصی.' : 'Standalone HTML report for self-inspection and committee evaluation.'}
                </p>
              </div>
              <button
                onClick={() => handleExportDossier('html')}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isFa ? 'دانلود گزارش HTML' : 'Download HTML Report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
