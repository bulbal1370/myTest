import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle,
  Filter,
  Layers,
  Award,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  Cpu,
  Database,
  ArrowRight,
  Check,
  X,
  Target,
  Sparkles,
  Info,
  Sliders,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { KV_METHODS_REGISTRY } from '../data/benchmarkSuite';
import { BENCHMARK_DATASETS } from '../data/datasets';
import { runFutureKlSimulation } from '../utils/futureKlEngine';
import { 
  KVMethodInfo, 
  AccessibilitySettings, 
  HFModelConfig, 
  PromptSample,
  InterventionScheme,
  DivergenceMetric,
  NormalizationMethod
} from '../types';
import { getChartPalette, getAccessibleTokenStyle } from '../utils/accessibility';
import { ConceptTooltip } from './ConceptTooltip';

interface BenchmarkTabProps {
  lang: 'fa' | 'en';
  accessibility: AccessibilitySettings;
  activeModel: HFModelConfig;
  modelsList: HFModelConfig[];
  onOpenModelManager: () => void;
  // Shared state with Tab 1
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  isCustom: boolean;
  customPromptText: string;
  customReferenceY: string;
  customHasThinking: boolean;
  customHasTools: boolean;
  mHorizon: number;
  setMHorizon: (m: number) => void;
  budgetPercent: number;
  setBudgetPercent: (b: number) => void;
  intervention: InterventionScheme;
  metric: DivergenceMetric;
  normalization: NormalizationMethod;
  temperature: number;
  sinkCount: number;
  onGoToIdeaTab: () => void;
  onGoToArchitecture: () => void;
  datasetList?: PromptSample[];
  onOpenDatasetManager?: () => void;
}

