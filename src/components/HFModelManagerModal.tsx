import React, { useState } from 'react';
import { 
  Bot, 
  ExternalLink, 
  Search, 
  Plus, 
  Check, 
  Sparkles, 
  Cpu, 
  Layers, 
  ArrowRightLeft,
  AlertCircle,
  HelpCircle,
  Globe,
  Loader2,
  Trash2
} from 'lucide-react';
import { HFModelConfig } from '../types';
import { DEFAULT_HF_MODELS } from '../data/hfModels';
import { fetchHFModelMetadata } from '../utils/hfHubApi';

interface HFModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: HFModelConfig;
  onSelectModel: (model: HFModelConfig) => void;
  modelsList: HFModelConfig[];
  setModelsList: React.Dispatch<React.SetStateAction<HFModelConfig[]>>;
  lang: 'fa' | 'en';
}

export const HFModelManagerModal: React.FC<HFModelManagerModalProps> = ({
  isOpen,
  onClose,
  activeModel,
  onSelectModel,
  modelsList,
  setModelsList,
  lang
}) => {
  const isFa = lang === 'fa';
  
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'light' | 'multilingual' | 'gqa'>('all');
  
  // Custom model input state
  const [customRepoId, setCustomRepoId] = useState<string>('');
  const [isLoadingCustom, setIsLoadingCustom] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCustomModel = async () => {
    const trimmed = customRepoId.trim();
    if (!trimmed) return;
    
    // Check if already in list
    const existing = modelsList.find(m => m.id.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      onSelectModel(existing);
      onClose();
      return;
    }

    setIsLoadingCustom(true);
    setCustomError(null);

    try {
      const newModel = await fetchHFModelMetadata(trimmed);
      setModelsList(prev => [newModel, ...prev]);
      onSelectModel(newModel);
      setCustomRepoId('');
      setIsLoadingCustom(false);
    } catch (err: any) {
      setCustomError(isFa ? 'خطا در بارگذاری یا شناسایی مخزن هاگینگ‌فیس' : 'Failed to profile model from Hugging Face');
      setIsLoadingCustom(false);
    }
  };

  const filteredModels = modelsList.filter(m => {
    if (categoryFilter === 'light' && !m.isLightweight) return false;
    if (categoryFilter === 'multilingual' && m.persianFertility > 2.5) return false;
    if (categoryFilter === 'gqa' && m.attentionType !== 'GQA') return false;

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.family.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isFa ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isFa ? 'مدیریت و بارگذاری مدل‌ها از Hugging Face' : 'Hugging Face Model Hub & Architecture Manager'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Multi-Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isFa 
                  ? 'انتخاب مدل‌های سبک پیش‌فرض یا بارگذاری هر مدل دلخواه از مخزن عمومی Hugging Face' 
                  : 'Load default lightweight models or input any custom repo ID from Hugging Face Hub.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Custom Model Input Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{isFa ? 'افزودن مدل جدید با شناسه مخزن Hugging Face:' : 'Add Any Custom Model by Hugging Face Repo ID:'}</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Qwen/Qwen2.5-Coder-1.5B, mistralai/Mistral-7B-Instruct-v0.3, facebook/opt-350m"
              value={customRepoId}
              onChange={e => setCustomRepoId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomModel()}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              onClick={handleAddCustomModel}
              disabled={isLoadingCustom || !customRepoId.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {isLoadingCustom ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isFa ? 'در حال واکشی...' : 'Profiling...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isFa ? 'واکشی و بارگذاری' : 'Load from Hub'}</span>
                </>
              )}
            </button>
          </div>
          {customError && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{customError}</span>
            </p>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: isFa ? 'همه مدل‌ها' : 'All Models' },
              { id: 'light', label: isFa ? 'فوق سبک (≤ 1.5B)' : 'Lightweight (≤ 1.5B)' },
              { id: 'multilingual', label: isFa ? 'بهینه فارسی/چندزبانه' : 'Persian / Multilingual' },
              { id: 'gqa', label: 'Grouped-Query (GQA)' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-medium ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={isFa ? 'جستجوی نام یا خانواده...' : 'Search model...'}
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="text-xs pr-8 pl-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredModels.map(model => {
              const isActive = activeModel.id === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => onSelectModel(model)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100 text-xs sm:text-sm">
                            {model.name}
                          </span>
                          {model.isLightweight && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                              سبک
                            </span>
                          )}
                          {model.customAdded && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                              سفارشی
                            </span>
                          )}
                        </div>
                        <a
                          href={model.hfUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                        >
                          <span>{model.id}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {isActive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1 shrink-0">
                          <Check className="w-3 h-3" />
                          {isFa ? 'مدل فعال' : 'Active'}
                        </span>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectModel(model);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer shrink-0"
                        >
                          {isFa ? 'انتخاب' : 'Select'}
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isFa ? model.descriptionFa : model.descriptionEn}
                    </p>
                  </div>

                  {/* Architectural Badges */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <div className="bg-slate-900 p-1.5 rounded text-center">
                      <span className="text-slate-500 block">پارامتر:</span>
                      <span className="font-bold text-amber-400">{model.paramSize}</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded text-center">
                      <span className="text-slate-500 block">توجه / KV:</span>
                      <span className="font-bold text-indigo-300">{model.attentionType} ({model.numKvHeads}H)</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded text-center">
                      <span className="text-slate-500 block">خردشدگی فارسی:</span>
                      <span className={`font-bold ${model.persianFertility <= 2 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {model.persianFertility}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & active model summary */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{isFa ? 'مدل فعال کنونی:' : 'Currently Active Model:'}</span>
            <strong className="text-amber-400 font-mono">{activeModel.name} ({activeModel.paramSize})</strong>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
          >
            {isFa ? 'تأیید و بازگشت به آزمایشگاه' : 'Confirm & Return'}
          </button>
        </div>
      </div>
    </div>
  );
};
