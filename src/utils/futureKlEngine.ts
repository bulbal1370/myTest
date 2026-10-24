import {
  InterventionScheme,
  DivergenceMetric,
  NormalizationMethod,
  PromptSample,
  SimulationResult,
  TokenItem,
  HFModelConfig
} from '../types';
import { DEFAULT_HF_MODELS } from '../data/hfModels';

// Tokenizer simulation with model fertility adaptation
export function tokenizePrompt(text: string, lang: 'fa' | 'en', fertility: number = 1.7): string[] {
  if (lang === 'fa') {
    const rawWords = text.match(/[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]+|[a-zA-Z0-9_-]+|[^\s\w\u0600-\u06FF]/g) || [];
    // If fertility is high (like GPT-2 or older BPE tokenizers), fragment longer Persian words into sub-tokens
    if (fertility > 3.0) {
      const fragmented: string[] = [];
      rawWords.forEach(word => {
        if (/[\u0600-\u06FF]/.test(word) && word.length > 3) {
          const mid = Math.floor(word.length / 2);
          fragmented.push(word.slice(0, mid));
          fragmented.push(word.slice(mid));
        } else {
          fragmented.push(word);
        }
      });
      return fragmented;
    }
    return rawWords;
  } else {
    const rawTokens = text.match(/[a-zA-Z0-9_-]+|[^\s\w]/g) || [];
    return rawTokens;
  }
}

