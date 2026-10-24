export type InterventionScheme = 'evict' | 'remove' | 'zero';
export type DivergenceMetric = 'kl' | 'reverse_kl' | 'jsd';
export type NormalizationMethod = 'max' | 'minmax' | 'softmax' | 'zscore';

export type ColorBlindMode = 'standard' | 'deuteranopia' | 'tritanopia' | 'high_contrast';

export interface AccessibilitySettings {
  mode: ColorBlindMode;
  showSymbols: boolean; // Always show icons/shapes in addition to color
  highContrastBorders: boolean;
  simulationFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

export interface HFModelConfig {
  id: string; // Hugging Face repo ID e.g. "Qwen/Qwen2.5-0.5B-Instruct"
  name: string;
  family: 'qwen' | 'llama' | 'gemma' | 'gpt2' | 'phi' | 'mistral' | 'custom';
  paramSize: string; // e.g. "0.49B", "1.5B", "124M"
  contextLength: number;
  attentionType: 'MHA' | 'GQA' | 'Hybrid_Sliding';
  numLayers: number;
  numAttentionHeads: number;
  numKvHeads: number;
  vocabSize: number;
  persianFertility: number; // Avg tokens per Persian word (lower = better, e.g. 1.8 for Qwen vs 5.2 for GPT-2)
  englishFertility: number; // Avg tokens per English word (~1.2)
  positionalEncoding: 'RoPE' | 'Absolute_Learned' | 'ALiBi';
  isLightweight: boolean;
  isDefault: boolean;
  hfUrl: string;
  descriptionFa: string;
  descriptionEn: string;
  customAdded?: boolean;
}

export interface TokenItem {
  id: number;
  text: string;
  isSink: boolean;
  isEvidence: boolean;
  divergenceSum: number;
  normalizedImportance: number;
  isRetainedByMethod: Record<string, boolean>;
}

export interface IdeaConfig {
  mHorizon: number; // Configurable future horizon e.g. 5 to 500
  budgetPercent: number; // KV Cache retention budget e.g. 5 to 80%
  intervention: InterventionScheme; // 'evict' | 'remove' | 'zero'
  metric: DivergenceMetric; // 'kl' | 'reverse_kl' | 'jsd'
  normalization: NormalizationMethod; // 'max' | 'minmax' | 'softmax' | 'zscore'
  temperature: number; // for softmax calibration (e.g. 0.1 to 2.0)
  sinkCount: number; // Attention sink tokens 0, 1, 2, 4, 8
}

export interface PromptSample {
  id: string;
  title: string;
  titleFa: string;
  category: 'synth_niah' | 'math_hard_think' | 'tool_call' | 'persian_fertility' | 'qa_short' | 'qa_multidoc' | 'chat_multiturn' | 'code' | 'custom';
  language: 'fa' | 'en';
  lengthType: 'short' | 'medium' | 'long';
  approxTokenCount: number;
  prompt: string;
  fixedContinuation: string;
  evidenceIndices: number[];
  needle?: string;
  hasThinking?: boolean;
  thinkingTrace?: string;
  hasTools?: boolean;
  toolsSchema?: string;
  description: string;
}

export interface SimulationResult {
  tokens: TokenItem[];
  m_eff: number;
  divergenceMatrix: number[][]; // [N, m]
  maxImportance: number;
  meanImportance: number;
  retainedCount: number;
  totalTokens: number;
  budgetRatio: number;
  evidenceRecall: number;
  estimatedFutureKl: number;
  estimatedDeltaNll: number;
  runtimeMs: number;
}

export interface KVMethodInfo {
  id: string;
  name: string;
  category: 'retained_kv' | 'active_attention' | 'baseline' | 'oracle';
  citation: string;
  year: number;
  conference: string;
  futureKl: number; // lower is better
  deltaNll: number; // lower is better
  evidenceRecall: number; // higher is better (0-1)
  kvAllocRatio: number; // fraction of KV retained
  mechanism: string;
  strengths: string;
  weaknesses: string;
  status: 'implemented' | 'not_applicable' | 'oracle_upper_bound';
}

export interface ResearchQuestion {
  id: string;
  question: string;
  questionFa: string;
  status: 'validated' | 'partially_validated' | 'in_progress';
  axis: 'A' | 'B' | 'C' | 'D';
  keyFindingId: string;
  findingSummary: string;
  findingSummaryFa: string;
  evidenceArtifact: string;
  metricComparison: string;
}

export interface FindingRecord {
  id: string;
  claimEn: string;
  claimFa: string;
  modelDataset: string;
  keyNumber: string;
  evidencePath: string;
  status: 'verified' | 'pilot' | 'analytical' | 'remediated';
  implication: string;
}

export interface SlidingWindowConfig {
  enabled: boolean;
  windowSize: number; // e.g. 16, 32, 64, 128, 256, 512
  sinkSize: number;   // initial sinks protected
}

export interface KVCacheBlock {
  blockId: number;
  layer: number;
  kvHead: number;
  tokenIndices: number[];
  tokenTexts: string[];
  status: 'active' | 'evicted' | 'sink' | 'needle';
  keyNorm: number;
  valueNorm: number;
  memoryBytes: number;
}

export interface LayerAttentionData {
  layer: number;
  head: number;
  kvHeadIndex: number; // mapped GQA head
  matrix: number[][]; // [N, N] query x key
  retainedMatrix: number[][]; // [N, N] after eviction
  headSparsity: number;
  headEntropy: number;
}

export interface LayerBudgetProfile {
  layer: number;
  uniformBudget: number;
  pyramidBudget: number;
  adaKvBudget: number;
  streamingBudget: number;
  futureKlBudget: number;
}

export interface GeneratedToken {
  id: number;
  text: string;
  logprob: number;
  probability: number;
  isMatch: boolean; // Matches ground truth / dense token
  isNeedle: boolean; // Part of critical needle / key fact
  isHallucinated: boolean; // Diverges due to missing KV context
  isDegenerate: boolean; // Loop or repeated token
  topKAlternatives?: { token: string; prob: number }[];
}

export interface GenerationEvaluationResult {
  methodId: string;
  methodName: string;
  methodCategory: 'oracle' | 'retained_kv' | 'baseline' | 'dense';
  generatedText: string;
  tokens: GeneratedToken[];
  metrics: {
    rouge1: number; // 0-1
    rouge2: number; // 0-1
    rougeL: number; // 0-1
    bleu4: number; // 0-1
    needleFound: boolean;
    needleConfidence: number; // 0-100%
    perplexityRatio: number; // PPL_method / PPL_dense (1.0 = equal, >1 = worse)
    repetitionRate: number; // % of repeating 3-grams
    hallucinationRate: number; // % of deviated tokens
    kvMemorySavedMb: number;
    kvBudgetPercent: number;
    generationLatencyMs: number;
  };
  errorType: 'none' | 'arithmetic_drift' | 'needle_loss' | 'json_syntax_break' | 'repetition_loop' | 'subtoken_split_error';
  diagnosticExplanationFa: string;
  diagnosticExplanationEn: string;
}

export interface ImozuruCitation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  arxivId: string;
  url: string;
  coreContributionFa: string;
  coreContributionEn: string;
  significanceForFutureKl: string;
}

