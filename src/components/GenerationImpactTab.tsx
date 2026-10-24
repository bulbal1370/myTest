import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  PromptSample,
  HFModelConfig,
  AccessibilitySettings,
  GeneratedToken,
  GenerationEvaluationResult
} from '../types';
import { runTextGenerationEvaluation, SimulationParams } from '../utils/generationEngine';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  Cpu, 
  Layers, 
  Database, 
  FileText, 
  ArrowRight, 
  HelpCircle,
  Copy,
  Check,
  Zap,
  Split,
  Eye,
  RefreshCw,
  Hash,
  Activity
} from 'lucide-react';
import { ConceptTooltip } from './ConceptTooltip';

interface GenerationImpactTabProps {
  lang: 'fa' | 'en';
  accessibility: AccessibilitySettings;
  activeModel: HFModelConfig;
  activePrompt: PromptSample;
  budgetPercent: number;
  setBudgetPercent: (b: number) => void;
  mHorizon: number;
  setMHorizon: (m: number) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  sinkCount: number;
  setSinkCount: (s: number) => void;
  datasetList: PromptSample[];
  selectedDatasetId: string;
  setSelectedDatasetId: (id: string) => void;
  onOpenModelManager: () => void;
  onOpenDatasetManager: () => void;
}

export const GenerationImpactTab: React.FC<GenerationImpactTabProps> = ({
  lang,
  accessibility,
  activeModel,
  activePrompt,
  budgetPercent,
  setBudgetPercent,
  mHorizon,
  setMHorizon,
  temperature,
  setTemperature,
  sinkCount,
  setSinkCount,
  datasetList,
  selectedDatasetId,
  setSelectedDatasetId,
  onOpenModelManager,
  onOpenDatasetManager
}) => {
  const isFa = lang === 'fa';

  // Compare up to 3 methods at once
  const [baselineA, setBaselineA] = useState<string>('idea6_oracle_evict');
  const [baselineB, setBaselineB] = useState<string>('streaming_llm');

  // Token Scrubber & Playback State
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 means show full generation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 5x
  const [inspectedToken, setInspectedToken] = useState<GeneratedToken | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [heatmapMetric, setHeatmapMetric] = useState<'attention_alpha' | 'entropy' | 'value_norm'>('attention_alpha');
  const [selectedHeatmapLayer, setSelectedHeatmapLayer] = useState<number>(0);

  // Available methods for comparison
  const availableMethods = [
    { id: 'idea6_oracle_evict', name: isFa ? 'اوراکل Future-KL (ایده ۶ - علّی)' : 'Future-KL Oracle (Idea 6 - Causal)' },
    { id: 'h2o', name: isFa ? 'روش H2O (اتنشن تجمعی)' : 'H2O (Cumulative Heavy Hitter)' },
    { id: 'streaming_llm', name: isFa ? 'روش StreamingLLM (سینک + پنجره محلی)' : 'StreamingLLM (Sinks + Window)' },
    { id: 'snapkv', name: isFa ? 'روش SnapKV (پنجره مشاهده)' : 'SnapKV (Observation Window)' },
    { id: 'random', name: isFa ? 'تخلیه تصادفی (Random Eviction)' : 'Random Eviction Baseline' }
  ];

  // Run generation simulation
  const simulationParams: SimulationParams = useMemo(() => ({
    sample: activePrompt,
    model: activeModel,
    budgetPercent,
    mHorizon,
    temperature,
    sinkCount
  }), [activePrompt, activeModel, budgetPercent, mHorizon, temperature, sinkCount]);

  const evaluationResults = useMemo(() => {
    return runTextGenerationEvaluation(
      simulationParams,
      ['dense', baselineA, baselineB]
    );
  }, [simulationParams, baselineA, baselineB]);

  const denseResult = evaluationResults[0];
  const methodAResult = evaluationResults[1];
  const methodBResult = evaluationResults[2];

  const maxTokens = denseResult?.tokens.length || 0;

  // Auto-play scrubber animation
  const playTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= maxTokens - 1) {
            setIsPlaying(false);
            return maxTokens - 1;
          }
          return prev + 1;
        });
      }, Math.max(50, 400 / playSpeed));
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, maxTokens, playSpeed]);

  const handleResetScrubber = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Colorblind token color styling helper
  const getTokenStyle = (t: GeneratedToken) => {
    const isStandard = accessibility.mode === 'standard';
    const isDeut = accessibility.mode === 'deuteranopia';
    const isTrit = accessibility.mode === 'tritanopia';
    const isHighContrast = accessibility.mode === 'high_contrast';

    if (t.isNeedle) {
      return isHighContrast
        ? 'border-2 border-yellow-400 bg-yellow-400 text-slate-950 font-bold'
        : isDeut
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
          : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold';
    }

    if (t.isHallucinated) {
      return isHighContrast
        ? 'border-2 border-dashed border-white text-white font-bold bg-slate-900 line-through'
        : isDeut
          ? 'bg-orange-600/20 text-orange-400 border border-orange-500/40 line-through'
          : isTrit
            ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/40 line-through'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 line-through';
    }

    if (t.isDegenerate) {
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/40 underline';
    }

    // Matching token
    return isHighContrast
      ? 'text-slate-100 border border-slate-700'
      : isDeut
        ? 'text-blue-300 hover:bg-blue-500/10'
        : 'text-emerald-300 hover:bg-emerald-500/10';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Top Banner & Doctoral Context */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                {isFa ? 'ارزیابی کیفیت متن تولیدشده (Text Generation Lab)' : 'Text Generation & Token Degradation Lab'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ROUGE-1/2/L • BLEU-4 • Needle Recall
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Model: {activeModel.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isFa ? 'سنجش تجربی تاثیر تخلیه KV بر متن تولیدی مدل' : 'Evaluating KV-Cache Eviction Impact on Generated Text'}
            </h1>
            <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
              {isFa
                ? 'در این بخش، خروجی اتورگرسیو مدل تحت مداخله روش‌های مختلف تخلیه KV Cache در کنار خروجی بی‌نقص Dense مقایسه می‌شود. با تغییر بودجه، افق و سناریوهای داده، می‌توانید وقوع لغزش محاسباتی، شکست نحوی JSON و گم‌شدن کدها را گام به گام ردیابی کنید.'
                : 'Directly observe autoregressive token generation under KV cache compression compared against uncompressed Dense ground truth. Scrub through decoding steps, analyze ROUGE/BLEU degradation, and inspect arithmetic slips or dropped needles.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenDatasetManager}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isFa ? 'تغییر / واردسازی دیتاست HF' : 'Select / Import HF Dataset'}</span>
            </button>
            <button
              onClick={onOpenModelManager}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFa ? 'تغییر مدل HF' : 'Change HF Model'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Dataset & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dataset & Prompt Selector */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              {isFa ? 'دیتاست و ورودی فعال' : 'Active Dataset & Prompt'}
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {activePrompt.category}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">
              {isFa ? 'انتخاب نمونه داده آزمایشی:' : 'Select Benchmark Sample:'}
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {datasetList.map((p) => (
                <option key={p.id} value={p.id}>
                  {isFa ? p.titleFa || p.title : p.title} ({p.language.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Prompt metadata pills */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>{isFa ? 'طول توکن ورودی:' : 'Input Length:'}</span>
              <span className="font-mono text-slate-200 font-semibold">{activePrompt.approxTokenCount} tok</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>{isFa ? 'زنجیره تفکر:' : 'Thinking Chain:'}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${activePrompt.hasThinking ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {activePrompt.hasThinking ? (isFa ? '{"<thinking>"} دارد' : 'Present') : (isFa ? 'ندارد' : 'None')}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>{isFa ? 'کلید یا سوزن (Needle):' : 'Key Fact / Needle:'}</span>
              <span className="font-mono text-indigo-400 font-bold truncate max-w-[130px]" title={activePrompt.needle || 'N/A'}>
                {activePrompt.needle || (isFa ? 'تعریف‌نشده' : 'N/A')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3 leading-relaxed">
            <span className="font-semibold text-indigo-300">{isFa ? 'هدف ارزیابی:' : 'Evaluation Target:'} </span>
            {activePrompt.description}
          </div>
        </div>

        {/* Hyperparameter Controls */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              {isFa ? 'تنظیمات پارامترهای تولید متن و کش KV' : 'Generation & KV Eviction Parameters'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{isFa ? 'بودجه سریع:' : 'Quick Budget:'}</span>
              {[10, 20, 35, 50].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudgetPercent(b)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                    budgetPercent === b
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b}%
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Budget Alpha Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'بودجه حافظه KV (α):' : 'KV Budget (α):'}
                </span>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {budgetPercent}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={budgetPercent}
                onChange={(e) => setBudgetPercent(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                {budgetPercent <= 15 ? (isFa ? 'فشار سنگین (مستعد توهم)' : 'High compression stress') : (isFa ? 'محدوده بهینه ارزیابی' : 'Balanced evaluation zone')}
              </p>
            </div>

            {/* Future Horizon m Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'افق آینده (m tokens):' : 'Future Horizon (m):'}
                </span>
                <span className="font-mono text-violet-400 font-bold bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                  m={mHorizon}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={mHorizon}
                onChange={(e) => setMHorizon(Number(e.target.value))}
                className="w-full accent-violet-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                {isFa ? 'عمق پیش‌بینی علّی Future-KL' : 'Causal foresight tokens'}
              </p>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'دمای سمپلینگ (Temp):' : 'Temperature:'}
                </span>
                <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  T={temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                {temperature === 0 ? (isFa ? 'قطعی (Greedy)' : 'Deterministic Greedy') : (isFa ? 'استوکستیک معتدل' : 'Softmax sampling')}
              </p>
            </div>

            {/* Attention Sinks */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">
                  {isFa ? 'توکن‌های سینک (Sinks):' : 'Sink Tokens:'}
                </span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {sinkCount} sinks
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[0, 1, 4, 8].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSinkCount(s)}
                    className={`py-1 text-xs rounded font-mono font-medium transition-all ${
                      sinkCount === s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                {isFa ? 'محافظت از توکن‌های اولیه BOS' : 'Initial protected BOS tokens'}
              </p>
            </div>
          </div>

          {/* Baseline Method Selectors */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">
                {isFa ? 'روش‌های مورد مقایسه:' : 'Compared Methods:'}
              </span>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                <select
                  value={baselineA}
                  onChange={(e) => setBaselineA(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-violet-300 focus:outline-none focus:border-violet-500 font-medium"
                >
                  {availableMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <span className="text-slate-600 font-mono text-xs">vs</span>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <select
                  value={baselineB}
                  onChange={(e) => setBaselineB(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-medium"
                >
                  {availableMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>KV Memory Saved: </span>
              <span className="text-emerald-400 font-bold">~{100 - budgetPercent}%</span>
              <span>({methodAResult?.metrics.kvMemorySavedMb || 0} MB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Scrubber & Step-by-Step Playback Controller */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? (isFa ? 'توقف پخش' : 'Pause') : (isFa ? 'پخش گام‌به‌گام' : 'Play Decoding')}</span>
            </button>

            <button
              onClick={handleResetScrubber}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFa ? 'نمایش کامل' : 'Show Full Text'}</span>
            </button>

            {/* Playback speed buttons */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaySpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                    playSpeed === speed ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              {isFa ? 'موقعیت تولید:' : 'Generation Step:'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200 font-bold">
              {currentStep === -1 ? `${maxTokens} / ${maxTokens} (Complete)` : `${currentStep + 1} / ${maxTokens} tok`}
            </span>
          </div>
        </div>

        {/* Scrubber Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={Math.max(1, maxTokens - 1)}
            value={currentStep === -1 ? maxTokens - 1 : currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(Number(e.target.value));
            }}
            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>t = 0 (Start)</span>
            <span>t = {Math.round(maxTokens / 2)} (Middle Reasoning)</span>
            <span>t = {maxTokens} (Final Answer)</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Text Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Dense Ground Truth */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400"></span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isFa ? 'پاسخ متراکم مرجع (Dense)' : 'Dense Uncompressed Baseline'}
                </h4>
                <p className="text-[10px] text-slate-400">KV 100% • Ground Truth Target</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(denseResult.generatedText, 'dense')}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Copy text"
            >
              {copiedText === 'dense' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Metric Bar */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ROUGE-L: <strong className="text-slate-200">1.000</strong></span>
            <span className="text-slate-400">BLEU-4: <strong className="text-slate-200">1.000</strong></span>
            <span className="text-emerald-400 font-semibold">{accessibility.showSymbols ? '[✓] ' : ''}Needle: 100%</span>
          </div>

          {/* Generated Text with Tokens */}
          <div className="p-4 flex-1 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text space-y-2 overflow-y-auto max-h-[360px]">
            <div className="flex flex-wrap gap-1">
              {(currentStep === -1 ? denseResult.tokens : denseResult.tokens.slice(0, currentStep + 1)).map((t) => (
                <span
                  key={t.id}
                  onClick={() => setInspectedToken(t)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                    t.isNeedle 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Token: ${t.text} (prob: ${(t.probability * 100).toFixed(1)}%)`}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
            {denseResult.diagnosticExplanationFa && (isFa ? denseResult.diagnosticExplanationFa : denseResult.diagnosticExplanationEn)}
          </div>
        </div>

        {/* Card 2: Method A (Future-KL Oracle by default) */}
        <div className="rounded-2xl border border-violet-500/30 bg-violet-950/10 flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-violet-900/40 bg-violet-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-400 shadow-sm shadow-violet-500/50"></span>
              <div>
                <h4 className="text-xs font-bold text-violet-200 uppercase tracking-wider">
                  {methodAResult.methodName}
                </h4>
                <p className="text-[10px] text-violet-400/80">
                  Budget {budgetPercent}% • m={mHorizon}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(methodAResult.generatedText, 'methodA')}
              className="text-violet-400 hover:text-white transition-colors p-1"
              title="Copy text"
            >
              {copiedText === 'methodA' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Metric Bar */}
          <div className="px-4 py-2.5 bg-violet-950/20 border-b border-violet-900/30 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ROUGE-L: <strong className="text-violet-300">{methodAResult.metrics.rougeL.toFixed(3)}</strong></span>
            <span className="text-slate-400">BLEU-4: <strong className="text-violet-300">{methodAResult.metrics.bleu4.toFixed(3)}</strong></span>
            <span className={methodAResult.metrics.needleFound ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {accessibility.showSymbols ? (methodAResult.metrics.needleFound ? '[✓] ' : '[✗] ') : ''}
              Needle: {methodAResult.metrics.needleConfidence}%
            </span>
          </div>

          {/* Generated Text with Tokens */}
          <div className="p-4 flex-1 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text space-y-2 overflow-y-auto max-h-[360px]">
            <div className="flex flex-wrap gap-1">
              {(currentStep === -1 ? methodAResult.tokens : methodAResult.tokens.slice(0, currentStep + 1)).map((t) => (
                <span
                  key={t.id}
                  onClick={() => setInspectedToken(t)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${getTokenStyle(t)}`}
                  title={`Token: ${t.text} (prob: ${(t.probability * 100).toFixed(1)}%)`}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-violet-950/40 border-t border-violet-900/30 text-[11px] text-violet-300/90">
            {isFa ? methodAResult.diagnosticExplanationFa : methodAResult.diagnosticExplanationEn}
          </div>
        </div>

        {/* Card 3: Method B (StreamingLLM / H2O / Baseline) */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-amber-900/40 bg-amber-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50"></span>
              <div>
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  {methodBResult.methodName}
                </h4>
                <p className="text-[10px] text-amber-400/80">
                  Budget {budgetPercent}% • Baseline
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(methodBResult.generatedText, 'methodB')}
              className="text-amber-400 hover:text-white transition-colors p-1"
              title="Copy text"
            >
              {copiedText === 'methodB' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Metric Bar */}
          <div className="px-4 py-2.5 bg-amber-950/20 border-b border-amber-900/30 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ROUGE-L: <strong className="text-amber-300">{methodBResult.metrics.rougeL.toFixed(3)}</strong></span>
            <span className="text-slate-400">BLEU-4: <strong className="text-amber-300">{methodBResult.metrics.bleu4.toFixed(3)}</strong></span>
            <span className={methodBResult.metrics.needleFound ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {accessibility.showSymbols ? (methodBResult.metrics.needleFound ? '[✓] ' : '[✗] ') : ''}
              Needle: {methodBResult.metrics.needleConfidence}%
            </span>
          </div>

          {/* Generated Text with Tokens */}
          <div className="p-4 flex-1 text-xs leading-relaxed font-mono whitespace-pre-wrap select-text space-y-2 overflow-y-auto max-h-[360px]">
            <div className="flex flex-wrap gap-1">
              {(currentStep === -1 ? methodBResult.tokens : methodBResult.tokens.slice(0, currentStep + 1)).map((t) => (
                <span
                  key={t.id}
                  onClick={() => setInspectedToken(t)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${getTokenStyle(t)}`}
                  title={`Token: ${t.text} (prob: ${(t.probability * 100).toFixed(1)}%)`}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-950/40 border-t border-amber-900/30 text-[11px] text-amber-300/90">
            {isFa ? methodBResult.diagnosticExplanationFa : methodBResult.diagnosticExplanationEn}
          </div>
        </div>
      </div>

      {/* Selected Token Inspector Modal / Drawer */}
      {inspectedToken && (
        <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-mono font-bold text-indigo-300 text-lg">
              {inspectedToken.text}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {isFa ? `توکن شماره #${inspectedToken.id}` : `Token Index #${inspectedToken.id}`}
                </span>
                {inspectedToken.isNeedle && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    [🎯] {isFa ? 'سوزن / کلید مسئله' : 'Target Needle Token'}
                  </span>
                )}
                {inspectedToken.isHallucinated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    [✗] {isFa ? 'توکن منحرف‌شده (Hallucinated)' : 'Hallucinated Token'}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                P(token) = {(inspectedToken.probability * 100).toFixed(2)}% • Logprob: {inspectedToken.logprob.toFixed(3)}
              </p>
            </div>
          </div>

          {/* Top-2 Alternatives */}
          {inspectedToken.topKAlternatives && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">{isFa ? 'جایگزین‌ها:' : 'Alternatives:'}</span>
              {inspectedToken.topKAlternatives.map((alt, i) => (
                <span key={i} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  &quot;{alt.token}&quot; ({(alt.prob * 100).toFixed(0)}%)
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setInspectedToken(null)}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 transition-colors self-end sm:self-center"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      )}

      {/* Advanced KV Cache Telemetry & Head/Layer Importance Oracle Inspector */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-slate-950 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/40 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {isFa ? 'گزارش تخصصی اوراکل KV Cache' : 'KV Cache Telemetry Oracle'}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {activeModel.numLayers} Layers • {activeModel.numAttentionHeads} Heads • GQA={activeModel.numKvHeads}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isFa ? 'تحلیل تفکیکی لایه/سر (Layer & Head-Wise Token Importance Telemetry)' : 'Granular Layer & Head-Wise Token Importance Telemetry'}
            </h3>
            <p className="text-xs text-slate-400">
              {isFa
                ? 'مقایسه عمیق سیگنال‌های مهم توکن شامل میانگین/مجموع توجه (α)، نرم بردار ارزش (||v||₂)، واریانس سرها (σ)، آنتروپی توجه (H)، موقعیت (pos) و تخصیص بودجه در روش‌های SnapKV و Ada-KV.'
                : 'Rigorous inspection of token utility features: attention statistics (α), normalized value vector norms (||v||₂), head variance (σ), incoming query entropy (H), positional breakdowns (pos), and Ada-KV head-wise budget allocation.'}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <div>Active Token: <strong className="text-indigo-300">#{inspectedToken?.id || 12}</strong></div>
            <div className="text-[10px] text-emerald-400">Selected via Scrubber / Click</div>
          </div>
        </div>

        {/* 5-Column Core Feature Breakdown Grid with Exact User Examples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Alpha Statistics */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 font-mono">1. \u03b1_i: {isFa ? 'میانگین جرم توجه' : 'Mean Attention'}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-1.5 py-0.5 rounded font-mono">x_i[0]</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-indigo-300 font-semibold">Ex (4 heads):</div>
              <div>[0.2, 0.4, 0.1, 0.3]</div>
              <div className="text-emerald-400 font-bold">\u03b1_i = (0.2+0.4+0.1+0.3)/4 = 0.25</div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa ? 'تفسیر: توکنی که توجه زیادی می‌گیرد، احتمالاً مهم است.' : 'Interpretation: High attention mass indicates token importance.'}
            </p>
          </div>

          {/* 2. Value Vector Norm */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 font-mono">2. ||v_i||_2: {isFa ? 'نرم بردار مقدار' : 'Value Norm'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded font-mono">x_i[1]</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-emerald-300 font-semibold">Ex vector:</div>
              <div>v_i = (3, 4)</div>
              <div className="text-emerald-400 font-bold">||v||_2 = \u221a(9 + 16) = 5</div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa ? 'تفسیر: مقدار بزرگ‌تر = اطلاعات بیشتر در بردار مقدار.' : 'Interpretation: Larger vector magnitude = more embedded information.'}
            </p>
          </div>

          {/* 3. Head Variance */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-300 font-mono">3. \u03c3_i: {isFa ? 'واریانس توجه' : 'Head Variance'}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-200 px-1.5 py-0.5 rounded font-mono">x_i[2]</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-violet-300 font-semibold">Ex dispersion:</div>
              <div>Head 1: 0.9 | Head 2: 0.1</div>
              <div className="text-violet-400 font-bold">\u03c3_i = High Variance</div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa ? 'تفسیر: واریانس بالا = توجه تخصصی (فقط بعضی سرها به آن اهمیت می‌دهند).' : 'Interpretation: High variance = specialized attention (selective head interest).'}
            </p>
          </div>

          {/* 4. Entropy */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 font-mono">4. H_i: {isFa ? 'آنتروپی توجه اخیر' : 'Recent Entropy'}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded font-mono">x_i[3]</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-amber-300 font-semibold">64 recent queries:</div>
              <div>Weighted Entropy calc</div>
              <div className="text-amber-400 font-bold">H_i \u2248 1.84 nats</div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa ? 'تفسیر: H پایین = پرسش‌های متمرکز؛ H بالا = پرسش‌های پراکنده.' : 'Interpretation: Low H = focused queries; High H = scattered queries.'}
            </p>
          </div>

          {/* 5. Positional Features */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 font-mono">5. pos_i: {isFa ? 'موقعیت نرمال‌شده' : 'Norm Position'}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono">x_i[4]</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <div className="text-cyan-300 font-semibold">Ex index:</div>
              <div>Position 50 of 100</div>
              <div className="text-cyan-400 font-bold">pos_i = 50 / 100 = 0.5</div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isFa ? 'تفسیر: موقعیت نسبی توکن در جریان متن ورودی.' : 'Interpretation: Relative token position in prompt sequence.'}
            </p>
          </div>
        </div>

        {/* SnapKV & Ada-KV Head-Wise Budget Allocation Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>SnapKV (Observation Window Selection)</span>
              </span>
              <span className="font-mono text-indigo-400">Per-Head Pooling</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isFa
                ? 'روش SnapKV با بررسی پنجره مشاهده انتهایی، مهم‌ترین توکن‌ها را به ازای هر head استخراج می‌کند. برخلاف روش‌های یکپارچه، تجمیع همه headها در یک عدد سیگنال‌های تخصصی را حذف می‌کند.'
                : 'SnapKV leverages an observation window at generation end to select top KV pairs per head, preserving head heterogeneity that scalar averaging discards.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Ada-KV (Head Heterogeneity & Budget Allocation)</span>
              </span>
              <span className="font-mono text-emerald-400">Dynamic Head Budget</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isFa
                ? 'روش Ada-KV تخصیص بودجه head-wise را جدی می‌گیرد. برخی headها نیاز به کش عمیق دارند در حالی که سرهای عمومی‌تر با بودجه کمتری کار می‌کنند.'
                : 'Ada-KV accounts for head heterogeneity, dynamically allocating different KV cache budgets across attention heads based on importance variance.'}
            </p>
          </div>
      </div>

        {/* Layer & Attention Head Heterogeneity Heatmap Explorer */}
        <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-slate-950/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isFa ? 'کاوشگر ناهمگنی هدهای توجه (Layer & Attention Head Heterogeneity Heatmap)' : 'Layer & Attention Head Heterogeneity Heatmap Explorer'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFa
                  ? 'مشاهده مقادیر متریک‌های کلیدی به تفکیک لایه و سر توجه برای کشف سرهای تخصصی (حذف میانگین‌گیری یکپارچه).'
                  : 'Visualizing metric values across layers and attention heads to discover specialized heads without scalar averaging.'}
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setHeatmapMetric('attention_alpha')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  heatmapMetric === 'attention_alpha' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isFa ? 'جرم توجه (α)' : 'Attention (α)'}
              </button>
              <button
                onClick={() => setHeatmapMetric('entropy')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  heatmapMetric === 'entropy' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isFa ? 'آنتروپی (H)' : 'Entropy (H)'}
              </button>
              <button
                onClick={() => setHeatmapMetric('value_norm')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  heatmapMetric === 'value_norm' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isFa ? 'نرم مقدار (||v||₂)' : 'Value Norm (||v||₂)'}
              </button>
            </div>
          </div>

          {/* Layer Selector Bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-mono">Select Layer:</span>
            {Array.from({ length: Math.min(16, activeModel.numLayers) }).map((_, lIdx) => (
              <button
                key={lIdx}
                onClick={() => setSelectedHeatmapLayer(lIdx)}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-all ${
                  selectedHeatmapLayer === lIdx
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                L{lIdx}
              </button>
            ))}
          </div>

          {/* Heatmap Grid of Attention Heads */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Showing Layer {selectedHeatmapLayer} ({activeModel.numAttentionHeads} Attention Heads)</span>
              <span className="text-indigo-300">Metric: {heatmapMetric.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-2">
              {Array.from({ length: activeModel.numAttentionHeads }).map((_, hIdx) => {
                // Generate deterministic pseudo-value based on layer & head index for visualization
                const seed = (selectedHeatmapLayer + 1) * (hIdx + 3);
                const rawVal = (Math.sin(seed) + 1) / 2; // 0 to 1
                const val = heatmapMetric === 'entropy' ? (rawVal * 2.5 + 0.5).toFixed(2) : (rawVal * 0.85 + 0.15).toFixed(2);
                const isSpecialized = rawVal > 0.75 || rawVal < 0.2;

                return (
                  <div
                    key={hIdx}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSpecialized
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-indigo-500/50'
                    }`}
                    title={`Layer ${selectedHeatmapLayer}, Head ${hIdx}: ${val} (${isSpecialized ? 'Specialized Head' : 'General Head'})`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">H{hIdx}</span>
                    <span className="text-xs font-mono font-bold mt-0.5">{val}</span>
                    {isSpecialized && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" title="Specialized Head"></span>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>💡 <strong className="text-slate-300">{isFa ? 'کشف ناهمگنی:' : 'Heterogeneity Discovery:'}</strong> {isFa ? 'نقاط زرد نشان‌دهنده سرهای تخصصی هستند که با میانگین‌گیری یکپارچه از دست می‌روند.' : 'Highlighted cells denote specialized heads that scalar averaging would mask.'}</span>
              <span className="font-mono text-indigo-400">Active Heads: {activeModel.numAttentionHeads}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative Metric Table & Comparative Radar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">
              {isFa ? 'جدول ارزیابی جامع متریک‌های پردازش زبان طبیعی (NLP Metrics Suite)' : 'Comprehensive Quantitative Text Evaluation Suite'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            N = {maxTokens} tokens • Budget \u03b1 = {budgetPercent}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">{isFa ? 'روش تخلیه' : 'Method'}</th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="rouge">ROUGE-1</ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="rouge">ROUGE-2</ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="rouge">ROUGE-L</ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="bleu">BLEU-4</ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="needle_in_a_haystack">
                    <span>{isFa ? 'حفظ سوزن / کلید' : 'Needle Recall'}</span>
                  </ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="perplexity">
                    <span>{isFa ? 'نسبت پرپلکسیتی (PPL)' : 'Perplexity Ratio'}</span>
                  </ConceptTooltip>
                </th>
                <th className="py-2.5 px-3">{isFa ? 'نرخ توهم' : 'Hallucination'}</th>
                <th className="py-2.5 px-3">
                  <ConceptTooltip term="vram_footprint">
                    <span>{isFa ? 'صرفه‌جویی حافظه' : 'KV Saved'}</span>
                  </ConceptTooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {evaluationResults.map((res) => {
                const isDense = res.methodCategory === 'dense';
                const isOracle = res.methodCategory === 'oracle';
                return (
                  <tr
                    key={res.methodId}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isOracle ? 'bg-indigo-950/20' : isDense ? 'bg-slate-950/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isDense ? 'bg-slate-400' : isOracle ? 'bg-violet-400' : 'bg-amber-400'}`}></span>
                      {res.methodName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{res.metrics.rouge1.toFixed(3)}</td>
                    <td className="py-3 px-3 text-slate-300">{res.metrics.rouge2.toFixed(3)}</td>
                    <td className="py-3 px-3 font-bold text-indigo-300">{res.metrics.rougeL.toFixed(3)}</td>
                    <td className="py-3 px-3 text-slate-300">{res.metrics.bleu4.toFixed(3)}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        res.metrics.needleFound ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {accessibility.showSymbols ? (res.metrics.needleFound ? '[✓]' : '[✗]') : ''} {res.metrics.needleConfidence}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className={res.metrics.perplexityRatio <= 1.2 ? 'text-emerald-400' : res.metrics.perplexityRatio < 3.0 ? 'text-amber-400' : 'text-rose-400'}>
                        {res.metrics.perplexityRatio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={res.metrics.hallucinationRate === 0 ? 'text-emerald-400' : res.metrics.hallucinationRate < 0.15 ? 'text-amber-400' : 'text-rose-400'}>
                        {(res.metrics.hallucinationRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">
                      {100 - res.metrics.kvBudgetPercent}% ({res.metrics.kvMemorySavedMb} MB)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Doctoral Insight: Failure Modes & Causal Utility */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          {isFa ? 'تحلیل آکادمیک مکانیسم‌های تخریب متن (Failure Modes Taxonomy)' : 'Academic Failure Modes Taxonomy & Mathematical Analysis'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 space-y-2">
            <span className="font-bold text-amber-300 block">
              {isFa ? '۱. لغزش محاسباتی در زنجیره تفکر' : '1. Intermediate Arithmetic Drift'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {isFa
                ? 'در مسائل ریاضی با تفکر عمیق، توکن‌های مراحل میانی مثل z=(y+20)/4 اتنشن انباشته بالایی در ابتدا دریافت نمی‌کنند. روش‌های گذشته‌نگر (مانند H2O) آن‌ها را به اشتباه تخلیه کرده و پاسخ نهایی با وجود حفظ ورودی‌های اول منحرف می‌شود.'
                : 'In multi-step reasoning, intermediate calculation tokens do not accumulate high initial attention. Cumulative baselines (H2O) evict them prematurely, causing catastrophic arithmetic failure despite keeping initial problem constants.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 space-y-2">
            <span className="font-bold text-rose-300 block">
              {isFa ? '۲. تخریب ساختار در فراخوانی ابزار' : '2. Tool-Calling Schema Collapse'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {isFa
                ? 'در فراخوانی JSON، تخلیه براکت‌ها یا نام کلیدهای آرگومان (مانند account_id) موجب شکست اعتبارسنجی اسکیما در ایجنت و توقف چرخه اجرا می‌گردد. Future-KL به علت پیش‌بینی لایه‌بندی توکن‌های کلیدی، این ساختار را دست‌نخورده نگه می‌دارد.'
                : 'In tool-calling, dropping closing brackets or required parameter keys triggers runtime JSON parse exceptions. Future-KL causal foresight preserves critical syntax anchors intact.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 space-y-2">
            <span className="font-bold text-indigo-300 block">
              {isFa ? '۳. گسست زیرتوکن‌های زبان فارسی' : '3. Persian Subtoken Detachment'}
            </span>
            <p className="text-slate-400 leading-relaxed">
              {isFa
                ? 'به دلیل نرخ بالای تجزیه توکن‌ها در واژگان فارسی (Fertility > 2.5)، تخلیه ناهماهنگ بخش‌های یک واژه (مانند پیشوند "میـ" از ریشه) باعث تولید کلمات بی‌معنی و آشفتگی نحوی می‌شود. سنجش علّی توکن‌های وابسته را با هم حفظ می‌کند.'
                : 'High subtoken fertility in Persian splits morphemes across multiple BPE tokens. Naive eviction breaks word stems, producing unintelligible fragments. Future-KL causal covariance retains multi-token morphological clusters.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
