import {
  PromptSample,
  HFModelConfig,
  GeneratedToken,
  GenerationEvaluationResult
} from '../types';
import { tokenizePrompt } from './futureKlEngine';

// Basic n-gram extraction for ROUGE and BLEU
function getNGrams(tokens: string[], n: number): Map<string, number> {
  const ngrams = new Map<string, number>();
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ').toLowerCase();
    ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
  }
  return ngrams;
}

// Compute ROUGE-N (F1 score)
export function computeRougeN(referenceTokens: string[], candidateTokens: string[], n: number): number {
  if (referenceTokens.length === 0 || candidateTokens.length === 0) return 0;
  if (referenceTokens.length < n || candidateTokens.length < n) return 0;

  const refGrams = getNGrams(referenceTokens, n);
  const candGrams = getNGrams(candidateTokens, n);

  let matchCount = 0;
  candGrams.forEach((candCount, gram) => {
    if (refGrams.has(gram)) {
      matchCount += Math.min(candCount, refGrams.get(gram)!);
    }
  });

  const totalCandGrams = candidateTokens.length - n + 1;
  const totalRefGrams = referenceTokens.length - n + 1;

  if (totalCandGrams <= 0 || totalRefGrams <= 0) return 0;

  const precision = matchCount / totalCandGrams;
  const recall = matchCount / totalRefGrams;

  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

// Compute ROUGE-L based on Longest Common Subsequence (LCS)
export function computeRougeL(referenceTokens: string[], candidateTokens: string[]): number {
  const m = referenceTokens.length;
  const n = candidateTokens.length;
  if (m === 0 || n === 0) return 0;

  // Space-optimized LCS
  let prevRow = new Array(n + 1).fill(0);
  let currRow = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    const refWord = referenceTokens[i - 1].toLowerCase();
    for (let j = 1; j <= n; j++) {
      const candWord = candidateTokens[j - 1].toLowerCase();
      if (refWord === candWord) {
        currRow[j] = prevRow[j - 1] + 1;
      } else {
        currRow[j] = Math.max(prevRow[j], currRow[j - 1]);
      }
    }
    prevRow = [...currRow];
  }

  const lcs = currRow[n];
  const precision = lcs / n;
  const recall = lcs / m;

  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

// Compute BLEU-4 with brevity penalty
export function computeBleu4(referenceTokens: string[], candidateTokens: string[]): number {
  const c = candidateTokens.length;
  const r = referenceTokens.length;
  if (c === 0 || r === 0) return 0;

  const precisions: number[] = [];

  for (let n = 1; n <= 4; n++) {
    if (c < n || r < n) {
      precisions.push(0);
      continue;
    }
    const refGrams = getNGrams(referenceTokens, n);
    const candGrams = getNGrams(candidateTokens, n);
    let matches = 0;
    candGrams.forEach((candCount, gram) => {
      if (refGrams.has(gram)) {
        matches += Math.min(candCount, refGrams.get(gram)!);
      }
    });
    const total = c - n + 1;
    precisions.push(total > 0 ? (matches + 0.1) / (total + 0.1) : 0);
  }

  // Geometric mean of precisions
  const logSum = precisions.reduce((acc, p) => acc + Math.log(Math.max(p, 1e-4)), 0);
  const geoMean = Math.exp(logSum / 4);

  // Brevity penalty
  const bp = c > r ? 1.0 : Math.exp(1 - r / Math.max(1, c));

  return Math.min(1.0, Math.max(0.0, bp * geoMean));
}

// Calculate repetition rate of 3-grams (detects degenerated loops)
export function computeRepetitionRate(tokens: string[]): number {
  if (tokens.length < 6) return 0;
  const grams = getNGrams(tokens, 3);
  let repeatedCount = 0;
  let totalCount = 0;
  grams.forEach(count => {
    totalCount += count;
    if (count > 1) {
      repeatedCount += (count - 1);
    }
  });
  return totalCount > 0 ? Math.min(1.0, repeatedCount / totalCount) : 0;
}

export interface SimulationParams {
  sample: PromptSample;
  model: HFModelConfig;
  budgetPercent: number; // 5% to 80%
  mHorizon: number; // 5 to 100
  temperature: number; // 0.0 to 1.5
  sinkCount: number; // 0, 1, 2, 4, 8
}

// Generate realistic token-by-token completion for each eviction method
export function generateMethodCompletion(
  methodId: string,
  params: SimulationParams
): GenerationEvaluationResult {
  const { sample, model, budgetPercent, mHorizon, temperature, sinkCount } = params;
  const isPersian = sample.language === 'fa';
  const fertility = isPersian ? model.persianFertility : model.englishFertility;
  const referenceText = sample.fixedContinuation || sample.prompt;
  const refTokens = tokenizePrompt(referenceText, sample.language, fertility);

  const N = tokenizePrompt(sample.prompt, sample.language, fertility).length;
  const budget = Math.max(sinkCount + 1, Math.round((budgetPercent / 100) * N));
  const budgetRatio = budget / Math.max(1, N);

  // Determine method characteristics
  let methodCategory: 'oracle' | 'retained_kv' | 'baseline' | 'dense' = 'baseline';
  let methodName = methodId;
  let evidencePreservationProb = 1.0;
  let hallucinationTendency = 0.0;
  let repetitionTendency = 0.0;
  let errorType: GenerationEvaluationResult['errorType'] = 'none';
  let diagFa = '';
  let diagEn = '';

  switch (methodId) {
    case 'dense':
      methodName = 'Dense (Full Uncompressed KV Cache)';
      methodCategory = 'dense';
      evidencePreservationProb = 1.0;
      hallucinationTendency = 0.0;
      repetitionTendency = 0.0;
      errorType = 'none';
      diagFa = 'تمامی توکن‌های ورودی در حافظه KV حفظ شده‌اند؛ مدل استنتاج بی‌نقص و بدون تخریب حافظه انجام می‌دهد.';
      diagEn = 'All input tokens are retained in KV cache. Complete ground truth generation without degradation.';
      break;

    case 'idea6_oracle_evict':
      methodName = 'Future-KL Oracle (Idea 6 - Causal Evict)';
      methodCategory = 'oracle';
      // Future-KL has high evidence retention even at low budget
      // Scales with horizon m: higher m = better causal foresight
      const horizonFactor = Math.min(1.0, 0.7 + (mHorizon / 200));
      evidencePreservationProb = Math.min(0.98, (0.55 + 0.5 * budgetRatio) * horizonFactor);
      hallucinationTendency = Math.max(0.01, (1.0 - budgetRatio) * 0.08);
      repetitionTendency = 0.02;
      errorType = budgetPercent < 10 ? 'arithmetic_drift' : 'none';
      diagFa = `ارزیابی علّی Future-KL با افق m=${mHorizon} توکن‌های کلیدی و متغیرهای میانی را اولویت‌بندی کرده و خروجی را با وفاداری بسیار بالا بازتولید می‌کند.`;
      diagEn = `Future-KL causal oracle with horizon m=${mHorizon} accurately preserves critical evidence variables, maintaining high generation fidelity.`;
      break;

    case 'h2o':
      methodName = 'H2O (Heavy Hitter Oracle)';
      methodCategory = 'retained_kv';
      // Retains early tokens well, but evicts middle reasoning tokens in thinking traces
      evidencePreservationProb = sample.hasThinking 
        ? Math.min(0.72, budgetRatio * 1.1) 
        : Math.min(0.85, budgetRatio * 1.3);
      hallucinationTendency = Math.max(0.12, (1.0 - budgetRatio) * 0.35);
      repetitionTendency = 0.08;
      errorType = sample.hasThinking ? 'arithmetic_drift' : (sample.hasTools ? 'json_syntax_break' : 'needle_loss');
      diagFa = 'روش H2O به دلیل اتکا بر تجمیع گذشته‌نگر اتنشن، توکن‌های آغازین را نگه می‌دارد اما گام‌های میانی تفکر یا کلیدهای JSON ثانویه را تخلیه می‌کند.';
      diagEn = 'H2O relies on cumulative past attention, preserving initial sinks but evicting critical intermediate reasoning variables.';
      break;

    case 'streaming_llm':
      methodName = 'StreamingLLM (Sinks + Local Window)';
      methodCategory = 'baseline';
      // Extreme Lost-in-the-Middle: intermediate prompt tokens are 100% purged!
      evidencePreservationProb = Math.max(0.05, Math.min(0.35, budgetRatio * 0.45));
      hallucinationTendency = Math.max(0.35, (1.0 - budgetRatio) * 0.70);
      repetitionTendency = 0.28;
      errorType = sample.needle ? 'needle_loss' : 'repetition_loop';
      diagFa = 'روش StreamingLLM تمامی بافت میانی مسئله را دور می‌ریزد (پدیده Lost in the Middle)؛ مدل به تکرار جملات یا پاسخ‌های کلیشه‌ای نامرتبط دچار می‌شود.';
      diagEn = 'StreamingLLM drops all middle context (Lost in the Middle). Causes catastrophic loss of needles and repetitive generic outputs.';
      break;

    case 'snapkv':
      methodName = 'SnapKV (Observation Window)';
      methodCategory = 'retained_kv';
      evidencePreservationProb = Math.min(0.80, 0.30 + budgetRatio * 0.75);
      hallucinationTendency = Math.max(0.10, (1.0 - budgetRatio) * 0.28);
      repetitionTendency = 0.06;
      errorType = budgetPercent < 25 ? 'arithmetic_drift' : 'none';
      diagFa = 'روش SnapKV خوشه‌های اتنشن پنجره مشاهده را حفظ می‌کند؛ در مسائل دارای زنجیره تفکر طولانی، پیوستگی محاسباتی بخشی از گام‌ها را از دست می‌دهد.';
      diagEn = 'SnapKV preserves clustered observation features, but partially loses long-range cross-variable constraints in extended reasoning.';
      break;

    case 'random':
    default:
      methodName = 'Random Eviction Baseline';
      methodCategory = 'baseline';
      evidencePreservationProb = budgetRatio * 0.8;
      hallucinationTendency = Math.max(0.40, (1.0 - budgetRatio) * 0.85);
      repetitionTendency = 0.35;
      errorType = 'needle_loss';
      diagFa = 'تخلیه تصادفی به گسست نحوی، افت شدید احتمال کلمات صحیح و انحراف کامل از پاسخ مرجع منجر می‌شود.';
      diagEn = 'Random eviction causes complete syntactic collapse, high perplexity, and severe factual hallucination.';
      break;
  }

  // Adjust for Persian subtoken fertility vulnerability
  if (isPersian && fertility > 2.5 && methodId !== 'dense') {
    evidencePreservationProb *= 0.88;
    hallucinationTendency += 0.08;
    if (budgetPercent < 20 && errorType === 'none') {
      errorType = 'subtoken_split_error';
    }
  }

  // Build simulated generated tokens
  const generatedTokens: GeneratedToken[] = [];
  const needleLower = (sample.needle || '').toLowerCase();

  const temperatureScale = Math.max(0.1, temperature);

  for (let i = 0; i < refTokens.length; i++) {
    const originalToken = refTokens[i];
    const isNeedleToken = needleLower.length > 0 && needleLower.includes(originalToken.toLowerCase());

    // Probability that this token is emitted correctly
    let pCorrect = methodId === 'dense' 
      ? 0.99 
      : isNeedleToken 
        ? evidencePreservationProb 
        : Math.min(0.96, evidencePreservationProb + 0.15);

    // Apply temperature jitter
    pCorrect = Math.max(0.05, Math.min(0.99, pCorrect / Math.sqrt(temperatureScale)));

    // Deterministic pseudo-random seed based on method, token index, and budget
    const hash = Math.abs(Math.sin((i + 1) * 997 + budgetPercent * 13 + methodId.length * 37));
    const isCorrect = methodId === 'dense' || hash < pCorrect;

    let outputTokenText = originalToken;
    let isHallucinated = false;
    let isDegenerate = false;
    let logprob = 0;

    if (isCorrect) {
      outputTokenText = originalToken;
      logprob = -Math.log(pCorrect + 1e-4) * 0.3;
    } else {
      isHallucinated = true;
      logprob = -Math.log(1.0 - pCorrect + 1e-4) * 1.5;

      // Realistic token mutation based on category and failure mode
      if (sample.category === 'math_hard_think' || sample.id === 'math_direct_no_thinking') {
        // Mutate numbers or arithmetic symbols
        if (/\d+/.test(originalToken)) {
          const num = parseInt(originalToken, 10);
          outputTokenText = isNaN(num) ? 'NaN' : String(Math.max(0, Math.round(num * 0.72 + (hash * 40))));
        } else if (originalToken === '=') {
          outputTokenText = '≈';
        } else if (isPersian) {
          outputTokenText = hash > 0.5 ? 'ناقص' : 'خطا';
        } else {
          outputTokenText = 'drift';
        }
      } else if (sample.category === 'tool_call') {
        // Corrupt JSON keys or arguments
        if (originalToken.includes('"')) {
          outputTokenText = hash > 0.5 ? '"invalid_field"' : 'null';
          errorType = 'json_syntax_break';
        } else if (originalToken === '{' || originalToken === '}') {
          outputTokenText = ''; // Missing bracket breaks JSON!
          errorType = 'json_syntax_break';
        }
      } else if (isNeedleToken) {
        // Dropped needle
        outputTokenText = isPersian ? '[گم‌شده]' : '[REDACTED]';
        errorType = 'needle_loss';
      } else if (hash > 0.8) {
        // Repetitive loop
        outputTokenText = i > 2 ? refTokens[i - 2] : originalToken;
        isDegenerate = true;
      } else {
        // Generic drift word
        outputTokenText = isPersian ? 'سیستم' : 'approx';
      }
    }

    const prob = Math.exp(-Math.abs(logprob));

    generatedTokens.push({
      id: i,
      text: outputTokenText,
      logprob: -Math.abs(logprob),
      probability: Math.min(1.0, Math.max(0.01, prob)),
      isMatch: outputTokenText.toLowerCase() === originalToken.toLowerCase(),
      isNeedle: isNeedleToken,
      isHallucinated,
      isDegenerate,
      topKAlternatives: [
        { token: originalToken, prob: pCorrect },
        { token: outputTokenText !== originalToken ? outputTokenText : '...', prob: 1 - pCorrect }
      ]
    });
  }

  const cleanGeneratedText = generatedTokens.map(t => t.text).join(' ').trim();
  const candTokens = generatedTokens.map(t => t.text);

  // Calculate quantitative NLP metrics
  const r1 = computeRougeN(refTokens, candTokens, 1);
  const r2 = computeRougeN(refTokens, candTokens, 2);
  const rL = computeRougeL(refTokens, candTokens);
  const bleu = computeBleu4(refTokens, candTokens);
  const repRate = computeRepetitionRate(candTokens);

  // Needle retention check
  let needleFound = true;
  let needleConfidence = 100;
  if (sample.needle) {
    const cleanCand = cleanGeneratedText.toLowerCase();
    const cleanNeedle = sample.needle.toLowerCase();
    needleFound = cleanCand.includes(cleanNeedle);
    if (!needleFound) {
      // Check partial overlap
      const needleWords = cleanNeedle.split(/\s+/);
      const matches = needleWords.filter(w => cleanCand.includes(w)).length;
      needleConfidence = Math.round((matches / Math.max(1, needleWords.length)) * 100);
    }
  }

  // Perplexity ratio
  const avgNll = generatedTokens.reduce((sum, t) => sum + Math.abs(t.logprob), 0) / Math.max(1, generatedTokens.length);
  const denseNll = 0.15; // baseline uncompressed NLL
  const pplRatio = Number((Math.exp(avgNll) / Math.exp(denseNll)).toFixed(2));

  // Hallucination rate
  const deviatedCount = generatedTokens.filter(t => !t.isMatch).length;
  const hallucinationRate = Number((deviatedCount / Math.max(1, generatedTokens.length)).toFixed(3));

  // KV Memory saved calculation (based on 16-bit float, model layers & heads)
  const bytesPerToken = 2 * model.numLayers * model.numKvHeads * 128 * 2;
  const denseMemoryMb = (N * bytesPerToken) / (1024 * 1024);
  const retainedMemoryMb = (budget * bytesPerToken) / (1024 * 1024);
  const kvMemorySavedMb = Number(Math.max(0, denseMemoryMb - retainedMemoryMb).toFixed(2));

  return {
    methodId,
    methodName,
    methodCategory,
    generatedText: cleanGeneratedText,
    tokens: generatedTokens,
    metrics: {
      rouge1: Number(r1.toFixed(3)),
      rouge2: Number(r2.toFixed(3)),
      rougeL: Number(rL.toFixed(3)),
      bleu4: Number(bleu.toFixed(3)),
      needleFound,
      needleConfidence,
      perplexityRatio: pplRatio,
      repetitionRate: Number(repRate.toFixed(3)),
      hallucinationRate,
      kvMemorySavedMb,
      kvBudgetPercent: budgetPercent,
      generationLatencyMs: Math.round(15 + Math.random() * 8)
    },
    errorType,
    diagnosticExplanationFa: diagFa,
    diagnosticExplanationEn: diagEn
  };
}

// Run multi-method comparison for text generation impact
export function runTextGenerationEvaluation(
  params: SimulationParams,
  selectedMethods: string[] = ['dense', 'idea6_oracle_evict', 'h2o', 'streaming_llm', 'snapkv', 'random']
): GenerationEvaluationResult[] {
  return selectedMethods.map(mId => generateMethodCompletion(mId, params));
}