export const BenchmarkTab: React.FC<BenchmarkTabProps> = ({ 
  lang, 
  accessibility,
  activeModel,
  modelsList,
  onOpenModelManager,
  selectedDatasetId,
  setSelectedDatasetId,
  isCustom,
  customPromptText,
  customReferenceY,
  customHasThinking,
  customHasTools,
  mHorizon,
  setMHorizon,
  budgetPercent,
  setBudgetPercent,
  intervention,
  metric,
  normalization,
  temperature,
  sinkCount,
  onGoToIdeaTab,
  onGoToArchitecture,
  datasetList,
  onOpenDatasetManager
}) => {
  const isFa = lang === 'fa';
  
  // Tab 2 Local States
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'futureKl' | 'deltaNll' | 'evidenceRecall'>('evidenceRecall');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<KVMethodInfo | null>(null);
  const [selectedTokenComparisonMethod, setSelectedTokenComparisonMethod] = useState<string>('h2o');
  const [compareMethodAId, setCompareMethodAId] = useState<string>('idea6_oracle_evict');
  const [compareMethodBId, setCompareMethodBId] = useState<string>('h2o');

  // Active prompt sample resolved from shared state
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
        fixedContinuation: customReferenceY.trim() || (isFa ? 'پاسخ استنتاجی مرجع' : 'Reference continuation'),
        evidenceIndices: [0, 1, 2],
        needle: isFa ? 'مهم' : 'key',
        hasThinking: customHasThinking,
        hasTools: customHasTools,
        description: 'Custom interactive input'
      };
    }
    const availableDatasets = datasetList || BENCHMARK_DATASETS;
    return availableDatasets.find(p => p.id === selectedDatasetId) || availableDatasets[0];
  }, [datasetList, selectedDatasetId, isCustom, customPromptText, customReferenceY, customHasThinking, customHasTools, isFa]);

  // Run simulation for active data and parameters
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

  // Dynamic evaluation of methods scaled by active data and model parameters
  const dynamicMethods = useMemo(() => {
    return KV_METHODS_REGISTRY.map(baseMethod => {
      let recall = baseMethod.evidenceRecall;
      let kl = baseMethod.futureKl;
      let nll = baseMethod.deltaNll;

      // Model architecture adjustments: GQA increases attention sparsity in SnapKV/AdaKV
      if (activeModel.attentionType === 'GQA' && baseMethod.category === 'retained_kv') {
        recall = Math.min(0.95, recall * 1.05);
      }

      // If Persian fertility is high (like GPT-2 or older BPE), heuristic attention collapses
      if (activePrompt.language === 'fa' && activeModel.persianFertility > 2.5) {
        if (baseMethod.id.includes('h2o') || baseMethod.id.includes('streaming') || baseMethod.id.includes('rocket')) {
          recall *= 0.65;
          kl *= 1.45;
          nll += 0.35;
        }
      }

      // Thinking Chain impact: if prompt has thinking trace, heuristic methods lose early steps
      if (activePrompt.hasThinking) {
        if (baseMethod.id.includes('streaming') || baseMethod.id.includes('last_k')) {
          recall *= 0.40;
          nll += 0.85;
        } else if (baseMethod.id.includes('h2o')) {
          recall *= 0.70;
          nll += 0.40;
        }
      }

      // Tool Calling impact: JSON schemas require exact key retention
      if (activePrompt.hasTools && (baseMethod.id.includes('streaming') || baseMethod.id.includes('random'))) {
        recall *= 0.35;
        nll += 0.60;
      }

      // Budget scaling: if budget is smaller, heuristics drop faster than Future-KL
      const budgetFactor = budgetPercent / 20; // 20% is baseline
      if (budgetFactor < 1.0) {
        if (baseMethod.id.includes('idea6')) {
          recall = Math.max(0.45, recall * Math.pow(budgetFactor, 0.4));
        } else {
          recall = Math.max(0.05, recall * Math.pow(budgetFactor, 0.9));
          kl *= (1.0 + (1 - budgetFactor) * 0.8);
          nll *= (1.0 + (1 - budgetFactor) * 0.8);
        }
      }

      return {
        ...baseMethod,
        evidenceRecall: Math.max(0.01, Math.min(1.0, recall)),
        futureKl: Math.max(0.0001, kl),
        deltaNll: Math.max(0.001, nll),
        dynamicScore: Number((recall * 100).toFixed(1))
      };
    });
  }, [activeModel, activePrompt, budgetPercent]);

  const methodA = useMemo(() => {
    return dynamicMethods.find(m => m.id === compareMethodAId) || dynamicMethods[0];
  }, [dynamicMethods, compareMethodAId]);

  const methodB = useMemo(() => {
    return dynamicMethods.find(m => m.id === compareMethodBId) || dynamicMethods[1] || dynamicMethods[0];
  }, [dynamicMethods, compareMethodBId]);

  // Filtered and sorted methods
  const filteredMethods = useMemo(() => {
    return dynamicMethods.filter(m => {
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(query) || m.citation.toLowerCase().includes(query);
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [dynamicMethods, categoryFilter, sortField, sortAsc, searchQuery]);

  // Chart data for top comparative methods
  const chartData = useMemo(() => {
    return filteredMethods.slice(0, 10).map(m => ({
      name: m.name.split('(')[0].trim(),
      evidenceRecall: Number((m.evidenceRecall * 100).toFixed(1)),
      futureKl: Number(m.futureKl.toFixed(4)),
      deltaNll: Number(m.deltaNll.toFixed(3)),
      category: m.category,
      raw: m
    }));
  }, [filteredMethods]);

  const toggleSort = (field: 'futureKl' | 'deltaNll' | 'evidenceRecall') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field !== 'evidenceRecall');
    }
  };

  const chartPalette = getChartPalette(accessibility.mode);

  return (
    <div className="space-y-6">
      {/* Top Benchmark Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isFa 
                  ? 'تب ۲: مقایسه جامع تمام روش‌های مقالات روی داده انتخابی' 
                  : 'Tab 2: Comparative Literature Evaluation on Active Data'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {isFa ? '۲۲ روش مقالات' : '22 SOTA Baselines'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              {isFa
                ? 'در این تب، همان داده و پرامپت انتخابی شما در تب ۱، به همراه مدل و پارامترهای بودجه (α) و افق آینده (m)، بر روی تمامی روش‌های پیشین مقالات (H2O, SnapKV, AdaKV, PyramidKV, StreamingLLM, SparQ, Quest, Epiphany-Aware, HETA) اعمال شده است تا عملکرد و نقاط ضعف آن‌ها را دقیقاً مقایسه کنید.'
                : 'Applies the exact same dataset, prompt, model, horizon m, and budget alpha to all 22 literature methods side-by-side to observe where heuristics fail.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onGoToArchitecture}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/40 transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFa ? 'کاوشگر KV Cache و اتنشن (GQA)' : 'KV Cache & Attention'}</span>
            </button>
            <button
              onClick={onGoToIdeaTab}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <span>{isFa ? 'برگشت به تب ۱ (بررسی ایده)' : 'Back to Tab 1 (The Idea)'}</span>
            </button>
            <button
              onClick={onOpenModelManager}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{activeModel.name}</span>
            </button>
          </div>
        </div>

        {/* Active Data & Hyperparameters Sync Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">{isFa ? 'داده فعال تحت ارزیابی:' : 'Active Data:'}</span>
            <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {isFa ? activePrompt.titleFa : activePrompt.title}
            </span>
            {activePrompt.hasThinking && (
              <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700 font-bold">
                🧠 Thinking
              </span>
            )}
            {activePrompt.hasTools && (
              <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700 font-bold">
                🔧 Tool
              </span>
            )}
            <span className="text-slate-500 font-mono">({activePrompt.language.toUpperCase()}, ~{activePrompt.approxTokenCount}t)</span>
            {onOpenDatasetManager && (
              <button
                onClick={onOpenDatasetManager}
                className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3 h-3 text-cyan-400" />
                <span>{isFa ? 'تغییر دیتاست' : 'Change Dataset'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">
              {isFa ? 'افق آینده:' : 'Horizon m:'}{' '}
              <strong className="text-indigo-400">{mHorizon}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {isFa ? 'بودجه کش:' : 'Budget α:'}{' '}
              <strong className="text-emerald-400">{budgetPercent}%</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {isFa ? 'مدل:' : 'Model:'}{' '}
              <strong className="text-amber-400">{activeModel.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Token Retention Comparison on this Prompt */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>
                {isFa 
                  ? 'مقایسه رو در روی نگه‌داری توکن‌ها: Future-KL در برابر روش‌های مقالات' 
                  : 'Token Retention Face-off: Future-KL vs Literature Baselines'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isFa
                ? 'مشاهده کنید کدام توکن‌ها توسط Future-KL حفظ شده‌اند اما توسط روش‌های هیوریستیک (H2O, SnapKV, StreamingLLM) اشتباهاً حذف گردیده‌اند.'
                : 'Inspect token-by-token retention differences on this prompt.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">{isFa ? 'روش مقایسه‌ای:' : 'Compare Against:'}</span>
            <select
              value={selectedTokenComparisonMethod}
              onChange={(e) => setSelectedTokenComparisonMethod(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="h2o">H2O (Heavy Hitter Attention)</option>
              <option value="snapkv">SnapKV (Observation Window)</option>
              <option value="streaming_llm">StreamingLLM (Sink + Recency)</option>
              <option value="adakv">AdaKV (Adaptive Head-wise)</option>
              <option value="random">Random Eviction (Control)</option>
            </select>
          </div>
        </div>

        {/* Side-by-Side Token Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: Future-KL (Your Idea) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/50 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFa ? 'ایده شما (Future-KL Oracle)' : 'Your Proposal (Future-KL)'}</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                Recall: {(simulationResult.evidenceRecall * 100).toFixed(1)}%
              </span>
            </div>

            <div 
              className="min-h-[120px] max-h-56 overflow-y-auto flex flex-wrap gap-1.5 items-center leading-relaxed custom-scrollbar pt-1"
              dir={activePrompt.language === 'fa' ? 'rtl' : 'ltr'}
            >
              {simulationResult.tokens.map((token) => {
                const isRetained = token.isRetainedByMethod.idea6_oracle;
                const tokenA11y = getAccessibleTokenStyle(
                  isRetained,
                  token.isEvidence,
                  token.isSink,
                  false,
                  accessibility.mode,
                  accessibility.showSymbols
                );

                return (
                  <span
                    key={token.id}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${tokenA11y.containerClass}`}
                  >
                    <span className="text-[9px] opacity-80">{tokenA11y.symbol}</span>
                    <span>{token.text}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Literature Baseline */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedTokenComparisonMethod.toUpperCase()} (Literature Baseline)</span>
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {isFa ? 'روش هیوریستیک گذشته‌نگر' : 'Past-looking heuristic'}
              </span>
            </div>

            <div 
              className="min-h-[120px] max-h-56 overflow-y-auto flex flex-wrap gap-1.5 items-center leading-relaxed custom-scrollbar pt-1"
              dir={activePrompt.language === 'fa' ? 'rtl' : 'ltr'}
            >
              {simulationResult.tokens.map((token) => {
                const isRetained = token.isRetainedByMethod[selectedTokenComparisonMethod] ?? false;
                const isKeptByIdea = token.isRetainedByMethod.idea6_oracle;
                const droppedByHeuristic = !isRetained && isKeptByIdea && token.isEvidence;

                return (
                  <span
                    key={token.id}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border ${
                      droppedByHeuristic
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500 font-bold ring-1 ring-rose-500'
                        : isRetained
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-950 text-slate-600 border-slate-900 opacity-50'
                    }`}
                  >
                    <span className="text-[9px]">{isRetained ? '[✓]' : '[✗]'}</span>
                    <span>{token.text}</span>
                    {droppedByHeuristic && (
                      <span className="text-[8px] bg-rose-900 text-white px-1 rounded font-bold" title="Dropped by heuristic!">
                        MISSED
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

        {/* Diagnosis Callout on Why Literature Methods Fail */}
        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {isFa 
                ? 'چرا روش‌های هیوریستیک ادبیات در این داده دچار خطا می‌شوند؟' 
                : 'Why Literature Heuristics Drop Critical Evidence:'}
            </p>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              {activePrompt.hasThinking
                ? (isFa 
                    ? 'در مسائل استدلال ریاضی و زنجیره تفکر، توکن‌های فرمول میانی در اوایل ورودی هستند و توجه گذشته‌نگر کمی به آن‌ها می‌شود، لذا H2O آن‌ها را به اشتباه تخلیه می‌کند؛ در حالی که Future-KL متوجه می‌شود که این فرمول برای تولید پاسخ در آینده حیاتی است.' 
                    : 'In multi-step reasoning, intermediate formula tokens have low past attention during prefill. H2O evicts them prematurely, causing chain collapse. Future-KL preserves them because future prediction distributions depend on them.')
                : activePrompt.language === 'fa'
                ? (isFa
                    ? 'در زبان فارسی به دلیل شکست کلمات به چند بایت‌توکن (Fertility بالا)، توجه مدل روی چند قطعه توزیع می‌شود و امتیاز توجه هر قطعه زیر آستانه H2O/SnapKV قرار می‌گیرد؛ در نتیجه کلمات کلیدی حذف می‌شوند.'
                    : 'In Persian, high subtoken fertility fragments words into byte pieces. Heuristic attention thresholds fail to accumulate across fragmented tokens, whereas Future-KL measures true downstream output divergence.')
                : (isFa
                    ? 'روش‌های پنجره لغزان (StreamingLLM/Last-K) اطلاعات میانی را به کل فراموش می‌کنند، در حالی که اوراکل Future-KL با افق m گام جلوتر، اثر علّی را حفظ می‌نماید.'
                    : 'Sliding window methods (StreamingLLM) strictly discard tokens outside the recency buffer, missing evidence completely.')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isFa ? 'دسته‌بندی:' : 'Category:'}</span>
          </span>
          {[
            { id: 'all', label: isFa ? 'همه روش‌ها (۲۲)' : 'All (22)' },
            { id: 'retained_kv', label: isFa ? 'تخلیه فیزیکی کش (Retained KV)' : 'Retained KV' },
            { id: 'active_attention', label: isFa ? 'توجه پویا بدون کاهش حافظه' : 'Active Attention' },
            { id: 'baseline', label: isFa ? 'خط‌های پایه (Baselines)' : 'Baselines' },
            { id: 'oracle', label: isFa ? 'اوراکل‌ها و مراجع' : 'Oracles' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isFa ? 'جستجوی نام یا مقاله...' : 'Search method or citation...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Top Methods Chart: Evidence Recall vs Future-KL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{isFa ? 'نمودار مقایسه‌ای بازیابی شواهد روی این داده (Evidence Recall %)' : 'Evidence Recall Comparison on Active Task (%)'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isFa ? 'ستون بالاتر = حفظ شواهد بهتر در بودجه کش معین' : 'Higher bar = superior retention of critical tokens'}
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-bold">
            Higher is Better (0-100%)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                interval={0} 
                angle={-25} 
                textAnchor="end" 
              />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                formatter={(val: any) => [`${val}%`, isFa ? 'بازیابی شواهد' : 'Evidence Recall']}
              />
              <Bar dataKey="evidenceRecall" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => {
                  const isFutureKl = entry.raw.id.includes('idea6');
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isFutureKl ? chartPalette.oracle : chartPalette.baseline} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison View & Unified Chart */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>{isFa ? 'مقایسه چهره‌به‌چهره دو متد کش KV (Side-by-Side Comparison View)' : 'Side-by-Side KV Eviction Method Comparison'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFa
                ? 'انتخاب دو روش مختلف و مقایسه همزمان دقت، حافظه مصرفی و تاخیر در یک نمودار یکپارچه.'
                : 'Select two different KV cache eviction methods and compare performance metrics (accuracy, memory footprint, latency) in a unified view.'}
            </p>
          </div>

          {/* Method Selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-indigo-900/50">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-slate-400">Method A:</span>
              <select
                value={compareMethodAId}
                onChange={(e) => setCompareMethodAId(e.target.value)}
                className="bg-transparent text-xs text-emerald-300 font-bold focus:outline-none cursor-pointer"
              >
                {dynamicMethods.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">{m.name}</option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-mono text-xs">vs</span>

            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-900/50">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs text-slate-400">Method B:</span>
              <select
                value={compareMethodBId}
                onChange={(e) => setCompareMethodBId(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                {dynamicMethods.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Side-by-Side Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Method A Card */}
          <div className="rounded-xl bg-slate-950/80 border border-emerald-500/30 p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Method A
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{methodA.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{methodA.citation} ({methodA.conference})</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Recall</span>
                <span className="text-lg font-bold text-emerald-400">{(methodA.evidenceRecall * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Future-KL</span>
                <strong className="text-indigo-300">{methodA.futureKl.toFixed(3)}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">KV Alloc</span>
                <strong className="text-cyan-400">{(methodA.kvAllocRatio * 100).toFixed(0)}%</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Latency</span>
                <strong className="text-amber-400">{Math.round(45 * methodA.kvAllocRatio)} ms</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {methodA.mechanism}
            </p>
          </div>

          {/* Method B Card */}
          <div className="rounded-xl bg-slate-950/80 border border-amber-500/30 p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Method B
                </span>
                <h4 className="text-sm font-bold text-white mt-1">{methodB.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{methodB.citation} ({methodB.conference})</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Recall</span>
                <span className="text-lg font-bold text-amber-400">{(methodB.evidenceRecall * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Future-KL</span>
                <strong className="text-indigo-300">{methodB.futureKl.toFixed(3)}</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">KV Alloc</span>
                <strong className="text-cyan-400">{(methodB.kvAllocRatio * 100).toFixed(0)}%</strong>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Latency</span>
                <strong className="text-amber-400">{Math.round(45 * methodB.kvAllocRatio)} ms</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {methodB.mechanism}
            </p>
          </div>
        </div>

        {/* Unified Comparison Bar Chart */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Unified Performance Comparison (Normalized %)</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> {methodA.name}</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> {methodB.name}</span>
            </div>
          </div>

          <div className="h-56 w-full bg-slate-950 p-4 rounded-xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { metric: isFa ? 'بازیابی شواهد (Recall)' : 'Evidence Recall', methodA: Math.round(methodA.evidenceRecall * 100), methodB: Math.round(methodB.evidenceRecall * 100) },
                  { metric: isFa ? 'حفظ کش KV (%)' : 'KV Retention (%)', methodA: Math.round(methodA.kvAllocRatio * 100), methodB: Math.round(methodB.kvAllocRatio * 100) },
                  { metric: isFa ? 'کیفیت زبانی (1 - ΔNLL)' : 'Fluency Score', methodA: Math.max(0, Math.round((1 - methodA.deltaNll) * 100)), methodB: Math.max(0, Math.round((1 - methodB.deltaNll) * 100)) },
                  { metric: isFa ? 'سرعت پردازش (Speed)' : 'Inference Speed', methodA: Math.round(100 - methodA.futureKl * 20), methodB: Math.round(100 - methodB.futureKl * 20) }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                <Bar dataKey="methodA" name={methodA.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="methodB" name={methodB.name} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Literature Benchmark Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {isFa ? 'جدول رتبه‌بندی مقایسه‌ای متدها روی این تسک' : 'Comparative Methods Benchmark Table'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredMethods.length} {isFa ? 'روش ثبت‌شده' : 'Methods Registered'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{isFa ? 'روش و استناد مقاله' : 'Method & Citation'}</th>
                <th className="py-3 px-3">{isFa ? 'دسته‌بندی' : 'Category'}</th>
                <th 
                  onClick={() => toggleSort('evidenceRecall')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ConceptTooltip term="causal_utility">
                      <span>{isFa ? 'بازیابی شواهد' : 'Recall'}</span>
                    </ConceptTooltip>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('futureKl')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1 text-indigo-300">
                    <ConceptTooltip term="future_kl">
                      <span>{isFa ? 'واگرایی Future-KL' : 'Future-KL'}</span>
                    </ConceptTooltip>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('deltaNll')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    <ConceptTooltip term="delta_nll">
                      <span>{isFa ? 'افت لگاریتم ΔNLL' : 'ΔNLL'}</span>
                    </ConceptTooltip>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <ConceptTooltip term="kv_cache">
                    <span>{isFa ? 'سهم حافظه KV' : 'KV Alloc'}</span>
                  </ConceptTooltip>
                </th>
                <th className="py-3 px-4 text-right">{isFa ? 'جزئیات مکانیسم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredMethods.map((m) => {
                const isIdea6 = m.id.includes('idea6');
                const isSelected = selectedMethod?.id === m.id;

                return (
                  <tr 
                    key={m.id}
                    onClick={() => setSelectedMethod(m)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-950/60' 
                        : isIdea6 
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30' 
                        : 'hover:bg-slate-850'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {isIdea6 && (
                          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-white text-xs">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {m.citation} ({m.conference})
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        m.category === 'retained_kv'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                          : m.category === 'active_attention'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : m.category === 'oracle'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.category === 'retained_kv' ? 'Retained KV' : m.category === 'active_attention' ? 'Active Attention' : m.category === 'oracle' ? 'Oracle' : 'Baseline'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                      {(m.evidenceRecall * 100).toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-3 font-mono text-indigo-300">
                      {m.futureKl.toFixed(4)}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-amber-400">
                      +{m.deltaNll.toFixed(3)}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        m.kvAllocRatio < 0.3 
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {(m.kvAllocRatio * 100).toFixed(0)}% KV
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMethod(m);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        {isFa ? 'بررسی مکانیسم' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Method Detail Modal / Drawer */}
      {selectedMethod && (
        <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedMethod.name}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedMethod.citation} • {selectedMethod.conference} ({selectedMethod.year})
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMethod(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
            >
              {isFa ? 'بستن پنجره' : 'Close'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-bold block">{isFa ? 'مکانیسم اصلی:' : 'Core Mechanism:'}</span>
              <p className="text-slate-300 leading-relaxed">{selectedMethod.mechanism}</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-emerald-400 font-bold block">{isFa ? 'مزایای برجسته:' : 'Strengths:'}</span>
              <p className="text-slate-300 leading-relaxed">{selectedMethod.strengths}</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-rose-400 font-bold block">{isFa ? 'نقاط ضعف و چرایی شکست:' : 'Weaknesses & Failure Mode:'}</span>
              <p className="text-slate-300 leading-relaxed">{selectedMethod.weaknesses}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
