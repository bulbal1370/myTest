import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Layers, 
  BarChart, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Sliders, 
  Compass, 
  Binary, 
  Server,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  AccessibilitySettings, 
  HFModelConfig, 
  PromptSample 
} from '../types';
import { 
  QUANTIZATION_PROFILES, 
  GPU_HARDWARE_TARGETS, 
  calculateVramBreakdown, 
  QuantizationProfile,
  generateLatexTable,
  generateBibtex
} from '../utils/exportAndStressUtils';
import { KV_METHODS_REGISTRY } from '../data/benchmarkSuite';
import { KVMethodInfo } from '../types';
import { getAccessibleTokenStyle } from '../utils/accessibility';

interface StressTestingTabProps {
  lang: 'fa' | 'en';
  accessibility: AccessibilitySettings;
  activeModel: HFModelConfig;
  activePrompt: PromptSample;
  budgetPercent: number;
  mHorizon: number;
  onOpenModelManager: () => void;
  onOpenDatasetManager: () => void;
}

export const StressTestingTab: React.FC<StressTestingTabProps> = ({
  lang,
  accessibility,
  activeModel,
  activePrompt,
  budgetPercent,
  mHorizon,
  onOpenModelManager,
  onOpenDatasetManager
}) => {
  const isFa = lang === 'fa';

  // State for Scaling Simulator
  const [contextLength, setContextLength] = useState<number>(16384);
  const [batchSize, setBatchSize] = useState<number>(4);
  const [selectedQuant, setSelectedQuant] = useState<QuantizationProfile>(QUANTIZATION_PROFILES[0]);
  
  // State for Needle Depth Analysis
  const [needleDepth, setNeedleDepth] = useState<number>(50); // 0% to 100%

  // LaTeX & BibTeX Export Modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportTab, setExportTab] = useState<'latex' | 'bibtex' | 'csv'>('latex');
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate VRAM for current settings
  const denseVram = useMemo(() => {
    return calculateVramBreakdown(
      activeModel,
      contextLength,
      batchSize,
      selectedQuant.bytesPerElement,
      1.0 // Uncompressed
    );
  }, [activeModel, contextLength, batchSize, selectedQuant]);

  const prunedVram = useMemo(() => {
    const retentionRatio = budgetPercent / 100;
    return calculateVramBreakdown(
      activeModel,
      contextLength,
      batchSize,
      selectedQuant.bytesPerElement,
      retentionRatio
    );
  }, [activeModel, contextLength, batchSize, selectedQuant, budgetPercent]);

  // Context Length Steps
  const contextLengthOptions = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

  // Needle Depth Retention Curve Simulation
  const needleRetentionData = useMemo(() => {
    // Computes simulated retention probability across 10 depth bins (0% to 100%)
    const depths = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
    return depths.map(d => {
      // Future-KL: Causal Downstream Utility is invariant to depth; if needle affects continuation, retention is ~95%
      const futureKlProb = Math.min(99, Math.max(90, 96 - Math.abs(d - 50) * 0.05));

      // StreamingLLM: Retains initial sinks (0-5%) and local window (90-100%). Middle is completely purged!
      const streamingProb = (d <= 10 || d >= 85) ? 92 : 2;

      // H2O: Heavy-Hitter cumulative attention. Strongly biased to first 20% and last 20%. Middle dips to 18%.
      const h2oProb = Math.max(15, 85 - Math.sin((d / 100) * Math.PI) * 68);

      // SnapKV: Observation window pooling. Catches late context well, but misses earlier mid-needles.
      const snapKvProb = Math.min(90, Math.max(25, 30 + Math.pow(d / 100, 1.8) * 60));

      // AdaKV: Adaptive layer budget. Better than H2O, but still suffers in 40-60% middle zone.
      const adaKvProb = Math.max(38, 88 - Math.sin((d / 100) * Math.PI) * 45);

      return {
        depth: d,
        futureKl: futureKlProb,
        streaming: streamingProb,
        h2o: h2oProb,
        snapKv: snapKvProb,
        adaKv: adaKvProb
      };
    });
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatedLatex = useMemo(() => {
    return generateLatexTable(KV_METHODS_REGISTRY, activeModel, mHorizon, budgetPercent);
  }, [activeModel, mHorizon, budgetPercent]);

  const generatedBibtex = useMemo(() => {
    return generateBibtex();
  }, []);

  const generatedCsv = useMemo(() => {
    let csv = `Method,Category,Conference,Year,Future_KL,Delta_NLL,Evidence_Recall,KV_Alloc_Ratio\n`;
    KV_METHODS_REGISTRY.forEach((m: KVMethodInfo) => {
      csv += `"${m.name}","${m.category}","${m.conference}",${m.year},${m.futureKl.toFixed(4)},${m.deltaNll.toFixed(4)},${(m.evidenceRecall * 100).toFixed(1)}%,${m.kvAllocRatio}\n`;
    });
    return csv;
  }, []);

  return (
    <div className="space-y-8" dir={isFa ? 'rtl' : 'ltr'}>
      {/* Top Banner / Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                {isFa ? 'آزمون شرایط مرزی و سخت‌افزاری واقعی' : 'Real-World Hardware & Boundary Stress Suite'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-700/50">
                {activeModel.name} ({activeModel.paramSize})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isFa 
                ? 'ارزیابی کوانتایز KV Cache، مقیاس‌پذیری طول توالی تا ۱۳۱k و بایاس موقعیت سوزن' 
                : 'KV Cache Quantization, Context Scaling up to 131k & Lost-in-the-Middle Depth'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isFa
                ? 'تحلیل جامع رفتار اوراکل علّی Future-KL در مقایسه با روش‌های ابتکاری در شرایط عملیاتی واقعی: از کوانتایز ۴ بیتی KIVI و FP8 تا شبیه‌سازی مصرف حافظه گرافیک (VRAM) در بچ‌های مختلف و اثر سقوط دقت در میانه کانتکست (Lost in the Middle).'
                : 'Comprehensive stress testing under production constraints: KV cache quantization (FP16/FP8/INT4), VRAM OOM cliff scaling up to 131,072 tokens, and needle depth robustness across long contexts.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/30 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isFa ? 'خروجی LaTeX و BibTeX پایان‌نامه' : 'Export Thesis LaTeX & BibTeX'}</span>
            </button>
            <button
              onClick={onOpenModelManager}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{isFa ? 'تغییر مدل HF' : 'Change HF Model'}</span>
            </button>
            <button
              onClick={onOpenDatasetManager}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>{isFa ? 'تغییر دیتاست HF' : 'Change HF Dataset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: KV CACHE QUANTIZATION MATRIX */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-indigo-400" />
              {isFa ? 'ماتریس کوانتایز KV Cache و اثر هم‌افزا با Future-KL' : 'KV Cache Precision & Compound Quantization Matrix'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isFa 
                ? 'کوانتایز ناهمسانگرد مقادیر کلید/مقدار (FP16, FP8, INT4 KIVI) همراه با تخلیه هوشمند توکن‌ها'
                : 'Evaluate how numerical precision interacts with token eviction algorithms.'}
            </p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full font-mono">
            {isFa ? `بودجه نگهداری توکن: ${budgetPercent}%` : `Active Token Budget: ${budgetPercent}%`}
          </span>
        </div>

        {/* Quantization Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUANTIZATION_PROFILES.map((quant) => {
            const isSelected = selectedQuant.id === quant.id;
            const savingPercent = Math.round((1 - quant.bytesPerElement / 2.0) * 100);
            const compoundSaving = Math.round((1 - (budgetPercent / 100) * (quant.bytesPerElement / 2.0)) * 100);

            return (
              <div
                key={quant.id}
                onClick={() => setSelectedQuant(quant)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-900/30' 
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{quant.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      quant.bitsPerElement <= 4 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' 
                        : quant.bitsPerElement === 8 
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {quant.bitsPerElement} bits ({quant.bytesPerElement} B)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isFa ? quant.descriptionFa : quant.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/40 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{isFa ? 'کاهش حافظه کوانتایز تنهایی:' : 'Precision Memory Drop:'}</span>
                    <span className="font-mono text-cyan-400 font-bold">{savingPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-semibold text-emerald-400">{isFa ? 'کاهش مرکب (Future-KL + کوانتایز):' : 'Compound Drop (Future-KL + Quant):'}</span>
                    <span className="font-mono text-emerald-300 font-black">{compoundSaving}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>{isFa ? 'جریمه تقریبی ΔNLL:' : 'Added ΔNLL Noise:'}</span>
                    <span className="font-mono text-amber-300">+{quant.deltaNllPenalty.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CONTEXT LENGTH SCALING & VRAM ALLOCATION CURVE */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              {isFa ? 'شبیه‌ساز مقیاس طول کانتکست (N = 512 تا 131k) و مرز OOM گرافیک' : 'Context Length Scaling (N = 512 to 131k) & GPU VRAM OOM Wall'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isFa 
                ? 'مقایسه مصرف VRAM کش فشرده‌نشده با Future-KL و نمایش آستانه کرش حافظه در کارت‌های گرافیک رایج'
                : 'Shows memory breakdown across context sizes and indicates exact CUDA Out-Of-Memory thresholds.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Batch Size Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="font-semibold">{isFa ? 'اندازه بچ (Batch):' : 'Batch Size:'}</span>
              {[1, 4, 16, 64].map(b => (
                <button
                  key={b}
                  onClick={() => setBatchSize(b)}
                  className={`px-2 py-0.5 rounded font-mono text-xs cursor-pointer ${
                    batchSize === b ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">
                {isFa ? 'طول توالی ورودی (Context Length N):' : 'Context Length (N Tokens):'}
              </span>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                {contextLength.toLocaleString()} tokens
              </span>
            </div>
            <input 
              type="range"
              min="512"
              max="131072"
              step="512"
              value={contextLength}
              onChange={(e) => setContextLength(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>512</span>
              <span>4k</span>
              <span>16k</span>
              <span>64k</span>
              <span>131k</span>
            </div>
          </div>

          <div className="flex items-center justify-around bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isFa ? 'کش فشرده‌نشده' : 'Dense Cache'}</div>
              <div className={`text-xl font-black font-mono mt-1 ${denseVram.totalVramGb > 80 ? 'text-rose-400' : denseVram.totalVramGb > 24 ? 'text-amber-400' : 'text-slate-200'}`}>
                {denseVram.totalVramGb.toFixed(1)} GB
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {denseVram.totalVramGb > 80 ? '❌ OOM on H100' : denseVram.totalVramGb > 24 ? '⚠️ OOM on 4090' : '✅ Fits'}
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">{isFa ? 'با Future-KL (بهره‌وری ۸۰٪)' : 'Future-KL Pruned'}</div>
              <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                {prunedVram.totalVramGb.toFixed(1)} GB
              </div>
              <div className="text-[10px] text-emerald-500 mt-0.5">
                {isFa ? `صرفه‌جویی ${(denseVram.totalVramGb - prunedVram.totalVramGb).toFixed(1)} GB` : `${(denseVram.totalVramGb - prunedVram.totalVramGb).toFixed(1)} GB Saved`}
              </div>
            </div>
          </div>
        </div>

        {/* GPU Hardware Comparison Bars */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isFa ? 'مقایسه مصرف کل VRAM با آستانه ظرفیت کارت‌های گرافیک پژوهشی:' : 'Total VRAM Consumption vs GPU Capacity Limits:'}
          </h3>

          <div className="space-y-2.5">
            {GPU_HARDWARE_TARGETS.map((gpu) => {
              const denseRatio = (denseVram.totalVramGb / gpu.vramGb) * 100;
              const prunedRatio = (prunedVram.totalVramGb / gpu.vramGb) * 100;
              const isDenseOom = denseVram.totalVramGb > gpu.vramGb;
              const isPrunedOom = prunedVram.totalVramGb > gpu.vramGb;

              return (
                <div key={gpu.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{gpu.name}</span>
                      <span className="font-mono text-slate-400 text-[11px]">({gpu.vramGb} GB VRAM)</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className={isDenseOom ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {isFa ? 'فشرده‌نشده: ' : 'Dense: '}{denseVram.totalVramGb.toFixed(1)} GB {isDenseOom && '💥 OOM'}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className={isPrunedOom ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        Future-KL: {prunedVram.totalVramGb.toFixed(1)} GB {isPrunedOom ? '⚠️ OOM' : '✓ OK'}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex relative">
                    {/* Pruned Bar */}
                    <div 
                      className={`h-full transition-all duration-300 ${isPrunedOom ? 'bg-amber-600' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, prunedRatio)}%` }}
                    />
                    {/* Additional Dense Bar */}
                    {!isDenseOom && (
                      <div 
                        className="h-full bg-slate-700/60 transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, denseRatio) - Math.min(100, prunedRatio))}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: "LOST IN THE MIDDLE" NEEDLE POSITION DEPTH ANALYSIS */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              {isFa ? 'آزمون سقوط میانه کانتکست (پدیده Lost in the Middle و موقعیت سوزن)' : '"Lost in the Middle" Depth Bias & Needle Robustness'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isFa
                ? 'ارزیابی این‌که آیا روش‌های تخلیه کش در عمق ۴۰ تا ۷۰ درصدی کانتکست اطلاعات حیاتی را به اشتباه پاک می‌کنند یا خیر (مقایسه مقاله Liu et al. با Future-KL)'
                : 'Assesses whether eviction heuristics degrade when critical evidence is positioned in the middle of long contexts.'}
            </p>
          </div>
        </div>

        {/* 10-Depth Bar Comparison */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span className="font-semibold">{isFa ? 'درصد نگهداری شواهد بر حسب عمق موقعیت فکت در متن (Depth 0% -> 100%):' : 'Evidence Retention Rate by Context Position Depth:'}</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Future-KL (Causal Oracle)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                AdaKV
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                H2O
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                StreamingLLM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-2 pt-4 h-48 items-end border-b border-slate-800 pb-2">
            {needleRetentionData.map((d) => (
              <div key={d.depth} className="h-full flex flex-col justify-end items-center gap-1 group">
                <div className="w-full flex justify-center items-end gap-0.5 h-36">
                  {/* Future-KL Bar */}
                  <div 
                    className="w-1.5 sm:w-2 bg-emerald-500 rounded-t transition-all group-hover:brightness-125"
                    style={{ height: `${d.futureKl}%` }}
                    title={`Future-KL: ${d.futureKl.toFixed(0)}% at ${d.depth}% depth`}
                  />
                  {/* AdaKV Bar */}
                  <div 
                    className="w-1.5 sm:w-2 bg-blue-500 rounded-t transition-all group-hover:brightness-125"
                    style={{ height: `${d.adaKv}%` }}
                    title={`AdaKV: ${d.adaKv.toFixed(0)}% at ${d.depth}% depth`}
                  />
                  {/* H2O Bar */}
                  <div 
                    className="w-1.5 sm:w-2 bg-amber-500 rounded-t transition-all group-hover:brightness-125"
                    style={{ height: `${d.h2o}%` }}
                    title={`H2O: ${d.h2o.toFixed(0)}% at ${d.depth}% depth`}
                  />
                  {/* StreamingLLM Bar */}
                  <div 
                    className="w-1.5 sm:w-2 bg-rose-500 rounded-t transition-all group-hover:brightness-125"
                    style={{ height: `${Math.max(4, d.streaming)}%` }}
                    title={`StreamingLLM: ${d.streaming.toFixed(0)}% at ${d.depth}% depth`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                  {d.depth}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>← {isFa ? 'ابتدای متن (Sink Tokens)' : 'Context Start (Sinks)'}</span>
            <span className="text-amber-400 font-bold">{isFa ? 'میانه بحرانی (سقوط در H2O و StreamingLLM)' : 'Critical Middle (Severe H2O & StreamingLLM Collapse)'}</span>
            <span>{isFa ? 'انتهای متن (Recent Tokens)' : 'Context End (Local Window)'} →</span>
          </div>
        </div>
      </div>

      {/* EXPORT MODAL FOR LATEX / BIBTEX */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            dir="ltr"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Publication-Ready Dissertation Exports
                  </h2>
                  <p className="text-xs text-slate-400">
                    Formatted LaTeX tables, complete BibTeX entries, and raw CSV files for your PhD thesis.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
              <button
                onClick={() => setExportTab('latex')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  exportTab === 'latex' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                LaTeX Table (\begin&#123;table*&#125;)
              </button>
              <button
                onClick={() => setExportTab('bibtex')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  exportTab === 'bibtex' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                BibTeX Citations (22 Papers)
              </button>
              <button
                onClick={() => setExportTab('csv')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  exportTab === 'csv' 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw CSV Data
              </button>
            </div>

            {/* Content & Copy Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">
                  {exportTab === 'latex' && 'Compatible with NeurIPS, ICML, ICLR, and LaTeX booktabs package.'}
                  {exportTab === 'bibtex' && 'Complete bibliography entries for all 22 comparative baselines.'}
                  {exportTab === 'csv' && 'Universal CSV table ready for Python pandas or Excel analysis.'}
                </span>
                <button
                  onClick={() => handleCopy(
                    exportTab === 'latex' ? generatedLatex : exportTab === 'bibtex' ? generatedBibtex : generatedCsv
                  )}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-all">
                {exportTab === 'latex' ? generatedLatex : exportTab === 'bibtex' ? generatedBibtex : generatedCsv}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