export interface ImozuruExtract {
  id: string;
  paperId: string;
  verbatimQuote: string;
  section: string;
  claimId: string; // F1..F13 or RQ1..RQ4
  claimSummaryFa: string;
  claimSummaryEn: string;
  imozuruVineLead: string; // What lead this quote opened up
}

export interface ImozuruHypothesisSubagent {
  id: 'subagent_causal' | 'subagent_latency';
  nameFa: string;
  nameEn: string;
  avatarIcon: string;
  stance: string;
  hypothesisFa: string;
  hypothesisEn: string;
  evidencePointsFa: string[];
  evidencePointsEn: string[];
  primaryExtractIds: string[];
  counterArgumentsFa: string[];
  counterArgumentsEn: string[];
  resolutionVerdictFa: string;
  resolutionVerdictEn: string;
}

export interface ImozuruConceptNode {
  id: string;
  termEn: string;
  termFa: string;
  category: 'mechanism' | 'anomaly' | 'architectural' | 'causal_theory';
  definitionFa: string;
  definitionEn: string;
  originPaperId: string;
  keyResearchers: string[];
  connectedConcepts: string[];
  supportedFindings: string[];
}

export interface GlossaryEntry {
  id: string;
  termFa: string;
  termEn: string;
  pronunciation?: string;
  category: 'architecture' | 'memory' | 'information_theory' | 'metrics' | 'phd_core';
  categoryLabelFa: string;
  categoryLabelEn: string;
  simpleExplanationFa: string;
  simpleExplanationEn: string;
  technicalDetailsFa: string;
  technicalDetailsEn: string;
  concreteExampleFa: string;
  concreteExampleEn: string;
  futureKlRoleFa: string;
  futureKlRoleEn: string;
  formulaOrSyntax?: string;
  relatedTerms?: string[];
}

