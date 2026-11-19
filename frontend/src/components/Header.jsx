import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Brain, Database, Stethoscope, Sparkles } from 'lucide-react';
import { UI_STYLES } from '../types/themeStyles';

const navItems = [
  { id: 'predict', label: 'Prédiction 3D', icon: Stethoscope },
  { id: 'models', label: 'Arène des 4 Modèles', icon: Brain },
  { id: 'data', label: 'Exploration Données (EDA)', icon: Database },
];

export default function Header({ activeTab, onTabChange, currentStyle = 'CARDIOCARE_OCEAN' }) {
  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-500 ${styleConfig.topbarBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3.5 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onTabChange('predict')}
          >
            <div
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl border shadow-md"
              style={{
                backgroundColor: `${styleConfig.accentDanger}15`,
                borderColor: `${styleConfig.accentDanger}30`,
              }}
            >
              <Heart
                className="w-6 h-6 heartbeat-icon"
                fill="currentColor"
                style={{ color: styleConfig.accentDanger }}
              />
              <div
                className="absolute inset-0 rounded-2xl blur-md pointer-events-none"
                style={{ backgroundColor: `${styleConfig.accentDanger}25` }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-extrabold tracking-tight ${styleConfig.mainText}`}>
                  CardioGuard
                </h1>
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${styleConfig.accentPrimary}15`,
                    color: styleConfig.accentPrimary,
                    borderColor: `${styleConfig.accentPrimary}30`,
                  }}
                >
                  AI 3D
                </span>
              </div>
              <p className={`text-[10px] tracking-wider uppercase font-medium ${styleConfig.subText}`}>
                Intelligence Artificielle Médicale
              </p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <nav
            className={`flex items-center gap-1.5 p-1.5 rounded-2xl border transition-colors ${
              isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 rounded-xl shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${styleConfig.accentPrimary}, ${styleConfig.accentSecondary})`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Modèle Actif (91.4% AUC)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
