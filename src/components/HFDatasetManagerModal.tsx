import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Search, 
  Plus, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  FileCode,
  Tag,
  ArrowRight,
  Brain,
  Wrench,
  Globe2,
  Trash2
} from 'lucide-react';
import { PromptSample } from '../types';
import { POPULAR_HF_DATASETS, fetchHFDatasetMetadata, HFDatasetInfo } from '../utils/hfDatasetApi';

interface HFDatasetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetList: PromptSample[];
  setDatasetList: React.Dispatch<React.SetStateAction<PromptSample[]>>;
  selectedDatasetId: string;
  onSelectDataset: (datasetId: string) => void;
  lang: 'fa' | 'en';
}

export const HFDatasetManagerModal: React.FC<HFDatasetManagerModalProps> = ({
  isOpen,
  onClose,
  datasetList,
  setDatasetList,
  selectedDatasetId,
  onSelectDataset,
  lang
}) => {
  const isFa = lang === 'fa';
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_hf' | 'manage'>('presets');
  const [searchRepoId, setSearchRepoId] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchedInfo, setFetchedInfo] = useState<HFDatasetInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Field mapping state for custom import
  const [selectedPromptCol, setSelectedPromptCol] = useState<string>('');
  const [selectedAnswerCol, setSelectedAnswerCol] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<PromptSample['category']>('math_hard_think');
  const [customLanguage, setCustomLanguage] = useState<'fa' | 'en'>('en');
  const [customHasThinking, setCustomHasThinking] = useState<boolean>(false);
  const [customHasTools, setCustomHasTools] = useState<boolean>(false);

  // Quick preset loader
  const handleLoadPreset = (preset: typeof POPULAR_HF_DATASETS[0]) => {
    // Add all sample items from the preset that aren't already in datasetList
    const newItems = preset.sampleItems.filter(item => !datasetList.some(d => d.id === item.id));
    if (newItems.length > 0) {
      setDatasetList(prev => [...prev, ...newItems]);
    }
    // Select first sample
    if (preset.sampleItems[0]) {
      onSelectDataset(preset.sampleItems[0].id);
    }
    onClose();
  };

  // Inspect Hugging Face dataset
  const handleInspectDataset = async () => {
    if (!searchRepoId.trim()) return;
    setIsFetching(true);
    setFetchError(null);
    setFetchedInfo(null);

    try {
      const info = await fetchHFDatasetMetadata(searchRepoId.trim());
      setFetchedInfo(info);
      setCustomTitle(searchRepoId.trim().split('/').pop() || searchRepoId.trim());
      
      // Auto-detect columns
      const promptCandidates = ['question', 'prompt', 'context', 'instruction', 'input', 'text', 'source'];
      const answerCandidates = ['answer', 'answers', 'output', 'response', 'ground_truth', 'completion', 'target'];
      
      const foundPrompt = info.features?.find(f => promptCandidates.includes(f.toLowerCase())) || info.features?.[0] || 'question';
      const foundAnswer = info.features?.find(f => answerCandidates.includes(f.toLowerCase())) || info.features?.[1] || 'answer';
      
      setSelectedPromptCol(foundPrompt);
      setSelectedAnswerCol(foundAnswer);

      if (searchRepoId.toLowerCase().includes('persian') || searchRepoId.toLowerCase().includes('fa')) {
        setCustomLanguage('fa');
        setCustomCategory('persian_fertility');
      } else if (searchRepoId.toLowerCase().includes('math') || searchRepoId.toLowerCase().includes('gsm')) {
        setCustomCategory('math_hard_think');
        setCustomHasThinking(true);
      } else if (searchRepoId.toLowerCase().includes('tool') || searchRepoId.toLowerCase().includes('berkeley')) {
        setCustomCategory('tool_call');
        setCustomHasTools(true);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Error inspecting Hugging Face dataset repository.');
    } finally {
      setIsFetching(false);
    }
  };

  // Import custom extracted sample
  const handleImportCustom = () => {
    if (!fetchedInfo) return;
    
    const sampleRow = fetchedInfo.previewRows?.[0] || {};
    const promptText = String(sampleRow[selectedPromptCol] || `Sample benchmark prompt from ${fetchedInfo.id}`);
    const answerText = String(sampleRow[selectedAnswerCol] || `Ground truth target continuation.`);

    const newSample: PromptSample = {
      id: `hf_${fetchedInfo.id.replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now()}`,
      title: customTitle.trim() || fetchedInfo.id,
      titleFa: isFa ? `مجموعه داده ${customTitle}` : customTitle,
      category: customCategory,
      language: customLanguage,
      lengthType: promptText.length > 500 ? 'long' : promptText.length > 150 ? 'medium' : 'short',
      approxTokenCount: Math.round(promptText.split(/\s+/).length * (customLanguage === 'fa' ? 1.8 : 1.2)),
      prompt: promptText,
      fixedContinuation: answerText,
      evidenceIndices: [0, 1, 2, 3],
      needle: answerText.slice(0, 30),
      hasThinking: customHasThinking,
      thinkingTrace: customHasThinking ? '<thinking>\n1. Step 1 reasoning token sequence.\n2. Eviction boundary verified.\n</thinking>' : undefined,
      hasTools: customHasTools,
      description: `Imported directly from Hugging Face Hub repository (${fetchedInfo.id}).`
    };

    setDatasetList(prev => [newSample, ...prev]);
    onSelectDataset(newSample.id);
    onClose();
  };

  const handleDeleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatasetList(prev => prev.filter(d => d.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isFa ? 'مدیریت و بارگذاری مجموعه داده از Hugging Face' : 'Hugging Face Dataset Importer & Manager'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
                  HF Hub Hub-API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isFa 
                  ? 'بارگذاری بنچمارک‌های استاندارد جهانی یا هر دیتاست دلخواه از هاگینگ‌فیس و نگاشت ستون‌ها'
                  : 'Load SOTA benchmarks or inspect & import any custom dataset repository from Hugging Face'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presets' 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isFa ? 'بنچمارک‌های محبوب آماده (GSM8K, LongBench, PersianQA)' : 'Curated SOTA Benchmarks'}
          </button>
          <button
            onClick={() => setActiveTab('custom_hf')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'custom_hf' 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            {isFa ? 'افزودن دیتاست جدید از هاگینگ‌فیس (HF Hub Repo)' : 'Import Any Custom Dataset (HF Repo)'}
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'manage' 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            {isFa ? `دیتاست‌های فعال (${datasetList.length})` : `Active Datasets (${datasetList.length})`}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CURATED BENCHMARK PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-cyan-400">
                  {isFa ? 'مجموعه‌های داده مرجع با یک کلیک:' : '1-Click Standard Research Datasets:'}
                </span>{' '}
                {isFa 
                  ? 'این بنچمارک‌ها به صورت پیش‌پردازش‌شده همراه با متغیرهای تفکر (<thinking>)، ابزارها و نشانگرهای دقیق سوزن آماده ارزیابی هستند.'
                  : 'Pre-mapped benchmarks configured with exact needle positions, thinking traces, and tool schemas for immediate testing.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {POPULAR_HF_DATASETS.map((preset) => {
                  const isAlreadyAdded = preset.sampleItems.every(s => datasetList.some(d => d.id === s.id));
                  return (
                    <div 
                      key={preset.id}
                      className="bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/50 p-4 rounded-xl flex flex-col justify-between transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                              {preset.id}
                            </span>
                            <h3 className="font-bold text-white text-sm mt-1">
                              {isFa ? preset.nameFa : preset.name}
                            </h3>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            preset.language === 'fa' ? 'bg-amber-900/40 text-amber-300 border border-amber-700/40' : 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                          }`}>
                            {preset.language.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {isFa ? preset.descriptionFa : preset.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                            {preset.category === 'math_hard_think' && <Brain className="w-3 h-3 text-emerald-400" />}
                            {preset.category === 'tool_call' && <Wrench className="w-3 h-3 text-cyan-400" />}
                            {preset.category === 'persian_fertility' && <Globe2 className="w-3 h-3 text-amber-400" />}
                            {preset.category}
                          </span>
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                            {preset.sampleItems.length} {isFa ? 'نمونه تست' : 'samples'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/40 flex items-center justify-between">
                        <a 
                          href={`https://huggingface.co/datasets/${preset.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                        >
                          <span>{isFa ? 'مشاهده در Hugging Face' : 'HF Hub'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleLoadPreset(preset)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-cyan-900/30 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAlreadyAdded ? (isFa ? 'انتخاب و استفاده' : 'Select') : (isFa ? 'بارگذاری در تست‌بد' : 'Import Dataset')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT ANY CUSTOM DATASET FROM HF HUB */}
          {activeTab === 'custom_hf' && (
            <div className="space-y-6">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  {isFa ? 'شناسه مخزن دیتاست در Hugging Face (Dataset Repository ID):' : 'Hugging Face Dataset Identifier:'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className={`w-4 h-4 absolute top-3 text-slate-500 ${isFa ? 'right-3' : 'left-3'}`} />
                    <input 
                      type="text" 
                      value={searchRepoId}
                      onChange={(e) => setSearchRepoId(e.target.value)}
                      placeholder={isFa ? 'مثال: openai/gsm8k یا SajjadAyoubi/persian_qa یا هر دیتاست دلخواه...' : 'e.g. openai/gsm8k, squad_v2, THUDM/LongBench...'}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInspectDataset(); }}
                    />
                  </div>
                  <button
                    onClick={handleInspectDataset}
                    disabled={isFetching || !searchRepoId.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/30"
                  >
                    {isFetching ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{isFa ? 'بررسی و استخراج ستون‌ها' : 'Inspect HF Hub'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{isFa ? 'نمونه‌های پیشنهادی:' : 'Quick suggestions:'}</span>
                  {['openai/gsm8k', 'THUDM/LongBench', 'SajjadAyoubi/persian_qa', 'tatsu-lab/alpaca'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSearchRepoId(s); }}
                      className="text-cyan-400 hover:underline font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {fetchError && (
                <div className="bg-rose-950/40 border border-rose-600/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}

              {fetchedInfo && (
                <div className="bg-slate-950 border border-cyan-800/40 rounded-xl p-5 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{fetchedInfo.id}</span>
                        <a 
                          href={`https://huggingface.co/datasets/${fetchedInfo.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{fetchedInfo.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-800">
                        ❤️ {fetchedInfo.likes || 0}
                      </span>
                      <span className="bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-800">
                        ⬇️ {fetchedInfo.downloads || 0}
                      </span>
                    </div>
                  </div>

                  {/* Schema / Feature Mapping UI */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      {isFa ? 'نگاشت ستون‌های دیتاست به متغیرهای ارزیابی KV Cache:' : 'Map Dataset Columns to KV Cache Evaluation Fields:'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-semibold">
                          {isFa ? 'ستون پرامپت / ورودی متن (Prompt / Context):' : 'Prompt / Context Column:'}
                        </label>
                        <select
                          value={selectedPromptCol}
                          onChange={(e) => setSelectedPromptCol(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        >
                          {fetchedInfo.features?.map(feat => (
                            <option key={feat} value={feat}>{feat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 font-semibold">
                          {isFa ? 'ستون پاسخ مرجع / ادامه‌دهنده (Target Answer / Continuation):' : 'Answer / Target Continuation Column:'}
                        </label>
                        <select
                          value={selectedAnswerCol}
                          onChange={(e) => setSelectedAnswerCol(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        >
                          {fetchedInfo.features?.map(feat => (
                            <option key={feat} value={feat}>{feat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          {isFa ? 'دسته‌بندی ارزیابی:' : 'Evaluation Category:'}
                        </label>
                        <select
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="math_hard_think">{"Math Hard (<thinking>)"}</option>
                          <option value="synth_niah">Needle-In-A-Haystack (NIAH)</option>
                          <option value="tool_call">Tool Calling & API</option>
                          <option value="persian_fertility">Persian Subtoken Fertility</option>
                          <option value="chat_multiturn">Chat Multi-turn</option>
                          <option value="code">Code & Syntax</option>
                          <option value="custom">Custom / General</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          {isFa ? 'زبان متن:' : 'Language:'}
                        </label>
                        <select
                          value={customLanguage}
                          onChange={(e) => setCustomLanguage(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="en">English (لاتین)</option>
                          <option value="fa">فارسی (Persian BPE)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={customHasThinking}
                            onChange={(e) => setCustomHasThinking(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
                          />
                          <span>{isFa ? 'تفکر (Thinking)' : 'Thinking Trace'}</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={customHasTools}
                            onChange={(e) => setCustomHasTools(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
                          />
                          <span>{isFa ? 'ابزار (Tools)' : 'Tool Calling'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Preview First Sample Row */}
                  {fetchedInfo.previewRows && fetchedInfo.previewRows[0] && (
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        {isFa ? 'پیش‌نمایش ردیف اول استخراج‌شده:' : 'Extracted First Row Preview:'}
                      </div>
                      <div className="text-xs text-slate-300 line-clamp-3 bg-black/40 p-2.5 rounded font-mono">
                        <span className="text-cyan-400 font-bold">[PROMPT]: </span>
                        {String(fetchedInfo.previewRows[0][selectedPromptCol] || 'No content')}
                      </div>
                      <div className="text-xs text-slate-300 line-clamp-2 bg-black/40 p-2.5 rounded font-mono">
                        <span className="text-emerald-400 font-bold">[ANSWER]: </span>
                        {String(fetchedInfo.previewRows[0][selectedAnswerCol] || 'No content')}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleImportCustom}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isFa ? 'افزودن این دیتاست به لیست فعال و شروع ارزیابی' : 'Add to Active Testbed & Evaluate'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE ACTIVE DATASETS */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 pb-2">
                {isFa 
                  ? 'تمامی دیتاست‌های در دسترس برای ارزیابی تب ۱ و تب ۲. برای آزمایش فوری روی هر کدام کلیک کنید.'
                  : 'All datasets currently loaded in memory for Tab 1 and Tab 2 evaluations.'}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {datasetList.map((item) => {
                  const isSelected = item.id === selectedDatasetId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectDataset(item.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-cyan-950/40 border-cyan-500 text-white' 
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {isFa ? item.titleFa || item.title : item.title}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            item.language === 'fa' ? 'bg-amber-900/40 text-amber-300' : 'bg-blue-900/40 text-blue-300'
                          }`}>
                            {item.language}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                            ~{item.approxTokenCount} tok
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-xs text-cyan-400 font-bold bg-cyan-900/40 px-2.5 py-1 rounded-lg border border-cyan-700/50">
                            <Check className="w-3.5 h-3.5" />
                            {isFa ? 'فعال' : 'Active'}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDataset(item.id);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                          >
                            {isFa ? 'انتخاب' : 'Select'}
                          </button>
                        )}
                        {item.id.startsWith('hf_') && (
                          <button
                            onClick={(e) => handleDeleteDataset(item.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            title={isFa ? 'حذف دیتاست سفارشی' : 'Delete custom dataset'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
