import React, { useState } from 'react';
import { 
  Sparkles, 
  FlaskConical, 
  BarChart3, 
  FileText, 
  BrainCircuit, 
  ListOrdered,
  BookOpen,
  Eye,
  Sliders,
  Check,
  Shapes,
  Palette,
  Bot,
  Cpu,
  Database,
  Activity
} from 'lucide-react';
import { AccessibilitySettings, ColorBlindMode, HFModelConfig } from '../types';
import { ConceptTooltip } from './ConceptTooltip';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  onOpenProposalExport: () => void;
  onOpenGlossary?: () => void;
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  activeModel: HFModelConfig;
  onOpenModelManager: () => void;
  onOpenDatasetManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenProposalExport,
  onOpenGlossary,
  accessibility,
  setAccessibility,
  activeModel,
  onOpenModelManager,
  onOpenDatasetManager
}) => {
  const isFa = lang === 'fa';
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState<boolean>(false);

  const colorBlindModes: { id: ColorBlindMode; labelFa: string; labelEn: string; descFa: string; descEn: string; colorDot: string }[] = [
    {
      id: 'standard',
      labelFa: 'استاندارد پیش‌فرض (Vibrant)',
      labelEn: 'Standard Vibrant',
      descFa: 'رنگ‌های سبز، قرمز، بنفش و زرد عادی',
      descEn: 'Standard full spectrum colors',
      colorDot: 'bg-emerald-500'
    },
    {
      id: 'deuteranopia',
      labelFa: 'قرمز-سبز (Deuteranopia / Protanopia)',
      labelEn: 'Red-Green (Deuteranopia / Protan)',
      descFa: 'پالت استاندارد Okabe-Ito (آبی، نارنجی، کهربایی، خاکستری). بدون تکیه به تمایز قرمز و سبز!',
      descEn: 'Okabe-Ito palette: Blue/Orange/Amber. Eliminates red-green confusion.',
      colorDot: 'bg-blue-500'
    },
    {
      id: 'tritanopia',
      labelFa: 'آبی-زرد (Tritanopia)',
      labelEn: 'Blue-Yellow (Tritanopia)',
      descFa: 'پالت ارغوانی/ماژنتا و فیروزه‌ای/سبزآبی با تمایز بالا',
      descEn: 'Teal/Cyan and Magenta/Rose high contrast palette',
      colorDot: 'bg-fuchsia-500'
    },
    {
      id: 'high_contrast',
      labelFa: 'تک‌رنگ کنتراست فوق‌العاده (High Contrast)',
      labelEn: 'High Contrast Monochrome',
      descFa: 'سیاه، سفید، زرد نئونی و کادرهای ضخیم با بافت خط‌چین و دوخط',
      descEn: 'Pure black, white, neon yellow with dashed/double tactile borders',
      colorDot: 'bg-yellow-400'
    }
  ];

  const simulationOptions = [
    { id: 'none', label: isFa ? 'بدون فیلتر شبیه‌ساز' : 'No Simulation' },
    { id: 'deuteranopia', label: isFa ? 'شبیه‌سازی دوتِرانوبیا (سبز-کور)' : 'Simulate Deuteranopia' },
    { id: 'protanopia', label: isFa ? 'شبیه‌سازی پروتانوبیا (قرمز-کور)' : 'Simulate Protanopia' },
    { id: 'tritanopia', label: isFa ? 'شبیه‌سازی تریتانوبیا (آبی-کور)' : 'Simulate Tritanopia' },
    { id: 'achromatopsia', label: isFa ? 'شبیه‌سازی آکروماتوپسی (سیاه‌وسفید)' : 'Simulate Achromatopsia' }
  ];

  const navItems = [
    {
      id: 'playground',
      labelFa: 'تب ۱: ارزیابی ایده (Future-KL در انزوا)',
      labelEn: 'Tab 1: Future-KL Idea in Isolation',
      icon: FlaskConical,
      badge: 'Core Idea'
    },
    {
      id: 'benchmark',
      labelFa: 'تب ۲: مقایسه ۲۲ روش مقالات روی داده',
      labelEn: 'Tab 2: SOTA Comparison on Data',
      icon: BarChart3,
      badge: '22 Literature Methods'
    },
    {
      id: 'architecture',
      labelFa: 'کاوشگر KV Cache و اتنشن (GQA & لایه‌ها)',
      labelEn: 'KV Cache & Attention (GQA/Layers)',
      icon: Cpu,
      badge: 'GQA & SWA'
    },
    {
      id: 'generation',
      labelFa: 'سنجش کیفیت متن تولیدشده (Text Gen & Diff)',
      labelEn: 'Text Generation & Token Degradation',
      icon: Sparkles,
      badge: 'Text Gen & Diff'
    },
    {
      id: 'stress',
      labelFa: 'آزمون شرایط مرزی و کوانتایز (VRAM & Depth)',
      labelEn: 'Stress & Quantization Lab (VRAM/Depth)',
      icon: Activity,
      badge: 'FP8/INT4 & 131k'
    },
    {
      id: 'insights',
      labelFa: 'تحلیل گسست مداخله و زبان',
      labelEn: 'Intervention Mismatch & Fertility',
      icon: BrainCircuit,
      badge: 'Core Theory'
    },
    {
      id: 'proposal',
      labelFa: 'استودیوی پروپوزال دکتری',
      labelEn: 'PhD Proposal Studio',
      icon: FileText,
      badge: 'Proposal Ready'
    },
    {
      id: 'imozuru',
      labelFa: 'تحقیق ریشه‌ای ایموزورو (Primary Sources & Quotes)',
      labelEn: 'Imozuru Librarian Deep Research',
      icon: BookOpen,
      badge: 'Imozuru Vine'
    },
    {
      id: 'findings',
      labelFa: 'رجیستری یافته‌ها (F1-F13)',
      labelEn: 'Findings Registry',
      icon: ListOrdered,
      badge: 'Evidence Tree'
    }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg">
              Ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ConceptTooltip term="future_kl" showIndicator={false}>
                  <span className="font-bold text-base text-white tracking-tight hover:text-indigo-300 transition-colors">
                    Future-KL Lab
                  </span>
                </ConceptTooltip>
                <ConceptTooltip term="causal_utility" showIndicator={false}>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:border-indigo-400 transition-colors">
                    Idea6 • KV-Utility
                  </span>
                </ConceptTooltip>
                <ConceptTooltip term="kv_cache" showIndicator={false}>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-400 transition-colors">
                    PhD Testbed
                  </span>
                </ConceptTooltip>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                {isFa 
                  ? 'آزمایشگاه سنجش علّی اهمیت توکن در KV-Cache و مقایسه با ۲۲ روش SOTA'
                  : 'Causal Token Utility Oracle & Benchmark against 22 Literature Baselines'}
              </p>
            </div>
          </div>

          {/* Right Tools: Model Selector, Color-Blind Settings, Lang switch & Export Proposal CTA */}
          <div className="flex items-center gap-2 relative">
            {/* Active Hugging Face Model Button */}
            <button
              onClick={onOpenModelManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50 transition cursor-pointer"
              title={isFa ? 'تغییر یا بارگذاری مدل جدید از Hugging Face' : 'Change or load new model from Hugging Face'}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-amber-300 font-bold hidden xs:inline">{activeModel.name.split('(')[0].trim()}</span>
              <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">{activeModel.paramSize}</span>
            </button>

            {/* Hugging Face Dataset Manager Button */}
            <button
              onClick={onOpenDatasetManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition cursor-pointer"
              title={isFa ? 'مدیریت و بارگذاری دیتاست از Hugging Face' : 'Import or manage Hugging Face datasets'}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300 font-semibold hidden sm:inline">{isFa ? 'دیتاست HF' : 'HF Data'}</span>
            </button>

            {/* Color Blind Accessibility Button */}
            <div className="relative">
              <button
                onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  accessibility.mode !== 'standard' || accessibility.simulationFilter !== 'none'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="تنظیمات دسترسی‌پذیری برای کوررنگی (Color Blindness Mode)"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {isFa ? 'دسترس‌پذیری کوررنگی' : 'Color-Blind'}
                </span>
                {accessibility.mode !== 'standard' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              {/* Popover Menu */}
              {showAccessibilityMenu && (
                <div 
                  className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-50 space-y-3.5 text-xs text-right"
                  dir={isFa ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-400" />
                      {isFa ? 'تنظیمات کوررنگی و دید رنگی' : 'Color Vision Deficiency Settings'}
                    </span>
                    <button
                      onClick={() => setShowAccessibilityMenu(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      {isFa ? 'انتخاب پالت بهینه‌شده برای دید شما:' : 'Select Optimized Palette:'}
                    </label>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {colorBlindModes.map(m => {
                        const isCurrent = accessibility.mode === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setAccessibility(prev => ({ ...prev, mode: m.id }))}
                            className={`w-full text-right p-2 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                              isCurrent
                                ? 'bg-indigo-950/80 border-indigo-500 text-white font-medium ring-1 ring-indigo-500'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ${m.colorDot}`}></span>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 text-xs">
                                  {isFa ? m.labelFa : m.labelEn}
                                </span>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                {isFa ? m.descFa : m.descEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle Shape Symbols */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {isFa ? 'نمایش برچسب‌ها و اشکال صریح' : 'Explicit Shape Symbols (WCAG)'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isFa ? 'نمایش علائم [✓], [✗], [🎯], [★] در کنار رنگ‌ها' : 'Always show symbols like [✓], [✗], [🎯]'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={accessibility.showSymbols}
                      onChange={e => setAccessibility(prev => ({ ...prev, showSymbols: e.target.checked }))}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Simulator Filter Tool for Researchers */}
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      {isFa ? 'شبیه‌ساز زنده دید کوررنگی (ابزار تحقیق):' : 'Live Colorblind Simulator Filter:'}
                    </label>
                    <select
                      value={accessibility.simulationFilter}
                      onChange={e => setAccessibility(prev => ({ ...prev, simulationFilter: e.target.value as any }))}
                      className="w-full text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 cursor-pointer"
                    >
                      {simulationOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">
                      {isFa ? 'کل صفحه را با فیلتر کوررنگی شبیه‌سازی می‌کند تا دسترس‌پذیری را بیازمایید.' : 'Applies an SVG color-deficiency matrix filter to test accessibility.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {onOpenGlossary && (
              <button
                onClick={onOpenGlossary}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition cursor-pointer shadow-sm hover:border-indigo-500"
                title={isFa ? 'دانشنامه و دیکشنری تعاملی مفاهیم فنی (با کلیک یا هوور)' : 'Interactive Concept Dictionary'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isFa ? 'دانشنامه مفاهیم' : 'Glossary'}</span>
              </button>
            )}

            <button
              onClick={onOpenProposalExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-500/20 transition-all cursor-pointer font-bold"
              title="خروجی پیش‌نویس پروپوزال برای دانشگاه"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isFa ? 'پیش‌نویس پروپوزال' : 'Proposal Draft'}</span>
            </button>

            <button
              onClick={() => setLang(isFa ? 'en' : 'fa')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              {isFa ? 'English' : 'فارسی'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 space-x-reverse overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{isFa ? item.labelFa : item.labelEn}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
