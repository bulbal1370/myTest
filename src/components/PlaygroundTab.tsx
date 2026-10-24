import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Settings2, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  Zap,
  Target,
  ArrowRightLeft,
  Brain,
  Wrench,
  AlignLeft,
  FileCode,
  Flame,
  ArrowRight,
  Database,
  BarChart2,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BENCHMARK_DATASETS } from '../data/datasets';
import { runFutureKlSimulation } from '../utils/futureKlEngine';
import { 
  InterventionScheme, 
  DivergenceMetric, 
  NormalizationMethod, 
  TokenItem,
  AccessibilitySettings,
  HFModelConfig,
  PromptSample
} from '../types';
import { getAccessibleTokenStyle, getChartPalette } from '../utils/accessibility';
import { ConceptTooltip } from './ConceptTooltip';

interface PlaygroundTabProps {
  lang: 'fa' | 'en';
  accessibility: AccessibilitySettings;
  activeModel: HFModelConfig;
  onOpenModelManager: () => void;
  // Shared state with Tab 2
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  isCustom: boolean;
  setIsCustom: (v: boolean) => void;
  customPromptText: string;
  setCustomPromptText: (t: string) => void;
  customReferenceY: string;
  setCustomReferenceY: (t: string) => void;
  customHasThinking: boolean;
  setCustomHasThinking: (v: boolean) => void;
  customHasTools: boolean;
  setCustomHasTools: (v: boolean) => void;
  mHorizon: number;
  setMHorizon: (m: number) => void;
  budgetPercent: number;
  setBudgetPercent: (b: number) => void;
  intervention: InterventionScheme;
  setIntervention: (i: InterventionScheme) => void;
  metric: DivergenceMetric;
  setMetric: (m: DivergenceMetric) => void;
  normalization: NormalizationMethod;
  setNormalization: (n: NormalizationMethod) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  sinkCount: number;
  setSinkCount: (s: number) => void;
  onGoToComparativeBenchmark: () => void;
  onGoToArchitecture: () => void;
  onGoToGeneration?: () => void;
  datasetList?: PromptSample[];
  onOpenDatasetManager?: () => void;
}

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({ 
  lang, 
  accessibility,
  activeModel,
  onOpenModelManager,
  selectedDatasetId,
  setSelectedDatasetId,
  isCustom,
  setIsCustom,
  customPromptText,
  setCustomPromptText,
  customReferenceY,
  setCustomReferenceY,
  customHasThinking,
  setCustomHasThinking,
  customHasTools,
  setCustomHasTools,
  mHorizon,
  setMHorizon,
  budgetPercent,
  setBudgetPercent,
  intervention,
  setIntervention,
  metric,
  setMetric,
  normalization,
  setNormalization,
  temperature,
  setTemperature,
  sinkCount,
  setSinkCount,
  onGoToComparativeBenchmark,
  onGoToArchitecture,
  onGoToGeneration,
  datasetList,
  onOpenDatasetManager
}) => {
  const isFa = lang === 'fa';

  // Filters for datasets
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [lengthFilter, setLengthFilter] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);

  const availableDatasets = datasetList || BENCHMARK_DATASETS;

  // Filtered dataset list
  const filteredDatasets = useMemo(() => {
    return availableDatasets.filter(d => {
      if (taskFilter === 'math_think' && !(d.category === 'math_hard_think' && d.hasThinking)) return false;
      if (taskFilter === 'math_direct' && !(d.category === 'math_hard_think' && !d.hasThinking)) return false;
      if (taskFilter === 'tool_call' && d.category !== 'tool_call') return false;
      if (taskFilter === 'persian_fertility' && d.category !== 'persian_fertility') return false;
      if (taskFilter === 'synth_niah' && d.category !== 'synth_niah') return false;
      if (taskFilter === 'qa_short' && d.category !== 'qa_short') return false;
      if (taskFilter === 'chat_multiturn' && d.category !== 'chat_multiturn') return false;
      if (taskFilter === 'code' && d.category !== 'code') return false;

      if (lengthFilter !== 'all' && d.lengthType !== lengthFilter) return false;
      if (langFilter !== 'all' && d.language !== langFilter) return false;

      return true;
    });
  }, [availableDatasets, taskFilter, lengthFilter, langFilter]);

  // Active prompt sample
  const activePrompt: PromptSample = useMemo(() => {
    if (isCustom && customPromptText.trim()) {
      const isPersian = /[\u0600-\u06FF]/.test(customPromptText);
      return {
        id: 'custom_input',
        title: isFa ? 'داده ورودی سفارشی شما' : 'Your Custom Input Data',
        titleFa: 'داده ورودی سفارشی شما',
        category: 'custom',
        language: isPersian ? 'fa' : 'en',
        lengthType: customPromptText.length > 500 ? 'long' : customPromptText.length > 150 ? 'medium' : 'short',
        approxTokenCount: Math.round(customPromptText.split(/\s+/).length * (isPersian ? 1.8 : 1.2)),
        prompt: customPromptText,
        fixedContinuation: customReferenceY.trim() || (isFa ? 'پاسخ استنتاجی مرجع برای محاسبه واگرایی توزیع احتمال.' : 'Reference teacher-forced continuation for divergence computation.'),
        evidenceIndices: [0, 1, 2],
        needle: isFa ? 'مهم' : 'key',
        hasThinking: customHasThinking,
        hasTools: customHasTools,
        description: isFa ? 'ورودی سفارشی تعاملی برای تست ایده بر روی جملات و فرضیه‌های دلخواه شما.' : 'Custom interactive input for testing on arbitrary sentences.'
      };
    }
    return availableDatasets.find(p => p.id === selectedDatasetId) || availableDatasets[0];
  }, [availableDatasets, selectedDatasetId, isCustom, customPromptText, customReferenceY, customHasThinking, customHasTools, isFa]);

  // Run simulation of the core idea
  const simulationResult = useMemo(() => {
    return runFutureKlSimulation(
      activePrompt,
      intervention,
      metric,
      normalization,
      mHorizon,
      budgetPercent,
      sinkCount,
      activeModel,
      temperature
    );
  }, [activePrompt, intervention, metric, normalization, mHorizon, budgetPercent, sinkCount, activeModel, temperature]);

  // Horizon Divergence Chart Data (D_k curve over k = 0 ... m-1)
  const chartData = useMemo(() => {
    const data = [];
    const stepInterval = Math.max(1, Math.floor(simulationResult.m_eff / 24));
    
    for (let k = 0; k < simulationResult.m_eff; k += stepInterval) {
      let evidenceDiv = 0;
      let evidenceCount = 0;
      let sinkDiv = 0;
      let sinkCountActual = 0;
      let backgroundDiv = 0;
      let backgroundCount = 0;

      simulationResult.tokens.forEach((token, idx) => {
        const val = simulationResult.divergenceMatrix[idx]?.[k] || 0;
        if (token.isEvidence) {
          evidenceDiv += val;
          evidenceCount++;
        } else if (token.isSink) {
          sinkDiv += val;
          sinkCountActual++;
        } else {
          backgroundDiv += val;
          backgroundCount++;
        }
      });

      data.push({
        step: `k=${k + 1}`,
        evidence: evidenceCount ? Number((evidenceDiv / evidenceCount).toFixed(4)) : 0,
        sink: sinkCountActual ? Number((sinkDiv / sinkCountActual).toFixed(4)) : 0,
        background: backgroundCount ? Number((backgroundDiv / backgroundCount).toFixed(4)) : 0,
      });
    }
    return data;
  }, [simulationResult]);

  const chartPalette = getChartPalette(accessibility.mode);

  return (
    <div className="space-y-6">
      {/* Top Banner: Core Idea Formulation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {isFa 
                  ? 'تب ۱: ارزیابی و رفتار ایده Future-KL در انزوا (Idea6 Oracle)' 
                  : 'Tab 1: Future-KL Causal Token Utility in Isolation (Idea6 Oracle)'}
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-semibold">
                {"S(i) = Σ D_KL(P_k ‖ P_{k\\i})"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              {isFa
                ? 'در این تب، رفتار ایده شما به‌طور مستقل بر روی انواع مختلف داده (استدلال ریاضی با/بدون زنجیره تفکر، فراخوانی ابزار JSON، زبان فارسی و انگلیسی، طول‌های مختلف جمله، و ورودی‌های سفارشی) تحلیل می‌شود. پارامترهای افق آینده m (از ۵ تا ۵۰۰)، بودجه α، نوع مداخله، و دما کاملاً قابل تنظیم هستند.'
                : 'Evaluate your core Future-KL causal oracle in isolation across diverse datasets (reasoning with/without thinking chains, tool-calling schemas, Persian subtoken fertility, short/medium/long texts, and custom inputs). Tune the future horizon m (5-500), budget, intervention semantics, and temperature.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onGoToGeneration && (
              <button
                onClick={onGoToGeneration}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all border border-emerald-400/40"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{isFa ? 'سنجش متن تولیدی مدل' : 'Evaluate Generated Text'}</span>
              </button>
            )}
            <button
              onClick={onGoToArchitecture}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all border border-cyan-500/40"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'کاوشگر KV Cache و اتنشن (GQA / لایه‌ها)' : 'Inspect KV Cache & Attention'}</span>
            </button>
            <button
              onClick={onGoToComparativeBenchmark}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer transition-all border border-indigo-400/40"
            >
              <span>{isFa ? 'مقایسه همین داده با ۲۲ روش مقالات (تب ۲)' : 'Compare on 22 SOTA Methods (Tab 2)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Dataset Selector (Left) vs Real-Time Visualization (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Selection & Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Active Model Pill & Quick Switcher */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {isFa ? 'مدل زبانی بارگذاری‌شده' : 'Active LLM Architecture'}
                </span>
              </div>
              <button
                onClick={onOpenModelManager}
                className="text-[11px] px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition cursor-pointer"
              >
                {isFa ? 'مدیریت و بارگذاری مدل هاگینگ‌فیس' : 'HF Models Manager'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-xs font-mono font-bold text-white">{activeModel.name}</p>
                <p className="text-[11px] text-slate-400">
                  {activeModel.paramSize} • {activeModel.attentionType} ({activeModel.numKvHeads} KV heads) • Context {activeModel.contextLength}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-300 font-bold">
                  {activeModel.persianFertility} tok/w FA
                </span>
              </div>
            </div>
          </div>

          {/* Dataset & Objective Selection Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {isFa ? 'انتخاب دیتاست و نوع سناریو' : 'Dataset & Task Scenario'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {onOpenDatasetManager && (
                  <button
                    onClick={onOpenDatasetManager}
                    className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 transition cursor-pointer flex items-center gap-1 shadow-sm"
                    title={isFa ? 'بارگذاری یا جستجوی دیتاست جدید از Hugging Face' : 'Import or search any Hugging Face dataset'}
                  >
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isFa ? '+ دیتاست از هاگینگ‌فیس' : '+ HF Dataset'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsCustom(false)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    !isCustom 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isFa ? 'دیتاست‌ها' : 'Presets'}
                </button>
                <button
                  onClick={() => setIsCustom(true)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    isCustom 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isFa ? 'سفارشی' : 'Custom'}
                </button>
              </div>
            </div>

            {/* Quick Feature Injection: Reasoning & Tool Calling */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={() => setCustomHasThinking(!customHasThinking)}
                className={`flex-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  customHasThinking
                    ? 'bg-purple-950/70 border-purple-500 text-purple-200 ring-1 ring-purple-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>{isFa ? 'حالت استدلال (<thinking>)' : 'Reasoning Mode'}</span>
                <span className="text-[10px] font-mono opacity-80">{customHasThinking ? '[ON]' : '[OFF]'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomHasTools(!customHasTools)}
                className={`flex-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  customHasTools
                    ? 'bg-blue-950/70 border-blue-500 text-blue-200 ring-1 ring-blue-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span>{isFa ? 'فراخوانی ابزار (Tool-Calling)' : 'Tool-Calling JSON'}</span>
                <span className="text-[10px] font-mono opacity-80">{customHasTools ? '[ON]' : '[OFF]'}</span>
              </button>
            </div>

            {!isCustom ? (
              <div className="space-y-3">
                {/* Filter Controls */}
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">{isFa ? 'نوع تسک:' : 'Task:'}</span>
                    {[
                      { id: 'all', label: isFa ? 'همه' : 'All' },
                      { id: 'math_think', label: isFa ? 'ریاضی با Thinking' : 'Math (Thinking)' },
                      { id: 'math_direct', label: isFa ? 'ریاضی بدون Thinking' : 'Math (Direct)' },
                      { id: 'tool_call', label: isFa ? 'فراخوانی ابزار' : 'Tool Calling' },
                      { id: 'persian_fertility', label: isFa ? 'شکست بایت‌توکن' : 'Persian Fertility' },
                      { id: 'synth_niah', label: isFa ? 'بازیابی طولانی NIAH' : 'Long NIAH' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTaskFilter(f.id)}
                        className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition ${
                          taskFilter === f.id
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{isFa ? 'طول:' : 'Length:'}</span>
                      {['all', 'short', 'medium', 'long'].map(l => (
                        <button
                          key={l}
                          onClick={() => setLengthFilter(l)}
                          className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                            lengthFilter === l ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {l === 'all' ? (isFa ? 'همه' : 'All') : l}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{isFa ? 'زبان:' : 'Lang:'}</span>
                      {['all', 'fa', 'en'].map(lg => (
                        <button
                          key={lg}
                          onClick={() => setLangFilter(lg)}
                          className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                            langFilter === lg ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lg === 'all' ? (isFa ? 'همه' : 'All') : lg.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preset List Selection */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredDatasets.map(dataset => (
                    <div
                      key={dataset.id}
                      onClick={() => setSelectedDatasetId(dataset.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedDatasetId === dataset.id
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-white text-xs">
                          {isFa ? dataset.titleFa : dataset.title}
                        </span>
                        <div className="flex items-center gap-1">
                          {dataset.hasThinking && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300 text-[9px] font-bold">
                              🧠 Thinking
                            </span>
                          )}
                          {dataset.hasTools && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 text-[9px] font-bold">
                              🔧 Tool
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                            {dataset.language.toUpperCase()}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
                            ~{dataset.approxTokenCount}t
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {dataset.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Input Box */
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-300 font-semibold">
                      {isFa ? 'متن پرامپت یا جمله ورودی:' : 'Prompt or Input Sentence:'}
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        onClick={() => {
                          setCustomPromptText('اگر سرعت اولیه v0 = 30 متر بر ثانیه و شتاب منفی a = -4 باشد، سرعت بعد از 5 ثانیه چیست؟ لطفاً گام به گام در زنجیره تفکر حل کنید.');
                          setCustomReferenceY('<thinking>۱. v = v0 + at = 30 + (-4)*5 = 30 - 20 = 10.</thinking> سرعت برابر ۱۰ متر بر ثانیه است.');
                          setCustomHasThinking(true);
                          setCustomHasTools(false);
                        }}
                        className="text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isFa ? 'نمونه ریاضی' : 'Math Example'}
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        onClick={() => {
                          setCustomPromptText('اجرای تابع transfer_money با مبلغ 5000000 ریال و شماره شبا IR1234567890 به نام علی رضایی.');
                          setCustomReferenceY('{"tool": "transfer_money", "parameters": {"amount": 5000000, "iban": "IR1234567890", "recipient": "علی رضایی"}}');
                          setCustomHasThinking(false);
                          setCustomHasTools(true);
                        }}
                        className="text-indigo-400 hover:underline cursor-pointer"
                      >
                        {isFa ? 'نمونه ابزار' : 'Tool Example'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={customPromptText}
                    onChange={(e) => setCustomPromptText(e.target.value)}
                    placeholder={isFa ? 'جمله یا پاراگراف مورد نظر خود را اینجا بنویسید یا کپی کنید...' : 'Enter your custom sentence or prompt...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    {isFa ? 'دنباله خروجی مرجع Y (برای محاسبه Future-KL):' : 'Reference Continuation Y:'}
                  </label>
                  <input
                    type="text"
                    value={customReferenceY}
                    onChange={(e) => setCustomReferenceY(e.target.value)}
                    placeholder={isFa ? 'پاسخ مدل یا زنجیره تولید مرجع...' : 'Reference output continuation tokens...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customHasThinking}
                      onChange={(e) => setCustomHasThinking(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <ConceptTooltip term="thinking_chain">
                      <span>{isFa ? 'دارای زنجیره تفکر (<thinking>)' : 'Contains Thinking Chain'}</span>
                    </ConceptTooltip>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customHasTools}
                      onChange={(e) => setCustomHasTools(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                    <ConceptTooltip term="tool_calling">
                      <span>{isFa ? 'فراخوانی ابزار JSON' : 'Tool-Calling JSON'}</span>
                    </ConceptTooltip>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Hyperparameters Config Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                <ConceptTooltip term="future_kl">
                  <span>{isFa ? 'پارامترهای محاسباتی اوراکل Future-KL' : 'Future-KL Hyperparameters'}</span>
                </ConceptTooltip>
              </h3>
            </div>

            {/* Configurable m Horizon (Slider + Numeric Box + Quick Presets) */}
            <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ConceptTooltip term="future_kl">
                      <span>{isFa ? 'افق پیش‌بینی آینده (m)' : 'Future Horizon (m)'}</span>
                    </ConceptTooltip>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold">
                      [5 ... 500 tokens]
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    {isFa ? 'تعداد گام‌های پیش‌بینی شده در دنباله خروجی Y' : 'Number of future output tokens in continuation Y'}
                  </p>
                </div>
                {/* Direct Number Input */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={mHorizon}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 5;
                      setMHorizon(Math.max(5, Math.min(val, 500)));
                    }}
                    className="w-16 bg-slate-900 border border-indigo-500/60 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <span className="text-xs text-slate-400 font-mono">tokens</span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={mHorizon}
                onChange={(e) => setMHorizon(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              {/* Quick Presets for m */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500">{isFa ? 'پیش‌فرض‌ها:' : 'Presets:'}</span>
                {[
                  { m: 15, label: 'm=15 (سریع)' },
                  { m: 50, label: 'm=50 (استاندارد)' },
                  { m: 128, label: 'm=128 (تفکر میانی)' },
                  { m: 256, label: 'm=256 (استدلال عمیق)' },
                  { m: 500, label: 'm=500 (حداکثر)' }
                ].map(p => (
                  <button
                    key={p.m}
                    onClick={() => setMHorizon(p.m)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                      mHorizon === p.m 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Retention Budget (Alpha %) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-medium">
                  <ConceptTooltip term="kv_cache">
                    <span>{isFa ? 'بودجه نگه‌داری حافظه (α %):' : 'KV Retention Budget (α %):'}</span>
                  </ConceptTooltip>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={80}
                    value={budgetPercent}
                    onChange={(e) => setBudgetPercent(Math.max(5, Math.min(parseInt(e.target.value) || 5, 80)))}
                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-xs text-white"
                  />
                  <span className="font-mono text-emerald-400 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={5}
                value={budgetPercent}
                onChange={(e) => setBudgetPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (فوق فشرده)</span>
                <span>20% (استاندارد مقاله)</span>
                <span>50% (نصف حافظه)</span>
                <span>80%</span>
              </div>
            </div>

            {/* Softmax Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-medium">
                  <ConceptTooltip term="softmax">
                    <span>{isFa ? 'دمای کالیبراسیون سافت‌مکس (τ):' : 'Softmax Temperature (τ):'}</span>
                  </ConceptTooltip>
                </label>
                <span className="font-mono text-amber-400 font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Sink Count & Normalization */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  <ConceptTooltip term="attention_sink">
                    <span>{isFa ? 'توکن‌های سینک (Sinks):' : 'Attention Sinks:'}</span>
                  </ConceptTooltip>
                </label>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 4, 8].map(s => (
                    <button
                      key={s}
                      onClick={() => setSinkCount(s)}
                      className={`flex-1 py-1 text-xs rounded font-mono transition cursor-pointer ${
                        sinkCount === s
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  {isFa ? 'نرمال‌سازی امتیاز:' : 'Score Normalization:'}
                </label>
                <select
                  value={normalization}
                  onChange={(e) => setNormalization(e.target.value as NormalizationMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="max">Max Div (val / max)</option>
                  <option value="minmax">MinMax (0-1)</option>
                  <option value="softmax">Softmax(T)</option>
                  <option value="zscore">Z-Score</option>
                </select>
              </div>
            </div>

            {/* Intervention Scheme Selector (Highlighting Intervention Mismatch) */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{isFa ? 'معناشناسی مداخله (Intervention):' : 'Intervention Semantics:'}</span>
                </label>
                <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 font-bold">
                  {intervention === 'evict' ? '✓ اوراکل معتبر (F2)' : '⚠ ناسازگار با کش (F3)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIntervention('evict')}
                  className={`p-2 rounded-xl border text-right cursor-pointer transition ${
                    intervention === 'evict'
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{isFa ? 'تخلیه کش KV (Evict Mask)' : 'KV Evict (Zero-Mask)'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {isFa ? 'اوراکل حقیقی و بیتی کش؛ بدون نشتی گرادیان' : 'True bit-faithful KV cache oracle'}
                  </p>
                </button>

                <button
                  onClick={() => setIntervention('remove')}
                  className={`p-2 rounded-xl border text-right cursor-pointer transition ${
                    intervention === 'remove'
                      ? 'bg-red-950/50 border-red-500 text-red-200 ring-1 ring-red-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{isFa ? 'حذف فیزیکی توکن (Remove)' : 'Prompt Token Deletion'}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {isFa ? 'گسست مداخله (F3): همبستگی با کش ρ=0.012' : 'Intervention mismatch disconnect'}
                  </p>
                </button>
              </div>
            </div>

            {/* Metric Selector */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{isFa ? 'معیار واگرایی:' : 'Divergence Metric:'}</span>
              <div className="flex items-center gap-1 font-mono">
                {(['kl', 'reverse_kl', 'jsd'] as DivergenceMetric[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      metric === m ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'kl' ? 'KL(P‖Q)' : m === 'reverse_kl' ? 'Rev-KL' : 'JSD'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Visual Outputs of the Idea in Isolation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Performance & Evaluation Summary Card for the Idea */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isFa ? 'سنجش کارایی ایده Future-KL روی این داده' : 'Future-KL Efficacy on Selected Task'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {simulationResult.runtimeMs}ms computation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'بازیابی شواهد کلیدی' : 'Evidence Recall'}</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {(simulationResult.evidenceRecall * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {isFa ? 'توکن‌های هدف حفظ شده' : 'Critical needles kept'}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'واگرایی Future-KL' : 'Estimated Future-KL'}</span>
                <span className="text-xl font-black font-mono text-indigo-300">
                  {simulationResult.estimatedFutureKl.toFixed(4)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {isFa ? 'کمتر = حفظ توزیع بهتر' : 'Lower is better'}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'افت لگاریتم درست‌نمایی' : 'ΔNLL Loss'}</span>
                <span className="text-xl font-black font-mono text-amber-400">
                  +{simulationResult.estimatedDeltaNll.toFixed(3)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {isFa ? 'تخریب پاسخ مدل' : 'Degradation margin'}
                </span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">{isFa ? 'صرفه‌جویی حافظه KV' : 'VRAM Saved'}</span>
                <span className="text-xl font-black font-mono text-cyan-400">
                  {((1 - simulationResult.budgetRatio) * 100).toFixed(0)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {simulationResult.retainedCount} / {simulationResult.totalTokens} tokens
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Token Importance Map */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{isFa ? 'نقشه توکن‌ها و امتیاز اهمیت علّی Future-KL' : 'Token Importance Heatmap'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isFa 
                    ? 'روی هر توکن کلیک کنید تا رفتار و سهم واگرایی آن را در طول افق آینده مشاهده کنید.' 
                    : 'Click any token to inspect its step-by-step future trajectory.'}
                </p>
              </div>

              {/* Accessible Legend with Shapes */}
              <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  <span>[✓]</span>
                  <span>{isFa ? 'حفظ در بودجه' : 'Retained'}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                  <span>[✗]</span>
                  <span>{isFa ? 'تخلیه شده' : 'Evicted'}</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">
                  <span>[🎯]</span>
                  <span>{isFa ? 'شواهد کلیدی' : 'Evidence'}</span>
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-purple-500/40">
                  <span>[★]</span>
                  <span>{isFa ? 'سینک توجه' : 'Sink'}</span>
                </span>
              </div>
            </div>

            {/* Token Flow Display */}
            <div 
              className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 min-h-[140px] max-h-72 overflow-y-auto flex flex-wrap gap-1.5 items-center leading-relaxed custom-scrollbar"
              dir={activePrompt.language === 'fa' ? 'rtl' : 'ltr'}
            >
              {simulationResult.tokens.map((token) => {
                const isRetained = token.isRetainedByMethod.idea6_oracle;
                const isSelected = selectedToken?.id === token.id;
                const tokenA11y = getAccessibleTokenStyle(
                  isRetained,
                  token.isEvidence,
                  token.isSink,
                  isSelected,
                  accessibility.mode,
                  accessibility.showSymbols
                );

                return (
                  <button
                    key={token.id}
                    onClick={() => setSelectedToken(token)}
                    className={`px-2 py-1 rounded-md text-xs font-mono transition-all transform cursor-pointer relative group flex items-center gap-1 ${tokenA11y.containerClass}`}
                  >
                    {/* Accessibility Shape Badge */}
                    <span className="text-[10px] font-bold opacity-90 select-none">
                      {tokenA11y.symbol}
                    </span>
                    <span>{token.text}</span>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-slate-900 text-white text-[10px] p-2 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap pointer-events-none">
                      <p className="font-bold">ID: {token.id} • "{token.text}"</p>
                      <p className="text-slate-300">Importance: {token.normalizedImportance.toFixed(4)}</p>
                      <p className="text-slate-300">Sum D_KL: {token.divergenceSum.toFixed(4)}</p>
                      <p className={isRetained ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                        Status: {isRetained ? 'Retained in KV' : 'Evicted'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Token Inspector Drawer */}
            {selectedToken && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700 text-xs font-bold">
                      Token #{selectedToken.id}: "{selectedToken.text}"
                    </span>
                    <span className="text-slate-400">
                      {selectedToken.isEvidence ? (isFa ? '🎯 توکن مدرک/سوزن' : '🎯 Evidence Needle') : selectedToken.isSink ? (isFa ? '★ توکن سینک' : '★ Sink') : (isFa ? 'توکن زمینه' : 'Background')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isFa ? 'مجموع واگرایی کل افق:' : 'Cumulative Divergence:'}{' '}
                    <span className="font-mono font-bold text-white">{selectedToken.divergenceSum.toFixed(4)}</span> |{' '}
                    {isFa ? 'امتیاز نرمال‌شده:' : 'Normalized Score:'}{' '}
                    <span className="font-mono font-bold text-emerald-400">{selectedToken.normalizedImportance.toFixed(4)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    selectedToken.isRetainedByMethod.idea6_oracle
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    {selectedToken.isRetainedByMethod.idea6_oracle ? (isFa ? '✓ حفظ در حافظه' : '✓ Retained') : (isFa ? '✗ تخلیه شده' : '✗ Evicted')}
                  </span>
                  <button
                    onClick={() => setSelectedToken(null)}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {isFa ? 'بستن' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2D Divergence Matrix Heatmap D[i, k] */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>{isFa ? 'ماتریس دوبعدی واگرایی D[i, k] (توکن‌های ورودی در برابر گام‌های آینده m)' : '2D Divergence Matrix Heatmap D[i, k]'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isFa
                    ? 'مشاهده کنید چگونه توکن‌های استدلال و شواهد در گام‌های آینده m اثر ماندگار دارند، در حالی که سینک‌ها در ابتدا شدید و سریع افت می‌کنند.'
                    : 'Observe how evidence tokens sustain future divergence across k in [1, m], whereas sinks peak early.'}
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                Matrix [{simulationResult.totalTokens} × {simulationResult.m_eff}]
              </span>
            </div>

            {/* Heatmap Grid preview (top 15 tokens across 16 sample future steps) */}
            <div className="overflow-x-auto">
              <div className="min-w-[500px] bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                {/* Header step markers */}
                <div className="flex items-center text-[9px] font-mono text-slate-500 pb-1 border-b border-slate-800">
                  <span className="w-24 shrink-0 text-slate-400">{isFa ? 'توکن i' : 'Token i'}</span>
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const stepK = Math.floor((idx / 11) * (simulationResult.m_eff - 1));
                    return (
                      <span key={idx} className="flex-1 text-center">
                        k={stepK + 1}
                      </span>
                    );
                  })}
                </div>

                {/* Rows for sample prompt tokens */}
                {simulationResult.tokens.slice(0, 14).map((token) => (
                  <div key={token.id} className="flex items-center text-[10px] font-mono py-0.5">
                    <span className="w-24 shrink-0 truncate text-slate-300 pr-1 flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">#{token.id}</span>
                      <span className="truncate">{token.text}</span>
                    </span>
                    <div className="flex-1 flex items-center gap-0.5">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const stepK = Math.floor((idx / 11) * (simulationResult.m_eff - 1));
                        const val = simulationResult.divergenceMatrix[token.id]?.[stepK] || 0;
                        const maxVal = 0.8;
                        const intensity = Math.min(1, val / maxVal);
                        
                        return (
                          <div
                            key={idx}
                            title={`Token: ${token.text} | Step k=${stepK + 1} | D_ik = ${val.toFixed(4)}`}
                            className="flex-1 h-5 rounded-xs transition-colors cursor-pointer hover:ring-1 hover:ring-white"
                            style={{
                              backgroundColor: intensity > 0.05
                                ? `rgba(99, 102, 241, ${Math.max(0.15, intensity)})`
                                : 'rgba(30, 41, 59, 0.4)'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Horizon Divergence Decay Curve Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{isFa ? 'منحنی زمانی واگرایی در افق آینده D(k)' : 'Future Horizon Divergence Dynamics D(k)'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isFa
                    ? 'مقایسه میانگین اثر علّی توکن‌های شواهد (Evidence)، سینک‌های توجه (Sink)، و زمینه (Background) در طول گام‌های آینده m'
                    : 'Evidence utility persists across reasoning steps, while sinks drop precipitously.'}
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="evidenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartPalette.evidence} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartPalette.evidence} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="sinkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartPalette.sink} stopOpacity={0.7}/>
                      <stop offset="95%" stopColor={chartPalette.sink} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="step" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="evidence" 
                    name={isFa ? 'توکن‌های شواهد/استدلال [🎯]' : 'Evidence/Reasoning [🎯]'} 
                    stroke={chartPalette.evidence} 
                    fillOpacity={1} 
                    fill="url(#evidenceGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sink" 
                    name={isFa ? 'سینک‌های اولیه [★]' : 'Attention Sinks [★]'} 
                    stroke={chartPalette.sink} 
                    fillOpacity={1} 
                    fill="url(#sinkGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="background" 
                    name={isFa ? 'توکن‌های زمینه [✗]' : 'Background [✗]'} 
                    stroke="#64748b" 
                    fillOpacity={1} 
                    fill="url(#bgGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
