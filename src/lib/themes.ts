export interface ThemeClasses {
  bg: string;
  text: string;
  muted: string;
  cardBg: string;
  button: string;
}

export interface CustomColors {
  bg: string;
  text: string;
  muted: string;
  cardBg: string;
  btnBg: string;
  btnText: string;
}

/** Parse a "custom:JSON" theme string into a CustomColors object, or null. */
export const parseCustomTheme = (theme: string | null | undefined): CustomColors | null => {
  if (!theme || !theme.startsWith('custom:')) return null;
  try {
    return JSON.parse(theme.slice(7)) as CustomColors;
  } catch {
    return null;
  }
};

/** Encode a CustomColors object into the theme string stored in the DB. */
export const encodeCustomTheme = (colors: CustomColors): string =>
  'custom:' + JSON.stringify(colors);

export const getThemeClasses = (theme: string): ThemeClasses => {
  // Custom theme — colors applied via inline styles / CSS injection, not Tailwind classes
  if (theme.startsWith('custom:')) {
    return {
      bg: '',
      text: '',
      muted: 'theme-muted',
      cardBg: 'theme-card',
      button: 'theme-btn',
    };
  }

  switch (theme) {
    case 'dark':
      return { bg: 'bg-zinc-950', text: 'text-zinc-50', muted: 'text-zinc-400', cardBg: 'bg-zinc-900 border border-white/5 shadow-xl', button: 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-md' };
    
    case 'luxury':
      return { bg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black', text: 'text-amber-50', muted: 'text-amber-200/60', cardBg: 'bg-stone-900/60 border border-amber-900/50 backdrop-blur-xl shadow-2xl shadow-black', button: 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-50 hover:from-amber-500 hover:to-amber-700 shadow-md' };
    
    case 'modern':
      return { bg: 'bg-slate-50', text: 'text-slate-900', muted: 'text-slate-500', cardBg: 'bg-white border border-slate-200 shadow-xl shadow-indigo-100/50', button: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg shadow-md' };
    
    case 'colorful':
      return { bg: 'bg-gradient-to-br from-pink-100 via-purple-100 to-teal-100', text: 'text-slate-900', muted: 'text-slate-600', cardBg: 'bg-white/60 border border-white/60 backdrop-blur-xl shadow-xl shadow-purple-200/50', button: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-md hover:shadow-lg' };
    
    case 'ocean':
      return { bg: 'bg-gradient-to-b from-sky-900 via-blue-900 to-slate-900', text: 'text-sky-50', muted: 'text-sky-200/60', cardBg: 'bg-blue-950/40 border border-sky-400/20 backdrop-blur-md shadow-2xl', button: 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 shadow-md hover:scale-105 transition-transform' };
    
    case 'forest':
      return { bg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-green-950 to-black', text: 'text-green-50', muted: 'text-green-200/60', cardBg: 'bg-green-950/40 border border-emerald-500/20 backdrop-blur-md shadow-2xl', button: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:scale-105 transition-transform' };
    
    case 'sunset':
      return { bg: 'bg-gradient-to-br from-orange-400 via-rose-500 to-purple-700', text: 'text-white', muted: 'text-orange-100/80', cardBg: 'bg-white/10 border border-white/20 backdrop-blur-lg shadow-xl shadow-rose-900/30', button: 'bg-white text-rose-600 hover:bg-rose-50 shadow-md' };
    
    case 'midnight':
      return { bg: 'bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-950 to-black', text: 'text-indigo-50', muted: 'text-indigo-200/60', cardBg: 'bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black', button: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' };
    
    case 'rose':
      return { bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100', text: 'text-rose-950', muted: 'text-rose-600', cardBg: 'bg-white border border-rose-100 shadow-xl shadow-rose-200/50', button: 'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-md' };
    
    case 'lavender':
      return { bg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-100', text: 'text-purple-950', muted: 'text-purple-600', cardBg: 'bg-white/80 border border-white backdrop-blur-md shadow-xl shadow-purple-200/50', button: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' };
    
    case 'coffee':
      return { bg: 'bg-gradient-to-br from-stone-100 via-stone-200 to-amber-50', text: 'text-stone-900', muted: 'text-stone-500', cardBg: 'bg-white/90 border border-stone-200 backdrop-blur-sm shadow-xl shadow-stone-300/40', button: 'bg-gradient-to-r from-stone-700 to-stone-900 text-white shadow-md' };
    
    case 'emerald':
      return { bg: 'bg-gradient-to-br from-emerald-50 to-teal-100', text: 'text-emerald-950', muted: 'text-emerald-700', cardBg: 'bg-white border border-emerald-100 shadow-xl shadow-emerald-200/50', button: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' };
    
    case 'cherry':
      return { bg: 'bg-gradient-to-br from-red-50 to-rose-100', text: 'text-red-950', muted: 'text-red-700', cardBg: 'bg-white border border-red-100 shadow-xl shadow-red-200/50', button: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md' };
    
    case 'gold':
      return { bg: 'bg-gradient-to-br from-yellow-50 to-amber-100', text: 'text-amber-950', muted: 'text-amber-700', cardBg: 'bg-white border border-amber-100 shadow-xl shadow-amber-200/50', button: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md' };
    
    case 'slate':
      return { bg: 'bg-gradient-to-br from-slate-100 to-slate-200', text: 'text-slate-900', muted: 'text-slate-500', cardBg: 'bg-white border border-slate-200 shadow-xl shadow-slate-300/50', button: 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-md' };
    
    case 'sapphire':
      return { bg: 'bg-gradient-to-br from-blue-50 to-indigo-100', text: 'text-blue-950', muted: 'text-blue-700', cardBg: 'bg-white border border-blue-100 shadow-xl shadow-blue-200/50', button: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' };
    
    case 'mint':
      return { bg: 'bg-gradient-to-br from-teal-50 to-emerald-100', text: 'text-teal-950', muted: 'text-teal-700', cardBg: 'bg-white border border-teal-100 shadow-xl shadow-teal-200/50', button: 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow-md' };
    
    case 'orange':
      return { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', text: 'text-orange-950', muted: 'text-orange-700', cardBg: 'bg-white border border-orange-100 shadow-xl shadow-orange-200/50', button: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' };
    
    default: // minimal
      return {
        bg: 'bg-white',
        text: 'text-zinc-900',
        muted: 'text-zinc-500',
        cardBg: 'bg-zinc-50 border border-zinc-200 shadow-md',
        button: 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md',
      };
  }
};

export const getThemeMainColor = (theme: string): string => {
  const custom = parseCustomTheme(theme);
  if (custom) return custom.btnBg;

  switch (theme) {
    case 'dark':     return '#1e293b';
    case 'luxury':   return '#b45309';
    case 'modern':   return '#6366f1';
    case 'colorful': return '#ec4899';
    case 'ocean':    return '#0ea5e9';
    case 'forest':   return '#22c55e';
    case 'sunset':   return '#f97316';
    case 'midnight': return '#7c3aed';
    case 'rose':     return '#f43f5e';
    case 'lavender': return '#6366f1';
    case 'coffee':   return '#57534e';
    case 'emerald':  return '#10b981';
    case 'cherry':   return '#ef4444';
    case 'gold':     return '#eab308';
    case 'slate':    return '#334155';
    case 'sapphire': return '#2563eb';
    case 'mint':     return '#22c55e';
    case 'orange':   return '#f97316';
    default:         return '#0f172a'; // minimal/default
  }
};

export const getThemeColors = (theme: string): CustomColors => {
  switch (theme) {
    case 'dark':     return { bg: '#09090b', text: '#fafafa', muted: '#a1a1aa', cardBg: '#18181b', btnBg: '#fafafa', btnText: '#09090b' };
    case 'luxury':   return { bg: '#fafaf9', text: '#1c1917', muted: '#78716c', cardBg: '#ffffff', btnBg: '#b45309', btnText: '#ffffff' };
    case 'modern':   return { bg: '#eef2ff', text: '#1e1b4b', muted: '#4f46e5', cardBg: '#ffffff', btnBg: '#4f46e5', btnText: '#ffffff' };
    case 'colorful': return { bg: '#fff1f2', text: '#4c0519', muted: '#e11d48', cardBg: '#ffffff', btnBg: '#f43f5e', btnText: '#ffffff' };
    case 'ocean':    return { bg: '#f0f9ff', text: '#082f49', muted: '#0284c7', cardBg: '#ffffff', btnBg: '#0ea5e9', btnText: '#ffffff' };
    case 'forest':   return { bg: '#f0fdf4', text: '#052e16', muted: '#16a34a', cardBg: '#ffffff', btnBg: '#22c55e', btnText: '#ffffff' };
    case 'sunset':   return { bg: '#fff7ed', text: '#431407', muted: '#ea580c', cardBg: '#ffffff', btnBg: '#f97316', btnText: '#ffffff' };
    case 'midnight': return { bg: '#faf5ff', text: '#2e1065', muted: '#7c3aed', cardBg: '#ffffff', btnBg: '#8b5cf6', btnText: '#ffffff' };
    case 'rose':     return { bg: '#fff1f2', text: '#4c0519', muted: '#e11d48', cardBg: '#ffffff', btnBg: '#f43f5e', btnText: '#ffffff' };
    case 'lavender': return { bg: '#f5f3ff', text: '#2e1065', muted: '#7c3aed', cardBg: '#ffffff', btnBg: '#8b5cf6', btnText: '#ffffff' };
    case 'coffee':   return { bg: '#f5f5f4', text: '#1c1917', muted: '#78716c', cardBg: '#ffffff', btnBg: '#57534e', btnText: '#ffffff' };
    case 'emerald':  return { bg: '#ecfdf5', text: '#022c22', muted: '#059669', cardBg: '#ffffff', btnBg: '#10b981', btnText: '#ffffff' };
    case 'cherry':   return { bg: '#fef2f2', text: '#450a0a', muted: '#dc2626', cardBg: '#ffffff', btnBg: '#ef4444', btnText: '#ffffff' };
    case 'gold':     return { bg: '#fffbeb', text: '#451a03', muted: '#d97706', cardBg: '#ffffff', btnBg: '#f59e0b', btnText: '#ffffff' };
    case 'slate':    return { bg: '#f8fafc', text: '#0f172a', muted: '#64748b', cardBg: '#ffffff', btnBg: '#475569', btnText: '#ffffff' };
    case 'sapphire': return { bg: '#eff6ff', text: '#1e3a8a', muted: '#2563eb', cardBg: '#ffffff', btnBg: '#3b82f6', btnText: '#ffffff' };
    case 'mint':     return { bg: '#f0fdfa', text: '#134e4a', muted: '#0d9488', cardBg: '#ffffff', btnBg: '#14b8a6', btnText: '#ffffff' };
    case 'orange':   return { bg: '#fff7ed', text: '#431407', muted: '#c2410c', cardBg: '#ffffff', btnBg: '#ea580c', btnText: '#ffffff' };
    default:
      return { bg: '#ffffff', text: '#0f172a', muted: '#64748b', cardBg: '#f8fafc', btnBg: '#0f172a', btnText: '#ffffff' };
  }
};
