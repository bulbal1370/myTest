import React, { useState } from 'react';
import { 
  ListOrdered, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  FolderGit2, 
  Search,
  Filter,
  ShieldCheck,
  Binary
} from 'lucide-react';
import { FINDINGS_REGISTRY } from '../data/benchmarkSuite';
import { FindingRecord } from '../types';

interface FindingsTabProps {
  lang: 'fa' | 'en';
}

export const FindingsTab: React.FC<FindingsTabProps> = ({ lang }) => {
  const isFa = lang === 'fa';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFindings = FINDINGS_REGISTRY.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.id.toLowerCase().includes(q) ||
        f.claimEn.toLowerCase().includes(q) ||
        f.claimFa.toLowerCase().includes(q) ||
        f.modelDataset.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isFa 
                ? 'رجیستری مستند یافته‌ها (Findings Registry F1 - F13)' 
                : 'Empirical Findings Registry (F1 - F13)'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Traceability Rule III
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {isFa
              ? 'طبق اصل سوم منشور پژوهش (Constitution Principle III): «هیچ عددی بدون مسیر results/ در گزارش نوشته نمی‌شود». تمام ادعاهای رساله در این رجیستری با شناسه یکتا، مدل آزمایش‌شده، عدد کلیدی و مسیر فایل شاهد ثبت شده‌اند.'
              : 'Every claim in your dissertation is tracked with a unique ID, reproducible metric, evaluated model family, and exact results/ file path.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{isFa ? 'فیلتر وضعیت:' : 'Filter Status:'}</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 cursor-pointer"
          >
            <option value="all">{isFa ? 'همه یافته‌ها' : 'All Findings'}</option>
            <option value="verified">{isFa ? 'تأییدشده و قطعی (Verified)' : 'Verified'}</option>
            <option value="pilot">{isFa ? 'پایلوت در حال گسترش (Pilot)' : 'Pilot'}</option>
            <option value="analytical">{isFa ? 'اثبات تحلیلی (Analytical)' : 'Analytical'}</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={isFa ? 'جستجو در یافته‌ها یا مدل‌ها...' : 'Search findings or models...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-xs pr-8 pl-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFindings.map(f => (
          <div 
            key={f.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-black font-mono text-xs border border-indigo-500/30">
                    {f.id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {f.modelDataset}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                  f.status === 'verified'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : f.status === 'pilot'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                }`}>
                  {f.status}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                {isFa ? f.claimFa : f.claimEn}
              </h3>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-amber-400 font-bold">
                {f.keyNumber}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300">{isFa ? 'اهمیت در رساله: ' : 'Implication: '}</strong>
                {f.implication}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{f.evidencePath}</span>
              </span>
              <span className="text-slate-400">reproducible</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
