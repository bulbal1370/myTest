import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PlaygroundTab } from './components/PlaygroundTab';
import { BenchmarkTab } from './components/BenchmarkTab';
import { KVCacheArchitectureInspector } from './components/KVCacheArchitectureInspector';
import { StressTestingTab } from './components/StressTestingTab';
import { DeepInsightsTab } from './components/DeepInsightsTab';
import { ProposalStudioTab } from './components/ProposalStudioTab';
import { FindingsTab } from './components/FindingsTab';
import { GenerationImpactTab } from './components/GenerationImpactTab';
import { ImozuruDeepResearchTab } from './components/ImozuruDeepResearchTab';
import { GlobalGlossaryModal } from './components/GlobalGlossaryModal';
import { 
  AccessibilitySettings, 
  HFModelConfig, 
  InterventionScheme, 
  DivergenceMetric, 
  NormalizationMethod,
  PromptSample
} from './types';
import { DEFAULT_ACCESSIBILITY, COLORBLIND_SVG_FILTERS } from './utils/accessibility';
import { DEFAULT_HF_MODELS } from './data/hfModels';
import { BENCHMARK_DATASETS } from './data/datasets';
import { runFutureKlSimulation } from './utils/futureKlEngine';
import { HFModelManagerModal } from './components/HFModelManagerModal';
import { HFDatasetManagerModal } from './components/HFDatasetManagerModal';
import { 
  Eye, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);
  
  // Hugging Face Models State
  const [modelsList, setModelsList] = useState<HFModelConfig[]>(DEFAULT_HF_MODELS);
  const [activeModel, setActiveModel] = useState<HFModelConfig>(DEFAULT_HF_MODELS[0]);
  const [showHFModal, setShowHFModal] = useState<boolean>(false);

  // Hugging Face Datasets State
  const [datasetList, setDatasetList] = useState<PromptSample[]>(() => {
    try {
      const saved = localStorage.getItem('futurekl_datasets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return BENCHMARK_DATASETS;
  });
  const [showHFDatasetModal, setShowHFDatasetModal] = useState<boolean>(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('futurekl_datasets', JSON.stringify(datasetList));
    } catch (e) {}
  }, [datasetList]);

  // Shared Dataset & Input State across Tab 1 and Tab 2
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('math_thinking_chain');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [customReferenceY, setCustomReferenceY] = useState<string>('');
  const [customHasThinking, setCustomHasThinking] = useState<boolean>(true);
  const [customHasTools, setCustomHasTools] = useState<boolean>(false);

  // Shared Idea Hyperparameters
  const [mHorizon, setMHorizon] = useState<number>(50); // Fully configurable from 5 to 500
  const [budgetPercent, setBudgetPercent] = useState<number>(20); // 5% to 80%
  const [intervention, setIntervention] = useState<InterventionScheme>('evict');
  const [metric, setMetric] = useState<DivergenceMetric>('kl');
  const [normalization, setNormalization] = useState<NormalizationMethod>('max');
  const [temperature, setTemperature] = useState<number>(1.0);
  const [sinkCount, setSinkCount] = useState<number>(4);

  const isFa = lang === 'fa';

  // Compute active prompt for architecture inspection and tab sharing
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
    const found = datasetList.find(p => p.id === selectedDatasetId) || datasetList[0] || BENCHMARK_DATASETS[0];
    return {
      ...found,
      hasThinking: customHasThinking,
      hasTools: customHasTools
    };
  }, [datasetList, selectedDatasetId, isCustom, customPromptText, customReferenceY, customHasThinking, customHasTools, isFa]);

  // Compute simulation result to pass retained tokens to Architecture Inspector
  const activeSimulation = useMemo(() => {
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

  const retainedTokenIndices = useMemo(() => {
    const s = new Set<number>();
    activeSimulation.tokens.forEach(t => {
      if (t.isRetainedByMethod.idea6_oracle) s.add(t.id);
    });
    return s;
  }, [activeSimulation]);

  const filterMatrix = accessibility.simulationFilter !== 'none' 
    ? (COLORBLIND_SVG_FILTERS as any)[accessibility.simulationFilter] 
    : null;

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white"
      style={{
        filter: filterMatrix ? 'url(#colorblind-sim-filter)' : 'none'
      }}
    >
      {/* Hidden SVG Filter for Colorblind Simulation */}
      {filterMatrix && (
        <svg className="hidden">
          <defs>
            <filter id="colorblind-sim-filter">
              <feColorMatrix type="matrix" values={filterMatrix.trim()} />
            </filter>
          </defs>
        </svg>
      )}

      {/* Accessibility Active Banner if non-standard */}
      {accessibility.mode !== 'standard' && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">
              {isFa ? 'حالت دسترسی کوررنگی فعال است:' : 'Color-Blind Mode Active:'}
            </span>
            <span className="font-mono bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60 font-bold">
              {accessibility.mode === 'deuteranopia' 
                ? (isFa ? 'قرمز-سبز (دوتِرانوبیا/پروتانوبیا - پالت Okabe-Ito)' : 'Red-Green (Deuteranopia/Protanopia)')
                : accessibility.mode === 'tritanopia'
                ? (isFa ? 'آبی-زرد (تریتانوبیا - پالت فیروزه‌ای/ماژنتا)' : 'Blue-Yellow (Tritanopia)')
                : (isFa ? 'تک‌رنگ با کنتراست فوق‌العاده بالا' : 'High Contrast Monochrome')}
            </span>
            <span className="hidden md:inline text-amber-300/80">
              {isFa ? '(تمامی رنگ‌ها با نمادهای شکلی صریح [✓], [✗], [🎯], [★] و خطوط متمایز تقویت شده‌اند)' : '(All colors reinforced with tactile symbols and patterns)'}
            </span>
          </div>
          <button
            onClick={() => setAccessibility(DEFAULT_ACCESSIBILITY)}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            {isFa ? 'بازنشانی به حالت پیش‌فرض' : 'Reset to Default'}
          </button>
        </div>
      )}

      {/* Simulator Active Notification */}
      {accessibility.simulationFilter !== 'none' && (
        <div className="bg-purple-950/80 border-b border-purple-600/40 text-purple-200 px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">
              {isFa ? 'شبیه‌ساز زنده دید کوررنگی روی صفحه فعال است:' : 'Live Colorblind Simulation Filter Active:'}
            </span>
            <span className="font-mono bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/60 font-bold">
              {accessibility.simulationFilter}
            </span>
          </div>
          <button
            onClick={() => setAccessibility(prev => ({ ...prev, simulationFilter: 'none' }))}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            {isFa ? 'خاموش کردن شبیه‌ساز' : 'Disable Simulator'}
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenProposalExport={() => setActiveTab('proposal')}
        onOpenGlossary={() => setShowGlossaryModal(true)}
        accessibility={accessibility}
        setAccessibility={setAccessibility}
        activeModel={activeModel}
        onOpenModelManager={() => setShowHFModal(true)}
        onOpenDatasetManager={() => setShowHFDatasetModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playground' && (
          <PlaygroundTab 
            lang={lang} 
            accessibility={accessibility} 
            activeModel={activeModel}
            onOpenModelManager={() => setShowHFModal(true)}
            selectedDatasetId={selectedDatasetId}
            setSelectedDatasetId={setSelectedDatasetId}
            isCustom={isCustom}
            setIsCustom={setIsCustom}
            customPromptText={customPromptText}
            setCustomPromptText={setCustomPromptText}
            customReferenceY={customReferenceY}
            setCustomReferenceY={setCustomReferenceY}
            customHasThinking={customHasThinking}
            setCustomHasThinking={setCustomHasThinking}
            customHasTools={customHasTools}
            setCustomHasTools={setCustomHasTools}
            mHorizon={mHorizon}
            setMHorizon={setMHorizon}
            budgetPercent={budgetPercent}
            setBudgetPercent={setBudgetPercent}
            intervention={intervention}
            setIntervention={setIntervention}
            metric={metric}
            setMetric={setMetric}
            normalization={normalization}
            setNormalization={setNormalization}
            temperature={temperature}
            setTemperature={setTemperature}
            sinkCount={sinkCount}
            setSinkCount={setSinkCount}
            onGoToComparativeBenchmark={() => setActiveTab('benchmark')}
            onGoToArchitecture={() => setActiveTab('architecture')}
            onGoToGeneration={() => setActiveTab('generation')}
            datasetList={datasetList}
            onOpenDatasetManager={() => setShowHFDatasetModal(true)}
          />
        )}
        {activeTab === 'benchmark' && (
          <BenchmarkTab 
            lang={lang} 
            accessibility={accessibility} 
            activeModel={activeModel}
            modelsList={modelsList}
            onOpenModelManager={() => setShowHFModal(true)}
            selectedDatasetId={selectedDatasetId}
            setSelectedDatasetId={setSelectedDatasetId}
            isCustom={isCustom}
            customPromptText={customPromptText}
            customReferenceY={customReferenceY}
            customHasThinking={customHasThinking}
            customHasTools={customHasTools}
            mHorizon={mHorizon}
            setMHorizon={setMHorizon}
            budgetPercent={budgetPercent}
            setBudgetPercent={setBudgetPercent}
            intervention={intervention}
            metric={metric}
            normalization={normalization}
            temperature={temperature}
            sinkCount={sinkCount}
            onGoToIdeaTab={() => setActiveTab('playground')}
            onGoToArchitecture={() => setActiveTab('architecture')}
            datasetList={datasetList}
            onOpenDatasetManager={() => setShowHFDatasetModal(true)}
          />
        )}
        {activeTab === 'architecture' && (
          <KVCacheArchitectureInspector
            lang={lang}
            accessibility={accessibility}
            activeModel={activeModel}
            activePrompt={activePrompt}
            retainedTokenIndices={retainedTokenIndices}
            budgetPercent={budgetPercent}
            onOpenModelManager={() => setShowHFModal(true)}
            hasThinking={customHasThinking}
            setHasThinking={setCustomHasThinking}
            hasTools={customHasTools}
            setHasTools={setCustomHasTools}
          />
        )}
        {activeTab === 'generation' && (
          <GenerationImpactTab
            lang={lang}
            accessibility={accessibility}
            activeModel={activeModel}
            activePrompt={activePrompt}
            budgetPercent={budgetPercent}
            setBudgetPercent={setBudgetPercent}
            mHorizon={mHorizon}
            setMHorizon={setMHorizon}
            temperature={temperature}
            setTemperature={setTemperature}
            sinkCount={sinkCount}
            setSinkCount={setSinkCount}
            datasetList={datasetList}
            selectedDatasetId={selectedDatasetId}
            setSelectedDatasetId={setSelectedDatasetId}
            onOpenModelManager={() => setShowHFModal(true)}
            onOpenDatasetManager={() => setShowHFDatasetModal(true)}
          />
        )}
        {activeTab === 'stress' && (
          <StressTestingTab
            lang={lang}
            accessibility={accessibility}
            activeModel={activeModel}
            activePrompt={activePrompt}
            budgetPercent={budgetPercent}
            mHorizon={mHorizon}
            onOpenModelManager={() => setShowHFModal(true)}
            onOpenDatasetManager={() => setShowHFDatasetModal(true)}
          />
        )}
        {activeTab === 'insights' && <DeepInsightsTab lang={lang} />}
        {activeTab === 'proposal' && <ProposalStudioTab lang={lang} />}
        {activeTab === 'imozuru' && (
          <ImozuruDeepResearchTab
            lang={lang}
            accessibility={accessibility}
          />
        )}
        {activeTab === 'findings' && <FindingsTab lang={lang} />}
      </main>

      {/* Hugging Face Model Manager Modal */}
      <HFModelManagerModal
        isOpen={showHFModal}
        onClose={() => setShowHFModal(false)}
        activeModel={activeModel}
        onSelectModel={(model) => {
          setActiveModel(model);
          setShowHFModal(false);
        }}
        modelsList={modelsList}
        setModelsList={setModelsList}
        lang={lang}
      />

      {/* Hugging Face Dataset Manager Modal */}
      <HFDatasetManagerModal
        isOpen={showHFDatasetModal}
        onClose={() => setShowHFDatasetModal(false)}
        datasetList={datasetList}
        setDatasetList={setDatasetList}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={(id) => {
          setSelectedDatasetId(id);
          setIsCustom(false);
        }}
        lang={lang}
      />

      {/* Global Concept Glossary Modal */}
      <GlobalGlossaryModal
        isOpen={showGlossaryModal}
        onClose={() => setShowGlossaryModal(false)}
        lang={lang}
      />

      {/* Floating Interactive Glossary Button */}
      <button
        onClick={() => setShowGlossaryModal(true)}
        className="fixed bottom-6 left-6 rtl:left-6 rtl:right-auto z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
        title={isFa ? 'دانشنامه و دیکشنری تعاملی مفاهیم تخصصی' : 'Interactive Concept Dictionary'}
      >
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
        <span className="hidden sm:inline font-sans">{isFa ? 'واژه‌نامه و راهنمای مفاهیم' : 'Concept Glossary'}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      </button>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Future-KL Lab • Spec-Driven Research Repository</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-500">Qwen2.5 • Gemma-3 • Llama-3 Benchmarks</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">WCAG 2.1 Color-Blind Accessible</span>
          </div>
          <p className="text-slate-600">
            طراحی شده برای تست و اعتبارسنجی ایده و تدوین پروپوزال دکتری مهندسی کامپیوتر و هوش مصنوعی
          </p>
        </div>
      </footer>
    </div>
  );
}
