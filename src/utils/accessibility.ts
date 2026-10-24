import { AccessibilitySettings, ColorBlindMode } from '../types';

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  mode: 'standard',
  showSymbols: true,
  highContrastBorders: true,
  simulationFilter: 'none'
};

// SVG Color Matrix definitions for simulating color blindness on the webpage
export const COLORBLIND_SVG_FILTERS = {
  protanopia: `
    0.567, 0.433, 0.000, 0, 0
    0.558, 0.442, 0.000, 0, 0
    0.000, 0.242, 0.758, 0, 0
    0.000, 0.000, 0.000, 1, 0
  `,
  deuteranopia: `
    0.625, 0.375, 0.000, 0, 0
    0.700, 0.300, 0.000, 0, 0
    0.000, 0.300, 0.700, 0, 0
    0.000, 0.000, 0.000, 1, 0
  `,
  tritanopia: `
    0.950, 0.050, 0.000, 0, 0
    0.000, 0.433, 0.567, 0, 0
    0.000, 0.475, 0.525, 0, 0
    0.000, 0.000, 0.000, 1, 0
  `,
  achromatopsia: `
    0.299, 0.587, 0.114, 0, 0
    0.299, 0.587, 0.114, 0, 0
    0.299, 0.587, 0.114, 0, 0
    0.000, 0.000, 0.000, 1, 0
  `
};

export interface AccessibleTokenStyle {
  containerClass: string;
  symbol: string;
  symbolLabelFa: string;
  symbolLabelEn: string;
  badgeClass: string;
}

