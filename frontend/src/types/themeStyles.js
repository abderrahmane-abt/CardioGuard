export const UI_STYLES = {
  // 1. MEDICARE_LIGHT: Clean White Medical SaaS (Dribbble Mara Bureau & Medicare)
  MEDICARE_LIGHT: {
    id: 'MEDICARE_LIGHT',
    name: 'Style 1 : Medicare Clean',
    shortLabel: 'Medicare Blanc',
    tagline: 'Design épuré moderne, cartes blanches aux ombres douces et accents émeraude',
    inspiration: 'Dribbble Mara Bureau & Medicare SaaS',
    themeMode: 'light',

    appBg: 'bg-slate-100/90 text-slate-900',
    appBgHex: '#f1f5f9',
    mainText: 'text-slate-900',
    subText: 'text-slate-500',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-slate-200',
    topbarBg: 'bg-white/90 border-b border-slate-200',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/80 hover:border-slate-300',
    cardShadow: 'shadow-sm hover:shadow-md shadow-slate-200/80',
    inputBg: 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500',
    sliderTrack: 'linear-gradient(to right, #10b981 0%, #059669 100%)',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25',

    accentPrimary: '#10b981',   // Emerald
    accentSecondary: '#0ea5e9', // Sky blue
    accentDanger: '#f43f5e',    // Coral Rose
    accentWarning: '#f59e0b',   // Amber

    heart3D: {
      ventricleColor: 0xe11d48,
      aortaColor: 0xef4444,
      pulmColor: 0x3b82f6,
      atriaColor: 0xc2410c,
      coronaryColor: 0xffedd5,
      coronaryEmissive: 0xf97316,
      coreLightColor: 0xff2244,
      auraRingColor: 0x10b981,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.65,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false,
      emissiveColor: 0x330505,
      emissiveIntensity: 0.15,
      ambientLightIntensity: 1.5,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12) 0%, rgba(244, 63, 94, 0.05) 45%, transparent 70%)',
    },
  },

  // 2. CARDIOCARE_OCEAN: Deep Aquatic Bioluminescent Navy (NickelFox CardioCare)
  CARDIOCARE_OCEAN: {
    id: 'CARDIOCARE_OCEAN',
    name: 'Style 2 : CardioCare Ocean',
    shortLabel: 'CardioCare Nuit',
    tagline: 'Fond bleu nuit profond, bioluminescence cardiaque et verre fumé aquatique',
    inspiration: 'Dribbble NickelFox CardioCare',
    themeMode: 'dark',

    appBg: 'bg-[#070d1e] text-slate-100',
    appBgHex: '#070d1e',
    mainText: 'text-slate-100',
    subText: 'text-sky-300/70',
    sidebarBg: 'bg-[#0a1226]',
    sidebarBorder: 'border-sky-900/40',
    topbarBg: 'bg-[#0a1226]/90 border-b border-sky-900/40',
    cardBg: 'bg-[#0e1833]/85',
    cardBorder: 'border-sky-800/40 hover:border-sky-500/50',
    cardShadow: 'shadow-lg shadow-sky-950/60',
    inputBg: 'bg-[#0a1226] border-sky-900/60 text-sky-100 focus:border-cyan-400',
    sliderTrack: 'linear-gradient(to right, #06b6d4 0%, #38bdf8 100%)',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    btnPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30',

    accentPrimary: '#06b6d4',   // Oceanic Cyan
    accentSecondary: '#38bdf8', // Light Sky
    accentDanger: '#f43f5e',    // Coral
    accentWarning: '#f59e0b',   // Amber

    heart3D: {
      ventricleColor: 0xdc2626,
      aortaColor: 0xe11d48,
      pulmColor: 0x2563eb,
      atriaColor: 0x9a3412,
      coronaryColor: 0x67e8f9,
      coronaryEmissive: 0x06b6d4,
      coreLightColor: 0xf43f5e,
      auraRingColor: 0x06b6d4,
      roughness: 0.22,
      metalness: 0.18,
      clearcoat: 0.9,
      transmission: 0.1,
      opacity: 0.98,
      transparent: true,
      emissiveColor: 0x660818,
      emissiveIntensity: 0.55,
      ambientLightIntensity: 1.2,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 0%, rgba(244, 63, 94, 0.12) 42%, transparent 72%)',
    },
  },

  // 3. LUME_CYBER: Holographic Neon X-Ray (Lume Cardiac Monitoring)
  LUME_CYBER: {
    id: 'LUME_CYBER',
    name: 'Style 3 : Lume Cyber-XRay',
    shortLabel: 'Lume Cyber',
    tagline: 'Cœur holographique translucide cyan, artères néon incandescentes et noir pur',
    inspiration: 'Dribbble Lume Cardiac Monitoring',
    themeMode: 'dark',

    appBg: 'bg-[#040508] text-cyan-50',
    appBgHex: '#040508',
    mainText: 'text-cyan-50',
    subText: 'text-cyan-400/60',
    sidebarBg: 'bg-[#080a10]',
    sidebarBorder: 'border-cyan-500/25',
    topbarBg: 'bg-[#080a10]/95 border-b border-cyan-500/25',
    cardBg: 'bg-[#0d1017]/90',
    cardBorder: 'border-cyan-500/25 hover:border-cyan-400/60',
    cardShadow: 'shadow-lg shadow-cyan-950/50',
    inputBg: 'bg-[#07090f] border-cyan-500/30 text-cyan-200 focus:border-cyan-400',
    sliderTrack: 'linear-gradient(to right, #00f2fe 0%, #4facfe 100%)',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    btnPrimary: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white shadow-cyan-400/30',

    accentPrimary: '#00f2fe',   // Electric Neon Cyan
    accentSecondary: '#4facfe', // Laser Blue
    accentDanger: '#ff3838',    // Laser Red
    accentWarning: '#ff9f43',   // Neon Orange

    heart3D: {
      ventricleColor: 0x0ea5e9,
      aortaColor: 0x38bdf8,
      pulmColor: 0x0284c7,
      atriaColor: 0x0369a1,
      coronaryColor: 0xff3838,
      coronaryEmissive: 0xff1744,
      coreLightColor: 0x00f2fe,
      auraRingColor: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.75,
      opacity: 0.85,
      transparent: true,
      emissiveColor: 0x0284c7,
      emissiveIntensity: 0.45,
      ambientLightIntensity: 1.0,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.25) 0%, rgba(255, 56, 56, 0.12) 45%, transparent 72%)',
    },
  },

  // 4. ICU_OBSIDIAN: Hospital Critical Care Cockpit (Philips IntelliVue / GE Healthcare)
  ICU_OBSIDIAN: {
    id: 'ICU_OBSIDIAN',
    name: 'Style 4 : ICU Obsidian',
    shortLabel: 'ICU Hôpital',
    tagline: 'Moniteur de réanimation hospitalière, noir absolu OLED et trames haute visibilité',
    inspiration: 'Moniteurs Philips IntelliVue / GE Healthcare',
    themeMode: 'dark',

    appBg: 'bg-[#050811] text-slate-100',
    appBgHex: '#050811',
    mainText: 'text-slate-100',
    subText: 'text-slate-400',
    sidebarBg: 'bg-[#070b16]',
    sidebarBorder: 'border-slate-800',
    topbarBg: 'bg-[#070b16]/95 border-b border-slate-800',
    cardBg: 'bg-[#0a0f1d]/90',
    cardBorder: 'border-slate-800 hover:border-slate-700',
    cardShadow: 'shadow-xl shadow-slate-950/70',
    inputBg: 'bg-[#070b16] border-slate-800 text-slate-200 focus:border-rose-500',
    sliderTrack: 'linear-gradient(to right, #f43f5e 0%, #e11d48 100%)',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    btnPrimary: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/30',

    accentPrimary: '#10b981',   // Surgical Green
    accentSecondary: '#06b6d4', // Cyan
    accentDanger: '#f43f5e',    // Ruby Alert
    accentWarning: '#f59e0b',   // Warning Amber

    heart3D: {
      ventricleColor: 0xbe123c,
      aortaColor: 0xe11d48,
      pulmColor: 0x2563eb,
      atriaColor: 0x9a3412,
      coronaryColor: 0xffedd5,
      coronaryEmissive: 0xf97316,
      coreLightColor: 0xff1e38,
      auraRingColor: 0x10b981,
      roughness: 0.32,
      metalness: 0.06,
      clearcoat: 0.7,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false,
      emissiveColor: 0x450a0a,
      emissiveIntensity: 0.25,
      ambientLightIntensity: 1.25,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.18) 0%, rgba(225, 29, 72, 0.04) 45%, transparent 70%)',
    },
  },
};
