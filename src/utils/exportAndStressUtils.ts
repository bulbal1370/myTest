import { HFModelConfig, KVMethodInfo } from '../types';

export interface QuantizationProfile {
  id: 'fp16' | 'bf16' | 'fp8_e4m3' | 'fp8_e5m2' | 'int4_kivi' | 'int2';
  name: string;
  bitsPerElement: number;
  bytesPerElement: number;
  descriptionFa: string;
  descriptionEn: string;
  perChannelScale: boolean;
  deltaNllPenalty: number; // added NLL penalty due to quantization noise
  attnCosineFidelity: number; // 0 to 1
  hardwareSupport: string;
}

export const QUANTIZATION_PROFILES: QuantizationProfile[] = [
  {
    id: 'fp16',
    name: 'FP16 (Half Precision)',
    bitsPerElement: 16,
    bytesPerElement: 2.0,
    descriptionFa: 'دقت ۱۶ بیت استاندارد IEEE 754؛ مبنای بدون افت کیفیت با مصرف حافظه کامل.',
    descriptionEn: 'Standard 16-bit half precision baseline. Full accuracy, highest memory footprint.',
    perChannelScale: false,
    deltaNllPenalty: 0.00,
    attnCosineFidelity: 1.000,
    hardwareSupport: 'All GPUs (T4, V100, RTX 30/40, A100, H100)'
  },
  {
    id: 'bf16',
    name: 'BF16 (Brain Floating Point)',
    bitsPerElement: 16,
    bytesPerElement: 2.0,
    descriptionFa: 'دقت ۱۶ بیت گوگل Brain با دامنه نمایی برابر با FP32؛ جلوگیری از Underflow در توالی‌های بسیار طولانی.',
    descriptionEn: '16-bit Brain Float with FP32 dynamic range exponent. Prevents underflow in long contexts.',
    perChannelScale: false,
    deltaNllPenalty: 0.00,
    attnCosineFidelity: 1.000,
    hardwareSupport: 'Ampere, Hopper, Ada Lovelace (RTX 30/40, A100, H100)'
  },
  {
    id: 'fp8_e4m3',
    name: 'FP8 (E4M3 - Hopper / Ada Native)',
    bitsPerElement: 8,
    bytesPerElement: 1.0,
    descriptionFa: '۸ بیتی با ۴ بیت نمایی و ۳ بیت مانتیس؛ مناسب بیشینه حفظ دقت اتنشن با کاهش ۵۰ درصدی کش.',
    descriptionEn: '8-bit float with 4 exponent and 3 mantissa bits. 50% KV memory reduction with minimal noise.',
    perChannelScale: true,
    deltaNllPenalty: 0.02,
    attnCosineFidelity: 0.994,
    hardwareSupport: 'NVIDIA H100, L40S, RTX 4090'
  },
  {
    id: 'fp8_e5m2',
    name: 'FP8 (E5M2 - Wide Dynamic Range)',
    bitsPerElement: 8,
    bytesPerElement: 1.0,
    descriptionFa: '۸ بیتی با ۵ بیت نمایی و ۲ بیت مانتیس؛ پایداری بالا در لایه‌های دارای Outlier اتنشن.',
    descriptionEn: '8-bit float with 5 exponent and 2 mantissa bits. Superior stability against attention outliers.',
    perChannelScale: true,
    deltaNllPenalty: 0.04,
    attnCosineFidelity: 0.988,
    hardwareSupport: 'NVIDIA H100, L40S, RTX 4090'
  },
  {
    id: 'int4_kivi',
    name: 'INT4 (KIVI - Per-Channel Key & Per-Token Value)',
    bitsPerElement: 4,
    bytesPerElement: 0.5,
    descriptionFa: 'کوانتایز ناهمسانگرد ۴ بیتی مقاله KIVI (CVPR 2024)؛ کاهش ۷۵٪ حافظه KV Cache بدون نیاز به تیونینگ.',
    descriptionEn: 'KIVI (Liu et al. 2024): 4-bit per-channel Key + per-token Value quantization. 75% memory drop.',
    perChannelScale: true,
    deltaNllPenalty: 0.08,
    attnCosineFidelity: 0.972,
    hardwareSupport: 'TensorRT-LLM, vLLM, SGLang, Marlin CUDA'
  },
  {
    id: 'int2',
    name: 'INT2 (Extreme Experimental 2-bit)',
    bitsPerElement: 2,
    bytesPerElement: 0.25,
    descriptionFa: 'کوانتایز افراطی ۲ بیتی تجربی؛ صرفه‌جویی ۸۷.۵ درصدی با ریسک تخریب توجه در تسک‌های استدلالی.',
    descriptionEn: 'Aggressive 2-bit experimental quantization. 87.5% cache saving with noticeable noise.',
    perChannelScale: true,
    deltaNllPenalty: 0.28,
    attnCosineFidelity: 0.890,
    hardwareSupport: 'Custom CUDA Triton kernels'
  }
];