export function getAccessibleTokenStyle(
  isRetained: boolean,
  isEvidence: boolean,
  isSink: boolean,
  isSelected: boolean,
  mode: ColorBlindMode,
  showSymbols: boolean
): AccessibleTokenStyle {
  // 1. High-Contrast Monochrome Mode
  if (mode === 'high_contrast') {
    if (isEvidence) {
      return {
        containerClass: `bg-yellow-400 text-black border-2 border-yellow-200 font-black shadow-md ${isSelected ? 'ring-4 ring-white' : ''}`,
        symbol: '🎯',
        symbolLabelFa: 'شاهد',
        symbolLabelEn: 'Evidence',
        badgeClass: 'bg-black text-yellow-300 font-bold'
      };
    }
    if (isSink) {
      return {
        containerClass: `bg-white text-black border-2 border-slate-300 font-bold ${isSelected ? 'ring-4 ring-yellow-400' : ''}`,
        symbol: '★',
        symbolLabelFa: 'سینک',
        symbolLabelEn: 'Sink',
        badgeClass: 'bg-slate-900 text-white font-bold'
      };
    }
    if (isRetained) {
      return {
        containerClass: `bg-zinc-800 text-white border-2 border-zinc-300 font-semibold ${isSelected ? 'ring-4 ring-yellow-400' : ''}`,
        symbol: '✓',
        symbolLabelFa: 'حفظ',
        symbolLabelEn: 'Retain',
        badgeClass: 'bg-zinc-700 text-white'
      };
    }
    // Evicted in High Contrast
    return {
      containerClass: `bg-black text-zinc-500 border border-dashed border-zinc-700 line-through opacity-55 hover:opacity-100 ${isSelected ? 'ring-2 ring-zinc-400' : ''}`,
      symbol: '✗',
      symbolLabelFa: 'حذف',
      symbolLabelEn: 'Evicted',
      badgeClass: 'bg-zinc-900 text-zinc-500'
    };
  }

  // 2. Deuteranopia / Protanopia (Red-Green Blindness): Uses Okabe-Ito Blue (#0072B2), Orange (#E69F00), Sky Blue (#56B4E9)
  if (mode === 'deuteranopia') {
    if (isEvidence) {
      return {
        containerClass: `bg-amber-500/30 text-amber-100 border-2 border-amber-400 font-bold shadow-sm shadow-amber-500/30 ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '🎯',
        symbolLabelFa: 'شاهد',
        symbolLabelEn: 'Evidence',
        badgeClass: 'bg-amber-950 text-amber-300'
      };
    }
    if (isSink) {
      return {
        containerClass: `bg-cyan-500/25 text-cyan-100 border-2 border-cyan-400 font-bold ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '★',
        symbolLabelFa: 'سینک',
        symbolLabelEn: 'Sink',
        badgeClass: 'bg-cyan-950 text-cyan-300'
      };
    }
    if (isRetained) {
      return {
        containerClass: `bg-blue-600/30 text-blue-100 border-2 border-blue-400 font-medium ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '✓',
        symbolLabelFa: 'حفظ',
        symbolLabelEn: 'Retain',
        badgeClass: 'bg-blue-950 text-blue-300'
      };
    }
    // Evicted
    return {
      containerClass: `bg-slate-900/50 text-slate-500 border border-dashed border-slate-700/60 line-through opacity-50 hover:opacity-90 ${isSelected ? 'ring-2 ring-slate-400' : ''}`,
      symbol: '✗',
      symbolLabelFa: 'حذف',
      symbolLabelEn: 'Evicted',
      badgeClass: 'bg-slate-950 text-slate-600'
    };
  }

  // 3. Tritanopia (Blue-Yellow Blindness): Uses Teal/Cyan (#009E73) and Magenta/Pink (#CC79A7)
  if (mode === 'tritanopia') {
    if (isEvidence) {
      return {
        containerClass: `bg-fuchsia-500/30 text-fuchsia-100 border-2 border-fuchsia-400 font-bold shadow-sm ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '🎯',
        symbolLabelFa: 'شاهد',
        symbolLabelEn: 'Evidence',
        badgeClass: 'bg-fuchsia-950 text-fuchsia-300'
      };
    }
    if (isSink) {
      return {
        containerClass: `bg-teal-500/30 text-teal-100 border-2 border-teal-400 font-bold ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '★',
        symbolLabelFa: 'سینک',
        symbolLabelEn: 'Sink',
        badgeClass: 'bg-teal-950 text-teal-300'
      };
    }
    if (isRetained) {
      return {
        containerClass: `bg-teal-600/25 text-teal-200 border-2 border-teal-400 font-medium ${isSelected ? 'ring-2 ring-white' : ''}`,
        symbol: '✓',
        symbolLabelFa: 'حفظ',
        symbolLabelEn: 'Retain',
        badgeClass: 'bg-teal-950 text-teal-300'
      };
    }
    // Evicted
    return {
      containerClass: `bg-slate-900/50 text-slate-500 border border-dashed border-slate-700/60 line-through opacity-50 hover:opacity-90 ${isSelected ? 'ring-2 ring-slate-400' : ''}`,
      symbol: '✗',
      symbolLabelFa: 'حذف',
      symbolLabelEn: 'Evicted',
      badgeClass: 'bg-slate-950 text-slate-600'
    };
  }

  // 4. Standard Mode (Vibrant)
  if (isEvidence) {
    return {
      containerClass: `bg-amber-500/25 text-amber-200 border-2 border-amber-400 font-bold shadow-sm shadow-amber-500/20 ${isSelected ? 'ring-2 ring-white' : ''}`,
      symbol: '🎯',
      symbolLabelFa: 'شاهد',
      symbolLabelEn: 'Evidence',
      badgeClass: 'bg-amber-950 text-amber-300'
    };
  }
  if (isSink) {
    return {
      containerClass: `bg-blue-500/25 text-blue-200 border-2 border-blue-400 font-bold ${isSelected ? 'ring-2 ring-white' : ''}`,
      symbol: '★',
      symbolLabelFa: 'سینک',
      symbolLabelEn: 'Sink',
      badgeClass: 'bg-blue-950 text-blue-300'
    };
  }
  if (isRetained) {
    return {
      containerClass: `bg-indigo-500/25 text-indigo-100 border-2 border-indigo-400 font-medium ${isSelected ? 'ring-2 ring-white' : ''}`,
      symbol: '✓',
      symbolLabelFa: 'حفظ',
      symbolLabelEn: 'Retain',
      badgeClass: 'bg-indigo-950 text-indigo-300'
    };
  }
  // Evicted
  return {
    containerClass: `bg-slate-900/50 text-slate-500 border border-dashed border-slate-800 line-through opacity-50 hover:opacity-90 ${isSelected ? 'ring-2 ring-slate-400' : ''}`,
    symbol: '✗',
    symbolLabelFa: 'حذف',
    symbolLabelEn: 'Evicted',
    badgeClass: 'bg-slate-950 text-slate-600'
  };
}

export function getChartPalette(mode: ColorBlindMode) {
  switch (mode) {
    case 'deuteranopia':
      return {
        evidence: '#E69F00',   // Orange
        sink: '#56B4E9',       // Sky Blue
        background: '#0072B2', // Deep Blue
        oracle: '#0072B2',     // Blue
        baseline: '#D55E00',   // Vermillion
        active: '#CC79A7',     // Reddish Purple
        grid: '#334155'
      };
    case 'tritanopia':
      return {
        evidence: '#CC79A7',   // Magenta / Pink
        sink: '#009E73',       // Teal / Bluish Green
        background: '#56B4E9', // Light Blue
        oracle: '#009E73',     // Teal
        baseline: '#E69F00',   // Orange
        active: '#CC79A7',     // Magenta
        grid: '#334155'
      };
    case 'high_contrast':
      return {
        evidence: '#FACC15',   // Bright Yellow
        sink: '#FFFFFF',       // Pure White
        background: '#94A3B8', // Light Gray
        oracle: '#FACC15',     // Yellow
        baseline: '#FFFFFF',   // White
        active: '#38BDF8',     // Light Blue
        grid: '#475569'
      };
    default:
      return {
        evidence: '#f59e0b',   // Amber
        sink: '#3b82f6',       // Blue
        background: '#6366f1', // Indigo
        oracle: '#10b981',     // Emerald
        baseline: '#f43f5e',   // Rose
        active: '#8b5cf6',     // Violet
        grid: '#1e293b'
      };
  }
}
