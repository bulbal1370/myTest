import { HFModelConfig } from '../types';

export const DEFAULT_HF_MODELS: HFModelConfig[] = [
  {
    id: 'Qwen/Qwen2.5-0.5B-Instruct',
    name: 'Qwen 2.5 (0.5B Instruct)',
    family: 'qwen',
    paramSize: '0.49B',
    contextLength: 32768,
    attentionType: 'GQA',
    numLayers: 24,
    numAttentionHeads: 14,
    numKvHeads: 2,
    vocabSize: 151936,
    persianFertility: 1.7,
    englishFertility: 1.2,
    positionalEncoding: 'RoPE',
    isLightweight: true,
    isDefault: true,
    hfUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct',
    descriptionFa: 'فوق‌العاده سبک، سریع و بهینه‌سازی‌شده برای زبان فارسی و انگلیسی با توکنایزر ۱۵۲ هزارتایی و نسبت سر توجه GQA (۱۴ به ۲).',
    descriptionEn: 'Ultra-lightweight 0.49B model with GQA (14 Q-heads to 2 KV-heads) and low Persian token fertility (1.7).'
  },
  {
    id: 'Qwen/Qwen2.5-1.5B-Instruct',
    name: 'Qwen 2.5 (1.5B Instruct)',
    family: 'qwen',
    paramSize: '1.54B',
    contextLength: 32768,
    attentionType: 'GQA',
    numLayers: 28,
    numAttentionHeads: 12,
    numKvHeads: 2,
    vocabSize: 151936,
    persianFertility: 1.7,
    englishFertility: 1.2,
    positionalEncoding: 'RoPE',
    isLightweight: true,
    isDefault: false,
    hfUrl: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct',
    descriptionFa: 'مدل سبک ۱.۵ میلیارد پارامتری با دقت استدلال بالاتر در کارهای چندمرحله‌ای و زمینه‌های بلند تا ۳۲ هزار توکن.',
    descriptionEn: 'Compact 1.5B instruction model with rich reasoning capacity and long-context 32K window.'
  },
  {
    id: 'meta-llama/Llama-3.2-1B-Instruct',
    name: 'Llama 3.2 (1B Instruct)',
    family: 'llama',
    paramSize: '1.23B',
    contextLength: 131072,
    attentionType: 'GQA',
    numLayers: 16,
    numAttentionHeads: 32,
    numKvHeads: 8,
    vocabSize: 128256,
    persianFertility: 2.3,
    englishFertility: 1.2,
    positionalEncoding: 'RoPE',
    isLightweight: true,
    isDefault: false,
    hfUrl: 'https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct',
    descriptionFa: 'معماری مدرن متا با بافت ۱۲۸ هزار توکنی، توکنایزر tiktoken و نسبت GQA (۴ به ۱). مناسب برای سنجش فراموشی حافظه.',
    descriptionEn: 'Meta 1B model with massive 128K context window, RoPE positional encoding, and 8 KV heads.'
  },
  {
    id: 'google/gemma-2-2b-it',
    name: 'Gemma 2 (2B Instruct)',
    family: 'gemma',
    paramSize: '2.61B',
    contextLength: 8192,
    attentionType: 'Hybrid_Sliding',
    numLayers: 26,
    numAttentionHeads: 8,
    numKvHeads: 4,
    vocabSize: 256000,
    persianFertility: 1.9,
    englishFertility: 1.2,
    positionalEncoding: 'RoPE',
    isLightweight: true,
    isDefault: false,
    hfUrl: 'https://huggingface.co/google/gemma-2-2b-it',
    descriptionFa: 'معماری ترکیبی گوگل (لایه کش محلی لغزان ۴K + لایه توجه کامل سراسری ۸K). نشان‌دهنده چالش لایه‌های sliding در تخلیه کش.',
    descriptionEn: 'Google hybrid model alternating sliding-window attention (4K) and global full attention (8K).'
  },
  {
    id: 'openai-community/gpt2',
    name: 'GPT-2 (Classic 124M Baseline)',
    family: 'gpt2',
    paramSize: '124M',
    contextLength: 1024,
    attentionType: 'MHA',
    numLayers: 12,
    numAttentionHeads: 12,
    numKvHeads: 12,
    vocabSize: 50257,
    persianFertility: 5.4,
    englishFertility: 1.3,
    positionalEncoding: 'Absolute_Learned',
    isLightweight: true,
    isDefault: false,
    hfUrl: 'https://huggingface.co/openai-community/gpt2',
    descriptionFa: 'مدل خط پایه کلاسیک با توجه کامل MHA (۱۲ به ۱۲) و امبدینگ موقعیت مطلق. دارای خردشدگی شدید کلمات فارسی (۵.۴ توکن به ازای هر کلمه).',
    descriptionEn: 'Classic baseline with standard MHA and absolute position embeddings. Demonstrates severe Persian token fragmentation.'
  },
  {
    id: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    name: 'TinyLlama (1.1B Chat)',
    family: 'llama',
    paramSize: '1.10B',
    contextLength: 2048,
    attentionType: 'GQA',
    numLayers: 22,
    numAttentionHeads: 32,
    numKvHeads: 4,
    vocabSize: 32000,
    persianFertility: 4.8,
    englishFertility: 1.3,
    positionalEncoding: 'RoPE',
    isLightweight: true,
    isDefault: false,
    hfUrl: 'https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    descriptionFa: 'مدل کوچک بر پایه معماری Llama-1/2 با توکنایزر ۳۲ هزارتایی SentencePiece و ۳ تریلیون توکن آموزش.',
    descriptionEn: 'Compact 1.1B model pre-trained on 3T tokens based on Llama architecture.'
  },
  {
    id: 'Qwen/Qwen2.5-3B-Instruct',
    name: 'Qwen 2.5 (3B Instruct - SDD Reference)',
    family: 'qwen',
    paramSize: '3.09B',
    contextLength: 32768,
    attentionType: 'GQA',
    numLayers: 36,
    numAttentionHeads: 16,
    numKvHeads: 2,
    vocabSize: 151936,
    persianFertility: 1.7,
    englishFertility: 1.2,
    positionalEncoding: 'RoPE',
    isLightweight: false,
    isDefault: false,
    hfUrl: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct',
    descriptionFa: 'مدل مرجع اصلی در آزمایش‌های SDD و اثبات یافته F2 و F3 (برتری اوراکل Future-KL با ۸۸.۴٪ پوشش شاهد).',
    descriptionEn: 'Core reference model from the SDD benchmark suite confirming Findings F2, F3 and F4.'
  }
];