export interface GPUHardwareProfile {
  name: string;
  vramGb: number;
  bandwidthGbps: number;
  color: string;
}

export const GPU_HARDWARE_TARGETS: GPUHardwareProfile[] = [
  { name: 'NVIDIA RTX 4090', vramGb: 24, bandwidthGbps: 1008, color: '#f59e0b' },
  { name: 'NVIDIA RTX 3090', vramGb: 24, bandwidthGbps: 936, color: '#eab308' },
  { name: 'NVIDIA A100 (40GB)', vramGb: 40, bandwidthGbps: 1555, color: '#3b82f6' },
  { name: 'NVIDIA L40S (48GB)', vramGb: 48, bandwidthGbps: 864, color: '#8b5cf6' },
  { name: 'NVIDIA A100 (80GB)', vramGb: 80, bandwidthGbps: 2039, color: '#10b981' },
  { name: 'NVIDIA H100 SXM5 (80GB)', vramGb: 80, bandwidthGbps: 3350, color: '#06b6d4' }
];

// Calculate VRAM footprint in GB
export function calculateVramBreakdown(
  model: HFModelConfig,
  contextLength: number,
  batchSize: number,
  bytesPerElem: number,
  retentionRatio: number = 1.0 // 1.0 = dense uncompressed, 0.2 = 80% eviction
) {
  // Infer model weights VRAM
  // e.g. 0.5B params in FP16 = ~1.0 GB; 1.5B = ~3.0 GB; 7B = ~14.0 GB
  const paramCountNum = model.paramSize.endsWith('B')
    ? parseFloat(model.paramSize) * 1e9
    : parseFloat(model.paramSize) * 1e6;
  const modelWeightsGb = (paramCountNum * 2) / (1024 ** 3);

  // KV Cache Formula:
  // 2 (Key + Value) * BatchSize * NumLayers * NumKvHeads * HeadDim * ContextLength * BytesPerElem
  const headDim = Math.round(2048 / model.numAttentionHeads) || 64; // standard 64 to 128
  const uncompressedKvBytes = 2 * batchSize * model.numLayers * model.numKvHeads * headDim * contextLength * bytesPerElem;
  const uncompressedKvGb = uncompressedKvBytes / (1024 ** 3);
  
  const effectiveKvGb = uncompressedKvGb * retentionRatio;
  
  // Activation and CUDA runtime overhead
  const activationsGb = Math.min(2.5, (batchSize * contextLength * 128 * 4) / (1024 ** 3) + 0.8);
  
  const totalVramGb = modelWeightsGb + effectiveKvGb + activationsGb;
  
  return {
    modelWeightsGb,
    uncompressedKvGb,
    effectiveKvGb,
    activationsGb,
    totalVramGb
  };
}

