import React, { useState, useRef, useEffect } from 'react';
import { GLOSSARY_DICTIONARY } from '../data/glossaryData';
import { GlossaryEntry } from '../types';
import {
  Sparkles,
  Lightbulb,
  FileCode,
  Target,
  ExternalLink,
  HelpCircle,
  X,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';

interface ConceptTooltipProps {
  term: string; // key in GLOSSARY_DICTIONARY
  children?: React.ReactNode;
  showIndicator?: boolean; // show subtle dashed underline
  className?: string;
  side?: 'top' | 'bottom' | 'auto';
  onExploreTerm?: (termId: string) => void;
}

export const ConceptTooltip: React.FC<ConceptTooltipProps> = ({
  term,
  children,
  showIndicator = true,
  className = '',
  side = 'auto',
  onExploreTerm
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTermId, setActiveTermId] = useState<string>(term);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: true
  });

  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<any>(null);

  // Sync active term when prop changes
  useEffect(() => {
    setActiveTermId(term);
  }, [term]);

  const entry: GlossaryEntry | undefined = GLOSSARY_DICTIONARY[activeTermId] || GLOSSARY_DICTIONARY[term];

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 380;
    const popoverHeight = 360;

    let placeAbove = true;
    if (side === 'bottom') {
      placeAbove = false;
    } else if (side === 'top') {
      placeAbove = true;
    } else {
      // auto: if there isn't enough space above, place below
      placeAbove = rect.top >= popoverHeight + 20;
    }

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Boundary checks
    if (left < 15) left = 15;
    if (left + popoverWidth > window.innerWidth - 15) {
      left = window.innerWidth - popoverWidth - 15;
    }

    const top = placeAbove 
      ? rect.top - 10 
      : rect.bottom + 10;

    setPopoverPos({ top, left, placeAbove });
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveTermId(term); // reset
    }, 250);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  if (!entry) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`inline-flex items-center cursor-help group transition-colors relative ${className} ${
        showIndicator ? 'border-b border-dashed border-indigo-400/60 hover:border-indigo-400 hover:text-indigo-300' : ''
      }`}
    >
      <span>{children || entry.termFa}</span>
      {showIndicator && (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 rtl:mr-1 rtl:ml-0 inline-block text-indigo-400">
          <HelpCircle className="w-3 h-3 inline" />
        </span>
      )}

      {/* Popover Portal */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'fixed',
            top: popoverPos.placeAbove ? undefined : `${popoverPos.top}px`,
            bottom: popoverPos.placeAbove ? `${window.innerHeight - popoverPos.top}px` : undefined,
            left: `${popoverPos.left}px`,
            width: '380px',
            maxWidth: 'calc(100vw - 30px)',
            zIndex: 99999
          }}
          className="rounded-2xl border border-indigo-500/40 bg-slate-950/95 backdrop-blur-xl shadow-2xl p-5 text-slate-200 text-xs animate-scaleIn pointer-events-auto select-text font-sans"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {entry.categoryLabelFa}
                </span>
                {entry.pronunciation && (
                  <span className="text-[10px] font-mono text-slate-400 dir-ltr">
                    {entry.pronunciation}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-white mt-1">
                {entry.termFa}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 dir-ltr text-right">
                {entry.termEn}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 mt-3 max-h-[380px] overflow-y-auto pr-1">
            {/* 1. به زبان ساده و روان */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>به زبان ساده یعنی چه؟</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {entry.simpleExplanationFa}
              </p>
            </div>

            {/* 2. مثال ملموس و عینی */}
            <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/40 p-3 space-y-1">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>مثال ملموس و روزمره:</span>
              </span>
              <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                {entry.concreteExampleFa}
              </p>
            </div>

            {/* 3. جزئیات فنی و فرمول */}
            <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/40 p-3 space-y-1.5">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>جزئیات فنی و دقیق علمی:</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {entry.technicalDetailsFa}
              </p>
              {entry.formulaOrSyntax && (
                <div className="mt-1 font-mono text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800 text-indigo-300 dir-ltr text-center overflow-x-auto">
                  {entry.formulaOrSyntax}
                </div>
              )}
            </div>

            {/* 4. نقش در این رساله دکتری */}
            <div className="rounded-xl bg-purple-950/20 border border-purple-900/40 p-3 space-y-1">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>نقش در این پروژه دکتری (Future-KL):</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {entry.futureKlRoleFa}
              </p>
            </div>

            {/* Related Terms (Interactive Pills) */}
            {entry.relatedTerms && entry.relatedTerms.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  مفاهیم وابسته (کلیک برای مشاهده):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.relatedTerms.map((relId) => {
                    const relEntry = GLOSSARY_DICTIONARY[relId];
                    if (!relEntry) return null;
                    return (
                      <button
                        key={relId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTermId(relId);
                        }}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                      >
                        {relEntry.termFa.split('(')[0].trim()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
};
