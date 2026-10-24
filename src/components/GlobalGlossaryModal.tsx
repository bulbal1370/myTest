import React, { useState } from 'react';
import { GLOSSARY_DICTIONARY } from '../data/glossaryData';
import { GlossaryEntry } from '../types';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  Lightbulb,
  FileCode,
  Target,
  Layers,
  HelpCircle,
  Cpu,
  Activity,
  Flame,
  Check
} from 'lucide-react';

interface GlobalGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const GlobalGlossaryModal: React.FC<GlobalGlossaryModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const isFa = lang === 'fa';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>('kv_cache');

  if (!isOpen) return null;

  const entries = Object.values(GLOSSARY_DICTIONARY);

  const categories = [
    { id: 'all', labelFa: 'همه مفاهیم (All)', labelEn: 'All Concepts' },
    { id: 'phd_core', labelFa: 'سنگ بنای دکتری (Future-KL)', labelEn: 'PhD Core' },
    { id: 'memory', labelFa: 'حافظه و کشینگ KV', labelEn: 'Memory & KV Cache' },
    { id: 'architecture', labelFa: 'معماری ترانسفورمر', labelEn: 'Transformer Architecture' },
    { id: 'metrics', labelFa: 'متریک‌های ارزیابی NLP', labelEn: 'NLP Metrics' },
    { id: 'information_theory', labelFa: 'نظریه اطلاعات و آمار', labelEn: 'Information Theory' }
  ];

  const filteredEntries = entries.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      e.termFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.termEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.simpleExplanationFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.concreteExampleFa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeEntry = GLOSSARY_DICTIONARY[selectedTermId] || filteredEntries[0] || entries[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir={isFa ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>{isFa ? 'دانشنامه و دیکشنری تعاملی مفاهیم تخصصی' : 'Interactive Concept Dictionary & Explainer'}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {entries.length} {isFa ? 'اصطلاح' : 'Terms'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'توضیحات ساده، روان، دقیق و ملموس همراه با مثال‌های روزمره برای تمام اصطلاحات فنی پروژه'
                  : 'Plain-language, technical deep-dives, and everyday analogies for every project term'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در اصطلاحات، مثال‌ها، تعاریف...' : 'Search terms, examples...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {isFa ? c.labelFa : c.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Left Master List (4 cols) vs Right Detail Pane (8 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Master Terms List */}
          <div className="md:col-span-5 border-r border-slate-800/80 rtl:border-r-0 rtl:border-l overflow-y-auto p-3 space-y-1.5 max-h-[60vh]">
            {filteredEntries.map((e) => {
              const isSelected = activeEntry.id === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedTermId(e.id)}
                  className={`w-full text-left rtl:text-right p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                      : 'border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-sans">
                        {e.termFa.split('(')[0].trim()}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 dir-ltr text-right">
                      {e.termEn}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                    {e.categoryLabelFa}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail Pane */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 max-h-[60vh] bg-slate-950/20">
            {activeEntry && (
              <div className="space-y-5 animate-fadeIn">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {activeEntry.categoryLabelFa}
                    </span>
                    {activeEntry.pronunciation && (
                      <span className="text-xs font-mono text-slate-400 dir-ltr">
                        {activeEntry.pronunciation}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white mt-2">
                    {activeEntry.termFa}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 dir-ltr text-right mt-0.5">
                    {activeEntry.termEn}
                  </p>
                </div>

                {/* 1. به زبان ساده و روان */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-amber-300 flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>به زبان ساده و خودمانی یعنی چه؟</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {activeEntry.simpleExplanationFa}
                  </p>
                </div>

                {/* 2. مثال ملموس و عینی */}
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-900/40 p-4 space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-xs">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>مثال ملموس و روزمره:</span>
                  </h4>
                  <p className="text-emerald-100 leading-relaxed text-xs">
                    {activeEntry.concreteExampleFa}
                  </p>
                </div>

                {/* 3. جزئیات فنی و فرمول دقیق */}
                <div className="rounded-2xl bg-indigo-950/20 border border-indigo-900/40 p-4 space-y-2 shadow-sm">
                  <h4 className="font-bold text-indigo-300 flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>جزئیات دقیق فنی و معماری:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {activeEntry.technicalDetailsFa}
                  </p>
                  {activeEntry.formulaOrSyntax && (
                    <div className="mt-2 font-mono text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-indigo-300 dir-ltr text-center">
                      {activeEntry.formulaOrSyntax}
                    </div>
                  )}
                </div>

                {/* 4. نقش در رساله دکتری Future-KL */}
                <div className="rounded-2xl bg-purple-950/20 border border-purple-900/40 p-4 space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-purple-300 flex items-center gap-2 text-xs">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span>اهمیت و نقش در این رساله دکتری:</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {activeEntry.futureKlRoleFa}
                  </p>
                </div>

                {/* Related Terms */}
                {activeEntry.relatedTerms && activeEntry.relatedTerms.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 block mb-2 font-medium">
                      مفاهیم وابسته:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeEntry.relatedTerms.map((relId) => {
                        const rel = GLOSSARY_DICTIONARY[relId];
                        if (!rel) return null;
                        return (
                          <button
                            key={relId}
                            onClick={() => setSelectedTermId(relId)}
                            className="px-3 py-1 rounded-xl text-xs bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          >
                            {rel.termFa.split('(')[0].trim()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>راهنما: در سراسر صفحات، بر روی هر کلمه‌ای که دارای خط‌چین زیرین است هاور کنید تا همین توضیحات بلافاصله در پاپ‌آپ ظاهر شود.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