export function runFutureKlSimulation(
  sample: PromptSample,
  intervention: InterventionScheme,
  metric: DivergenceMetric,
  normalization: NormalizationMethod,
  mHorizon: number = 50,
  budgetPercent: number = 20,
  sinkCount: number = 4,
  modelConfig: HFModelConfig = DEFAULT_HF_MODELS[0],
  temperature: number = 1.0
): SimulationResult {
  const startTime = performance.now();
  const rawTokens = tokenizePrompt(
    sample.prompt, 
    sample.language, 
    sample.language === 'fa' ? modelConfig.persianFertility : modelConfig.englishFertility
  );
  const N = rawTokens.length;
  // Fully configurable m horizon from 5 to 500
  const m = Math.max(5, Math.min(mHorizon, 500));
  const budget = Math.max(sinkCount + 1, Math.round((budgetPercent / 100) * N));

  // Identify evidence tokens
  const evidenceIndicesSet = new Set<number>();
  if (sample.needle) {
    const needleClean = sample.needle.toLowerCase();
    rawTokens.forEach((t, i) => {
      if (needleClean.includes(t.toLowerCase()) || (sample.evidenceIndices && sample.evidenceIndices.includes(i))) {
        evidenceIndicesSet.add(i);
      }
    });
  }
  if (sample.evidenceIndices) {
    sample.evidenceIndices.forEach(idx => {
      if (idx < N) evidenceIndicesSet.add(idx);
    });
  }

  const divergenceMatrix: number[][] = [];
  const rawImportance: number[] = new Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    const row: number[] = new Array(m).fill(0);
    const isSink = i < sinkCount;
    const isEvidence = evidenceIndicesSet.has(i);
    const distanceFromEnd = (N - 1) - i;
    const isRecent = distanceFromEnd < 8;

    for (let k = 0; k < m; k++) {
      let d_ik = 0;

      if (intervention === 'evict') {
        if (k === 0) {
          d_ik = 0;
        } else if (isSink) {
          d_ik = (0.45 / (1 + 0.25 * k)) * (1 + 0.08 * Math.sin(i * 10 + k));
        } else if (isEvidence) {
          const gqaMultiplier = modelConfig.attentionType === 'GQA' 
            ? 1 + 0.05 * (modelConfig.numAttentionHeads / Math.max(1, modelConfig.numKvHeads))
            : 1.0;

          // Thinking Chain impact: if sample has thinking, evidence utility remains high throughout thinking phase!
          const isThinkingPhase = sample.hasThinking && k < Math.floor(m * 0.6);
          const thinkingBoost = isThinkingPhase ? 1.35 : 1.0;

          // Tool Calling impact: schema parameters are critical during JSON argument generation
          const toolBoost = sample.hasTools ? 1.25 : 1.0;

          const peak = Math.min(15, Math.floor(m * 0.25));
          const distFromPeak = Math.abs(k - peak);
          d_ik = (0.58 * Math.exp(-distFromPeak / (m * 0.35)) + 0.16) * Math.min(1.4, gqaMultiplier) * thinkingBoost * toolBoost;
          d_ik *= (1 + 0.10 * Math.cos(k * 0.35));
        } else if (isRecent) {
          d_ik = 0.18 * Math.exp(-k / (m * 0.2)) + 0.02;
        } else {
          d_ik = 0.03 * Math.exp(-k / (m * 0.15)) + 0.005 * (Math.sin(i * 3 + k) + 1);
        }
      } else if (intervention === 'remove') {
        if (isSink) {
          d_ik = 0.85 / (1 + 0.18 * k);
        } else if (isEvidence) {
          d_ik = 0.30 * Math.exp(-k / (m * 0.3)) + 0.04;
        } else if (i % 7 === 0) {
          d_ik = 0.22 * Math.exp(-k / (m * 0.2)) + 0.03;
        } else {
          d_ik = 0.05 * Math.exp(-k / (m * 0.15)) + 0.01;
        }
      } else {
        // zero embedding
        if (isSink) {
          d_ik = 0.70 / (1 + 0.15 * k);
        } else if (isEvidence) {
          d_ik = 0.22 * Math.exp(-k / (m * 0.25)) + 0.03;
        } else {
          d_ik = 0.08 * (Math.sin(i * 5 + k) + 1.2) * 0.5;
        }
      }

      if (metric === 'reverse_kl') {
        d_ik *= (0.85 + 0.3 * (isEvidence ? 1.2 : 0.8));
      } else if (metric === 'jsd') {
        d_ik = Math.min(0.693, d_ik * 0.75);
      }

      row[k] = Math.max(0, d_ik);
    }

    divergenceMatrix.push(row);
    rawImportance[i] = row.reduce((sum, val) => sum + val, 0);
  }

  // Normalization with Temperature calibration
  const maxRaw = Math.max(...rawImportance, 1e-9);
  const minRaw = Math.min(...rawImportance);
  const meanRaw = rawImportance.reduce((a, b) => a + b, 0) / N;
  const stdRaw = Math.sqrt(rawImportance.reduce((sq, n) => sq + Math.pow(n - meanRaw, 2), 0) / N) || 1e-9;
  const T = Math.max(0.05, temperature || 1.0);

  const normalizedImportance: number[] = rawImportance.map(val => {
    switch (normalization) {
      case 'max':
        return val / (maxRaw + 1e-9);
      case 'minmax':
        return (val - minRaw) / (maxRaw - minRaw + 1e-9);
      case 'softmax': {
        const expShift = Math.exp((val - maxRaw) / T);
        return expShift;
      }
      case 'zscore':
        return (val - meanRaw) / (stdRaw + 1e-9);
      default:
        return val / maxRaw;
    }
  });

  if (normalization === 'softmax') {
    const sumExp = normalizedImportance.reduce((a, b) => a + b, 0) || 1;
    for (let i = 0; i < N; i++) {
      normalizedImportance[i] = (normalizedImportance[i] / sumExp) * N; // scaled for visibility
    }
  }

  // Calculate selections for Idea6 Oracle
  // Sinks are guaranteed retained, then top (budget - sinkCount)
  const candidateIndices = [];
  for (let i = sinkCount; i < N; i++) {
    candidateIndices.push(i);
  }
  candidateIndices.sort((a, b) => normalizedImportance[b] - normalizedImportance[a]);
  const oracleRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) {
    oracleRetainedSet.add(i);
  }
  const neededFromCandidates = Math.max(0, budget - sinkCount);
  for (let i = 0; i < Math.min(neededFromCandidates, candidateIndices.length); i++) {
    oracleRetainedSet.add(candidateIndices[i]);
  }

  // Compute other baselines' retention sets for direct token-level visual comparison:
  // 1. H2O (Heavy Hitter Attention: favors sink, recent, and some high-freq tokens)
  const h2oRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) h2oRetainedSet.add(i);
  // H2O reserves half remaining budget for recency
  const recencyCount = Math.floor((budget - sinkCount) / 2);
  for (let i = Math.max(sinkCount, N - recencyCount); i < N; i++) h2oRetainedSet.add(i);
  // remaining for pseudo heavy-hitters (often sinks, common words, occasionally evidence)
  const hhNeeded = budget - h2oRetainedSet.size;
  const nonRetained = [];
  for (let i = sinkCount; i < N - recencyCount; i++) nonRetained.push(i);
  // H2O heuristic simulated score (decays exponentially away from prompt ends)
  nonRetained.sort((a, b) => {
    const scoreA = 1 / (a + 1) + 1 / (N - a);
    const scoreB = 1 / (b + 1) + 1 / (N - b);
    return scoreB - scoreA;
  });
  for (let i = 0; i < Math.min(hhNeeded, nonRetained.length); i++) {
    h2oRetainedSet.add(nonRetained[i]);
  }

  // 2. SnapKV (Observation window voting: favors tokens attended by trailing 32 tokens)
  const snapKvRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) snapKvRetainedSet.add(i);
  const snapNeeded = budget - snapKvRetainedSet.size;
  const snapCandidates = [];
  for (let i = sinkCount; i < N; i++) snapCandidates.push(i);
  snapCandidates.sort((a, b) => {
    // SnapKV has a high chance of spotting evidence if in window, otherwise position bias
    const scoreA = evidenceIndicesSet.has(a) ? 0.85 : (0.2 + (a / N) * 0.4);
    const scoreB = evidenceIndicesSet.has(b) ? 0.85 : (0.2 + (b / N) * 0.4);
    return scoreB - scoreA;
  });
  for (let i = 0; i < Math.min(snapNeeded, snapCandidates.length); i++) {
    snapKvRetainedSet.add(snapCandidates[i]);
  }

  // 3. StreamingLLM (First Sinks + Last Recent)
  const streamingRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) streamingRetainedSet.add(i);
  const streamRecentNeeded = budget - streamingRetainedSet.size;
  for (let i = Math.max(sinkCount, N - streamRecentNeeded); i < N; i++) {
    streamingRetainedSet.add(i);
  }

  // 4. Random (Sinks + Uniform Random)
  const randomRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) randomRetainedSet.add(i);
  const randCandidates = [];
  for (let i = sinkCount; i < N; i++) randCandidates.push(i);
  // Pseudo-random deterministic shuffle based on index
  randCandidates.sort((a, b) => ((a * 9301 + 49297) % 233280) - ((b * 9301 + 49297) % 233280));
  const randNeeded = budget - randomRetainedSet.size;
  for (let i = 0; i < Math.min(randNeeded, randCandidates.length); i++) {
    randomRetainedSet.add(randCandidates[i]);
  }

  // 5. AdaKV (Adaptive head-wise)
  const adakvRetainedSet = new Set<number>();
  for (let i = 0; i < Math.min(sinkCount, N); i++) adakvRetainedSet.add(i);
  const adaNeeded = budget - adakvRetainedSet.size;
  const adaCandidates = [];
  for (let i = sinkCount; i < N; i++) adaCandidates.push(i);
  adaCandidates.sort((a, b) => {
    const scoreA = evidenceIndicesSet.has(a) ? 0.78 : (0.3 + (a / N) * 0.35);
    const scoreB = evidenceIndicesSet.has(b) ? 0.78 : (0.3 + (b / N) * 0.35);
    return scoreB - scoreA;
  });
  for (let i = 0; i < Math.min(adaNeeded, adaCandidates.length); i++) {
    adakvRetainedSet.add(adaCandidates[i]);
  }

  // Build Token Items
  const tokens: TokenItem[] = rawTokens.map((txt, idx) => ({
    id: idx,
    text: txt,
    isSink: idx < sinkCount,
    isEvidence: evidenceIndicesSet.has(idx),
    divergenceSum: rawImportance[idx],
    normalizedImportance: normalizedImportance[idx],
    isRetainedByMethod: {
      idea6_oracle: oracleRetainedSet.has(idx),
      h2o: h2oRetainedSet.has(idx),
      snapkv: snapKvRetainedSet.has(idx),
      streaming_llm: streamingRetainedSet.has(idx),
      random: randomRetainedSet.has(idx),
      adakv: adakvRetainedSet.has(idx),
      full_kv: true
    }
  }));

  // Evidence recall for Idea6 Oracle
  const totalEvidence = evidenceIndicesSet.size;
  let retainedEvidence = 0;
  evidenceIndicesSet.forEach(idx => {
    if (oracleRetainedSet.has(idx)) retainedEvidence++;
  });
  const evidenceRecall = totalEvidence > 0 ? retainedEvidence / totalEvidence : 1.0;

  // Estimated Future KL and Delta NLL
  const isEvict = intervention === 'evict';
  const estimatedFutureKl = isEvict
    ? 0.0028 + (1 - evidenceRecall) * 0.04
    : 0.0131 + (1 - evidenceRecall) * 0.09;
  const estimatedDeltaNll = isEvict
    ? 0.1840 + (1 - evidenceRecall) * 0.85
    : 2.3293;

  const runtimeMs = Math.round(performance.now() - startTime);

  return {
    tokens,
    m_eff: m,
    divergenceMatrix,
    maxImportance: maxRaw,
    meanImportance: meanRaw,
    retainedCount: oracleRetainedSet.size,
    totalTokens: N,
    budgetRatio: budget / N,
    evidenceRecall,
    estimatedFutureKl,
    estimatedDeltaNll,
    runtimeMs
  };
}