export function estimateModelArchitecture(repoId: string): Partial<HFModelConfig> {
  const cleanId = repoId.toLowerCase();
  
  if (cleanId.includes('qwen')) {
    return {
      family: 'qwen',
      attentionType: 'GQA',
      numKvHeads: 2,
      vocabSize: 151936,
      persianFertility: 1.7,
      positionalEncoding: 'RoPE',
      contextLength: 32768
    };
  }
  if (cleanId.includes('llama') || cleanId.includes('hermes')) {
    return {
      family: 'llama',
      attentionType: 'GQA',
      numKvHeads: 8,
      vocabSize: 128256,
      persianFertility: 2.3,
      positionalEncoding: 'RoPE',
      contextLength: 131072
    };
  }
  if (cleanId.includes('gemma')) {
    return {
      family: 'gemma',
      attentionType: 'Hybrid_Sliding',
      numKvHeads: 4,
      vocabSize: 256000,
      persianFertility: 1.9,
      positionalEncoding: 'RoPE',
      contextLength: 8192
    };
  }
  if (cleanId.includes('phi')) {
    return {
      family: 'phi',
      attentionType: 'MHA',
      numKvHeads: 32,
      vocabSize: 32064,
      persianFertility: 3.8,
      positionalEncoding: 'RoPE',
      contextLength: 4096
    };
  }
  if (cleanId.includes('gpt2') || cleanId.includes('distilgpt2')) {
    return {
      family: 'gpt2',
      attentionType: 'MHA',
      numKvHeads: 12,
      vocabSize: 50257,
      persianFertility: 5.4,
      positionalEncoding: 'Absolute_Learned',
      contextLength: 1024
    };
  }

  // Generic fallback
  return {
    family: 'custom',
    attentionType: 'GQA',
    numKvHeads: 4,
    vocabSize: 64000,
    persianFertility: 2.5,
    positionalEncoding: 'RoPE',
    contextLength: 8192
  };
}
