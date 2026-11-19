import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DataExplorer from './pages/DataExplorer';
import ModelArena from './pages/ModelArena';
import LivePredictor from './pages/LivePredictor';
import DevStyleSwitcher from './components/DevStyleSwitcher';
import { UI_STYLES } from './types/themeStyles';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [currentStyle, setCurrentStyle] = useState(() => {
    return localStorage.getItem('cardioguard_theme') || 'CARDIOCARE_OCEAN';
  });

  const handleSelectStyle = (styleId) => {
    setCurrentStyle(styleId);
    localStorage.setItem('cardioguard_theme', styleId);
  };

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  useEffect(() => {
    document.body.style.backgroundColor = styleConfig.appBgHex;
    document.body.style.color = isLight ? '#0f172a' : '#f1f5f9';
    if (isLight) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [styleConfig, isLight]);

  return (
    <div className={`min-h-screen ${styleConfig.appBg} transition-colors duration-500 font-sans`}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentStyle={currentStyle}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'predict' && <LivePredictor currentStyle={currentStyle} />}
        {activeTab === 'models' && <ModelArena currentStyle={currentStyle} />}
        {activeTab === 'data' && <DataExplorer currentStyle={currentStyle} />}
      </main>

      {/* Floating Style Switcher */}
      <DevStyleSwitcher
        currentStyle={currentStyle}
        onSelectStyle={handleSelectStyle}
      />

      {/* Footer */}
      <footer
        className={`border-t py-8 mt-16 transition-colors duration-500 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#070b16]/70 border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold ${styleConfig.mainText}`}>
              CardioGuard AI © 2026 — Université Chouaïb Doukkali
            </p>
            <p className={`text-[11px] ${styleConfig.subText} mt-0.5`}>
              Faculté Polydisciplinaire de Sidi Bennour · Module Intelligence Artificielle (Pr. Abderrahmane Ed-daoudy)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className={styleConfig.subText}>UCI Heart Disease</span>
            <span className={styleConfig.subText}>•</span>
            <span className="font-semibold" style={{ color: styleConfig.accentPrimary }}>
              Champion : Random Forest (91.4% AUC)
            </span>
            <span className={styleConfig.subText}>•</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              Thème : {styleConfig.shortLabel}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
