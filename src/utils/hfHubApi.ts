import { HFModelConfig } from '../types';
import { estimateModelArchitecture } from '../data/hfModels';

export interface HFApiResponse {
  id: string;
  author?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
  config?: Record<string, any>;
  cardData?: Record<string, any>;
  siblings?: { rfilename: string }[];
}

export async function fetchHFModelMetadata(repoId: string): Promise<HFModelConfig> {
  const cleanId = repoId.trim();
  const fallback = estimateModelArchitecture(cleanId);
  const modelName = cleanId.split('/').pop() || cleanId;

  try {
    const res = await fetch(`https://huggingface.co/api/models/${cleanId}`);
    if (res.ok) {
      const data: HFApiResponse = await res.json();
      const config = data.config || {};
      
      const numLayers = config.num_hidden_layers || config.n_layer || 24;
      const numAttentionHeads = config.num_attention_heads || config.n_head || 16;
      const numKvHeads = config.num_key_value_heads || (config.multi_query ? 1 : numAttentionHeads);
      const vocabSize = config.vocab_size || fallback.vocabSize || 32000;
      const contextLength = config.max_position_embeddings || config.n_positions || 8192;
      
      let attentionType: 'MHA' | 'GQA' | 'Hybrid_Sliding' = 'MHA';
      if (numKvHeads < numAttentionHeads) {
        attentionType = 'GQA';
      }
      if (cleanId.toLowerCase().includes('gemma')) {
        attentionType = 'Hybrid_Sliding';
      }

      // Infer param size
      let paramSize = '1B';
      const hiddenSize = config.hidden_size || config.n_embd || 2048;
      const approxParams = (numLayers * (4 * hiddenSize * hiddenSize + 3 * hiddenSize * (config.intermediate_size || 4 * hiddenSize))) / 1e9;
      if (approxParams > 0.1) {
        paramSize = approxParams >= 1 ? `${approxParams.toFixed(1)}B` : `${Math.round(approxParams * 1000)}M`;
      }

      return {
        id: cleanId,
        name: modelName,
        family: (fallback.family || 'custom') as any,
        paramSize: paramSize,
        contextLength: contextLength,
        attentionType: attentionType,
        numLayers: numLayers,
        numAttentionHeads: numAttentionHeads,
        numKvHeads: numKvHeads,
        vocabSize: vocabSize,
        persianFertility: fallback.persianFertility || 2.4,
        englishFertility: fallback.englishFertility || 1.2,
        positionalEncoding: (fallback.positionalEncoding || 'RoPE') as any,
        isLightweight: approxParams < 4,
        isDefault: false,
        hfUrl: `https://huggingface.co/` + cleanId,
        descriptionFa: `مدل سفارشی اضافه‌شده از هاگینگ‌فیس با ${numLayers} لایه و نسبت سر KV برابر ${numKvHeads}/${numAttentionHeads} (${attentionType}).`,
        descriptionEn: `Custom loaded Hugging Face model with ${numLayers} layers and ${attentionType} attention.`,
        customAdded: true
      };
    }
  } catch (err) {
    console.warn('Direct HuggingFace API query unreachable, using architectural profiler:', err);
  }

  // Fallback to intelligent architectural profiling
  return {
    id: cleanId,
    name: modelName,
    family: (fallback.family || 'custom') as any,
    paramSize: '1.5B',
    contextLength: fallback.contextLength || 8192,
    attentionType: (fallback.attentionType || 'GQA') as any,
    numLayers: 24,
    numAttentionHeads: 16,
    numKvHeads: fallback.numKvHeads || 2,
    vocabSize: fallback.vocabSize || 64000,
    persianFertility: fallback.persianFertility || 2.4,
    englishFertility: 1.2,
    positionalEncoding: (fallback.positionalEncoding || 'RoPE') as any,
    isLightweight: true,
    isDefault: false,
    hfUrl: `https://huggingface.co/` + cleanId,
    descriptionFa: `مدل سفارشی استخراج‌شده از مخزن ${cleanId} با معماری ${fallback.attentionType || 'GQA'}.`,
    descriptionEn: `Custom model profiled from repository ${cleanId}.`,
    customAdded: true
  };
}