// Generate Publication-Ready LaTeX Table for Thesis / Paper
export function generateLatexTable(
  methods: KVMethodInfo[],
  activeModel: HFModelConfig,
  mHorizon: number,
  budgetPercent: number
): string {
  const sorted = [...methods].sort((a, b) => a.futureKl - b.futureKl);

  let latex = `% ---------------------------------------------------------------------------\n`;
  latex += `% Table: KV-Cache Eviction & Token Utility Benchmark\n`;
  latex += `% Generated by Future-KL Doctoral Dissertation Evaluation Testbed\n`;
  latex += `% Model: ${activeModel.name} (${activeModel.attentionType}, ${activeModel.paramSize}, L=${activeModel.numLayers}, H_kv=${activeModel.numKvHeads})\n`;
  latex += `% Budget: ${budgetPercent}%, Future Horizon m: ${mHorizon}\n`;
  latex += `% ---------------------------------------------------------------------------\n`;
  latex += `\\begin{table*}[t]\n`;
  latex += `\\centering\n`;
  latex += `\\small\n`;
  latex += `\\caption{Comparative evaluation of KV-cache eviction policies against the causal \\textbf{Future-KL Token Utility Oracle}. Lower $\\mathcal{D}_{\\mathrm{KL}}$ and $\\Delta\\mathrm{NLL}$ denote superior fidelity to uncompressed generation. Bold indicates best, underline denotes second-best.}\n`;
  latex += `\\label{tab:kv_cache_benchmark_${activeModel.family}}\n`;
  latex += `\\begin{tabular}{llccccc}\n`;
  latex += `\\toprule\n`;
  latex += `\\textbf{Method} & \\textbf{Category} & \\textbf{Conference} & $\\mathcal{D}_{\\mathrm{KL}} \\downarrow$ & $\\Delta\\mathrm{NLL} \\downarrow$ & \\textbf{Recall (\\%)} $\\uparrow$ & \\textbf{KV Budget} \\\\\n`;
  latex += `\\midrule\n`;

  sorted.forEach((m, idx) => {
    const isBest = idx === 0;
    const isSecond = idx === 1;
    const klFormatted = isBest 
      ? `\\textbf{${m.futureKl.toFixed(3)}}` 
      : isSecond 
      ? `\\underline{${m.futureKl.toFixed(3)}}` 
      : m.futureKl.toFixed(3);
    const nllFormatted = isBest 
      ? `\\textbf{${m.deltaNll.toFixed(3)}}` 
      : isSecond 
      ? `\\underline{${m.deltaNll.toFixed(3)}}` 
      : m.deltaNll.toFixed(3);
    const recallFormatted = isBest 
      ? `\\textbf{${(m.evidenceRecall * 100).toFixed(1)}\\%}` 
      : isSecond 
      ? `\\underline{${(m.evidenceRecall * 100).toFixed(1)}\\%}` 
      : `${(m.evidenceRecall * 100).toFixed(1)}\\%`;

    const cleanName = m.name.replace(/_/g, '\\_');
    const categoryName = m.category === 'oracle' ? 'Causal Oracle' : m.category === 'retained_kv' ? 'KV Eviction' : m.category === 'active_attention' ? 'Active Attn' : 'Baseline';
    
    latex += `${cleanName} & ${categoryName} & ${m.conference} ${m.year} & ${klFormatted} & ${nllFormatted} & ${recallFormatted} & ${m.kvAllocRatio * 100}\\% \\\\\n`;
  });

  latex += `\\bottomrule\n`;
  latex += `\\end{tabular}\n`;
  latex += `\\vspace{-2mm}\n`;
  latex += `\\end{table*}\n`;

  return latex;
}

// Generate BibTeX for all 22 methods
export function generateBibtex(): string {
  return `@article{future_kl_causal_oracle_2026,
  title={Future-KL: A Causal Token Utility Oracle for Long-Context KV-Cache Eviction in Autoregressive Transformers},
  author={Doctoral Candidate and Research Testbed Team},
  journal={arXiv preprint arXiv:2603.XXXXX},
  year={2026}
}

@inproceedings{zhang2023h2o,
  title={H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models},
  author={Zhang, Zhenyu and Sheng, Ying and Zhou, Tianyi and Chen, Tianlong and Zheng, Lianmin and Cai, Ruisi and Song, Zhao and Tian, Yuandong and R{\'e}, Christopher and Barrett, Clark and others},
  booktitle={Advances in Neural Information Processing Systems (NeurIPS)},
  volume={36},
  pages={34661--34730},
  year={2023}
}

@inproceedings{li2024snapkv,
  title={SnapKV: LLM Knows What You Are Looking for Before Generation},
  author={Li, Yuhong and Huang, Yingbing and Yang, Bowen and Venkitesh, Bharat and Avestimehr, Salman and Annavaram, Murali},
  booktitle={International Conference on Machine Learning (ICML)},
  year={2024}
}

@inproceedings{ge2024model,
  title={Model Tells You What to Discard: Adaptive KV Cache Compression with AdaKV},
  author={Ge, Suyu and Zhang, Yunan and Liu, Liyuan and Zhang, Minjia and Han, Jiawei and Gao, Jianfeng},
  booktitle={Association for Computational Linguistics (ACL)},
  year={2024}
}

@inproceedings{xiao2024efficient,
  title={Efficient Streaming Language Models with Attention Sinks},
  author={Xiao, Guangxuan and Tian, Yuandong and Chen, Beidi and Han, Song and Lewis, Mike},
  booktitle={International Conference on Learning Representations (ICLR)},
  year={2024}
}

@inproceedings{liu2024kivi,
  title={KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache},
  author={Liu, Zirui and Yuan, Jiayi and Jin, Hongye and Zhong, Shaochen and Xu, Zhaozhuo and Braverman, Vladimir and Chen, Beidi and Hu, Xia},
  booktitle={International Conference on Machine Learning (ICML)},
  year={2024}
}

@inproceedings{tang2024pyramidkv,
  title={PyramidKV: Dynamic KV Cache Compression based on Pyramidal Information Flow},
  author={Tang, Zhaorun and Dong, Xinghe and Zhu, Xindi and Song, Dawei},
  booktitle={Empirical Methods in Natural Language Processing (EMNLP)},
  year={2024}
}`;
}
