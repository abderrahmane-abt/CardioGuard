import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Send,
  RotateCcw,
  User,
  Stethoscope,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApi } from '../hooks/useApi';
import { getFeatures, predict } from '../lib/api';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import Heart3DCanvas from '../components/Heart3DCanvas';
import ECGWaveform from '../components/ECGWaveform';
import DonutRiskGauge from '../components/DonutRiskGauge';
import { UI_STYLES } from '../types/themeStyles';

export default function LivePredictor({ currentStyle = 'CARDIOCARE_OCEAN' }) {
  const { data: featureMeta, loading, error } = useApi(getFeatures);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  // Form state
  const [form, setForm] = useState({
    age: 52,
    sex: 1,
    cp: 0,
    trestbps: 130,
    chol: 240,
    fbs: 0,
    restecg: 0,
    thalach: 155,
    exang: 0,
    oldpeak: 1.0,
    slope: 1,
    ca: 0,
    thal: 2,
  });

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Quick Presets
  const applyPreset = (type) => {
    if (type === 'healthy') {
      const h = {
        age: 35,
        sex: 0,
        cp: 2,
        trestbps: 115,
        chol: 175,
        fbs: 0,
        restecg: 0,
        thalach: 175,
        exang: 0,
        oldpeak: 0.0,
        slope: 2,
        ca: 0,
        thal: 2,
      };
      setForm(h);
      runPredictionWithData(h);
    } else if (type === 'at_risk') {
      const r = {
        age: 65,
        sex: 1,
        cp: 0,
        trestbps: 160,
        chol: 290,
        fbs: 1,
        restecg: 1,
        thalach: 110,
        exang: 1,
        oldpeak: 2.8,
        slope: 1,
        ca: 2,
        thal: 3,
      };
      setForm(r);
      runPredictionWithData(r);
    } else {
      const d = {
        age: 52,
        sex: 1,
        cp: 1,
        trestbps: 130,
        chol: 235,
        fbs: 0,
        restecg: 0,
        thalach: 155,
        exang: 0,
        oldpeak: 1.0,
        slope: 1,
        ca: 0,
        thal: 2,
      };
      setForm(d);
      setResult(null);
    }
  };

  const runPredictionWithData = async (data) => {
    setPredicting(true);
    try {
      const res = await predict(data);
      setResult(res);
    } catch (err) {
      console.error(err);
    }
    setPredicting(false);
  };

  const handlePredict = () => runPredictionWithData(form);
  const handleReset = () => applyPreset('standard');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  const contributionData = result
    ? Object.entries(result.feature_contributions || {})
        .map(([key, val]) => ({
          feature: featureMeta?.[key]?.label || key,
          impact: val,
        }))
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-8">
      {/* ── Top Hero / Presets Banner ── */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${styleConfig.badgeBg}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Système d'Aide à la Décision Médicale • IA 3D</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${styleConfig.mainText}`}>
              Prédiction du <span style={{ color: styleConfig.accentPrimary }}>Risque Cardiaque</span>
            </h2>
            <p className={`text-sm mt-2 leading-relaxed ${styleConfig.subText}`}>
              Évaluez en direct le profil cardiovasculaire du patient grâce à notre modèle Random Forest validé (ROC-AUC 91.4%).
              Visualisation anatomique 3D interactive et analyse factorielle explicable.
            </p>

            {/* Presets Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <span className={`text-xs font-semibold ${styleConfig.subText}`}>Profils types :</span>
              <button
                onClick={() => applyPreset('healthy')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Patient Sain (&lt;1% Risque)</span>
              </button>

              <button
                onClick={() => applyPreset('at_risk')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Patient Critique (Cardiopathie Sévère)</span>
              </button>

              <button
                onClick={() => applyPreset('standard')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <div
              className={`p-4 rounded-2xl border flex-1 lg:w-52 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Score ROC-AUC</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold">
                  91.4%
                </span>
              </div>
              <p className={`text-2xl font-black mt-1 ${styleConfig.mainText}`}>Modèle Élite</p>
              <p className="text-[11px] text-emerald-500 mt-0.5">Top Performances ML</p>
            </div>

            <div
              className={`p-4 rounded-2xl border flex-1 lg:w-52 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Base de Données</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 font-bold">
                  UCI
                </span>
              </div>
              <p className={`text-2xl font-black mt-1 ${styleConfig.mainText}`}>303 Patients</p>
              <p className={`text-[11px] mt-0.5 ${styleConfig.subText}`}>13 Variables Cliniques</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Formulaire Clinique Ergonomique (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1 : Données Démographiques */}
          <div
            className={`p-6 rounded-3xl border transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${styleConfig.accentPrimary}20`,
                  color: styleConfig.accentPrimary,
                }}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${styleConfig.mainText}`}>
                  1. Données Démographiques
                </h3>
                <p className={`text-xs ${styleConfig.subText}`}>Profil général du patient</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Âge */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${styleConfig.mainText}`}>Âge du Patient</label>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono"
                    style={{
                      backgroundColor: `${styleConfig.accentPrimary}15`,
                      color: styleConfig.accentPrimary,
                    }}
                  >
                    {form.age} ans
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  value={form.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className={`flex justify-between text-[10px] mt-1 ${styleConfig.subText}`}>
                  <span>20 ans</span>
                  <span>85 ans</span>
                </div>
              </div>

              {/* Sexe (Segmented Buttons) */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${styleConfig.mainText}`}>Sexe Biologique</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('sex', 1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.sex === 1
                        ? `${styleConfig.btnPrimary} border-transparent`
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    ♂ Homme (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('sex', 0)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.sex === 0
                        ? `${styleConfig.btnPrimary} border-transparent`
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    ♀ Femme (0)
                  </button>
                </div>
              </div>

              {/* Type de Douleur Thoracique */}
              <div className="sm:col-span-2">
                <label className={`block text-xs font-semibold mb-1.5 ${styleConfig.mainText}`}>
                  Type de Douleur Thoracique (cp)
                </label>
                <select
                  value={form.cp}
                  onChange={(e) => updateField('cp', parseInt(e.target.value))}
                  className={`w-full ${styleConfig.inputBg}`}
                >
                  <option value={0}>0 : Angine Typique (Typical Angina)</option>
                  <option value={1}>1 : Angine Atypique (Atypical Angina)</option>
                  <option value={2}>2 : Douleur Non-angineuse (Non-anginal Pain)</option>
                  <option value={3}>3 : Asymptomatique (Asymptomatic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 : Mesures Hémodynamiques & Biologiques */}
          <div
            className={`p-6 rounded-3xl border transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${styleConfig.accentSecondary}20`,
                  color: styleConfig.accentSecondary,
                }}
              >
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${styleConfig.mainText}`}>
                  2. Paramètres Cliniques & Biologie
                </h3>
                <p className={`text-xs ${styleConfig.subText}`}>Constantes vitales au repos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Tension Artérielle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${styleConfig.mainText}`}>Tension au Repos (trestbps)</label>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono bg-sky-500/15 text-sky-400">
                    {form.trestbps} mmHg
                  </span>
                </div>
                <input
                  type="range"
                  min={90}
                  max={200}
                  value={form.trestbps}
                  onChange={(e) => updateField('trestbps', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className={`flex justify-between text-[10px] mt-1 ${styleConfig.subText}`}>
                  <span>90 (Optimal)</span>
                  <span>200 (Hypertension)</span>
                </div>
              </div>

              {/* Cholestérol */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${styleConfig.mainText}`}>Cholestérol Sérique (chol)</label>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono bg-sky-500/15 text-sky-400">
                    {form.chol} mg/dl
                  </span>
                </div>
                <input
                  type="range"
                  min={120}
                  max={550}
                  value={form.chol}
                  onChange={(e) => updateField('chol', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className={`flex justify-between text-[10px] mt-1 ${styleConfig.subText}`}>
                  <span>120 (&lt;200 Normal)</span>
                  <span>550 (Hypercholestérolémie)</span>
                </div>
              </div>

              {/* Glycémie à jeun */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${styleConfig.mainText}`}>
                  Glycémie à Jeun &gt; 120 mg/dl (fbs)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('fbs', 0)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.fbs === 0
                        ? `${styleConfig.btnPrimary} border-transparent`
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    Non (&le; 120)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('fbs', 1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.fbs === 1
                        ? 'bg-rose-600 text-white border-transparent'
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    Oui (&gt; 120 Diabète)
                  </button>
                </div>
              </div>

              {/* ECG au Repos */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${styleConfig.mainText}`}>
                  Électrocardiogramme au repos
                </label>
                <select
                  value={form.restecg}
                  onChange={(e) => updateField('restecg', parseInt(e.target.value))}
                  className={`w-full ${styleConfig.inputBg}`}
                >
                  <option value={0}>0 : Normal</option>
                  <option value={1}>1 : Anomalie segment ST-T</option>
                  <option value={2}>2 : Hypertrophie Ventriculaire Gauche</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3 : Épreuve d'Effort & Fluoroscopie */}
          <div
            className={`p-6 rounded-3xl border transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${styleConfig.accentDanger}20`,
                  color: styleConfig.accentDanger,
                }}
              >
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${styleConfig.mainText}`}>
                  3. Épreuve d'Effort & Fluoroscopie
                </h3>
                <p className={`text-xs ${styleConfig.subText}`}>Capacité fonctionnelle et imagerie</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fréquence Cardiaque Maximale */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${styleConfig.mainText}`}>
                    Fréquence Max Atteinte (thalach)
                  </label>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono bg-rose-500/15 text-rose-400">
                    {form.thalach} BPM
                  </span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={210}
                  value={form.thalach}
                  onChange={(e) => updateField('thalach', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Angine à l'effort */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${styleConfig.mainText}`}>
                  Angine Induite par l'Exercice (exang)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('exang', 0)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.exang === 0
                        ? `${styleConfig.btnPrimary} border-transparent`
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    Non (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('exang', 1)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      form.exang === 1
                        ? 'bg-rose-600 text-white border-transparent'
                        : `${styleConfig.inputBg} opacity-70 hover:opacity-100`
                    }`}
                  >
                    Oui (Angine)
                  </button>
                </div>
              </div>

              {/* Dépression ST */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${styleConfig.mainText}`}>
                    Dépression ST (oldpeak)
                  </label>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono bg-amber-500/15 text-amber-400">
                    {form.oldpeak.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={6.0}
                  step={0.1}
                  value={form.oldpeak}
                  onChange={(e) => updateField('oldpeak', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pente ST */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${styleConfig.mainText}`}>
                  Pente du Segment ST (slope)
                </label>
                <select
                  value={form.slope}
                  onChange={(e) => updateField('slope', parseInt(e.target.value))}
                  className={`w-full ${styleConfig.inputBg}`}
                >
                  <option value={0}>0 : Montante (Upsloping)</option>
                  <option value={1}>1 : Plate (Flat)</option>
                  <option value={2}>2 : Descendante (Downsloping)</option>
                </select>
              </div>

              {/* Nb de vaisseaux colorés */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${styleConfig.mainText}`}>
                  Vaisseaux Majeurs Visibles (ca : 0–3)
                </label>
                <select
                  value={form.ca}
                  onChange={(e) => updateField('ca', parseInt(e.target.value))}
                  className={`w-full ${styleConfig.inputBg}`}
                >
                  <option value={0}>0 Vaisseau (Normal)</option>
                  <option value={1}>1 Vaisseau</option>
                  <option value={2}>2 Vaisseaux</option>
                  <option value={3}>3 Vaisseaux (Atteinte Sévère)</option>
                </select>
              </div>

              {/* Thalassémie */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${styleConfig.mainText}`}>
                  Scintigraphie (thal)
                </label>
                <select
                  value={form.thal}
                  onChange={(e) => updateField('thal', parseInt(e.target.value))}
                  className={`w-full ${styleConfig.inputBg}`}
                >
                  <option value={1}>1 : Normal</option>
                  <option value={2}>2 : Défaut Fixe (Fixed Defect)</option>
                  <option value={3}>3 : Défaut Réversible (Reversible Defect)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button: Analyze Risk */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 disabled:opacity-50 cursor-pointer ${styleConfig.btnPrimary}`}
            >
              {predicting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>
                {predicting
                  ? 'Calcul du Diagnostic par IA...'
                  : '⚡ Analyser le Risque Cardiaque (Valider)'}
              </span>
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                isLight
                  ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ── Right Column: 3D Anatomical Heart & Live Diagnostics (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3D Heart Canvas with Skeletal Contractions & Leader Lines */}
          <Heart3DCanvas
            bpm={form.thalach}
            currentStyle={currentStyle}
            form={form}
            result={result}
          />

          {/* Real-time Simulated ECG Lead II Wave */}
          <div
            className={`p-4 rounded-3xl border transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 heartbeat-icon" fill="currentColor" />
                <span className={styleConfig.mainText}>Tracé Électrocardiographique (Dérivation II)</span>
              </div>
              <span className="font-mono text-[11px] text-rose-400">{form.thalach} BPM</span>
            </div>
            <ECGWaveform
              color={
                result?.prediction === 1
                  ? styleConfig.accentDanger
                  : styleConfig.accentPrimary
              }
              height={45}
              speed={2.2}
            />
          </div>

          {/* Diagnostic Result Card */}
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center min-h-[300px] ${styleConfig.cardBg} ${styleConfig.cardBorder}`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border"
                  style={{
                    backgroundColor: `${styleConfig.accentPrimary}15`,
                    borderColor: `${styleConfig.accentPrimary}30`,
                    color: styleConfig.accentPrimary,
                  }}
                >
                  <Activity className="w-7 h-7 heartbeat-icon" />
                </div>
                <h4 className={`text-base font-bold mb-2 ${styleConfig.mainText}`}>
                  En Attente d'Évaluation Clinique
                </h4>
                <p className={`text-xs max-w-xs leading-relaxed ${styleConfig.subText}`}>
                  Renseignez les données sur la gauche ou sélectionnez un profil type, puis cliquez sur{' '}
                  <strong style={{ color: styleConfig.accentPrimary }}>Analyser le Risque</strong> pour lancer
                  l'inférence.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Result Card with Circular Donut Gauge */}
                <div
                  className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${
                    result.prediction === 1
                      ? 'border-rose-500/50 shadow-rose-950/40'
                      : 'border-emerald-500/50 shadow-emerald-950/40'
                  } ${styleConfig.cardShadow}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider ${styleConfig.subText}`}>
                      Bilan Diagnostique par IA
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        result.prediction === 1
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {result.prediction === 1 ? '⚠️ Cardiopathie Détectée' : '✓ Patient Sain (Normal)'}
                    </span>
                  </div>

                  {/* Circular Donut + Category */}
                  <div className="flex items-center justify-around py-2">
                    <DonutRiskGauge
                      probability={result.probability}
                      riskLevel={result.risk_level}
                      size={140}
                    />
                    <div className="space-y-1.5 text-left">
                      <p className={`text-xs font-medium ${styleConfig.subText}`}>Classification du Risque :</p>
                      <h4
                        className={`text-2xl font-black ${
                          result.prediction === 1 ? 'text-rose-500' : 'text-emerald-400'
                        }`}
                      >
                        {result.risk_label}
                      </h4>
                      <p className={`text-xs font-mono ${styleConfig.subText}`}>
                        Probabilité calculée : {(result.probability * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Risk categories reference dots */}
                  <div className={`flex justify-center gap-5 pt-4 border-t ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-400'} text-[10px]`}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Faible (&lt;30%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Modéré (30-60%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Élevé (&gt;60%)
                    </span>
                  </div>
                </div>

                {/* Health Guidance Card */}
                <div
                  className={`p-5 rounded-3xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${styleConfig.mainText}`}>
                      Recommandations & Conduite Médicale
                    </h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl ${
                        isLight ? 'bg-slate-50' : 'bg-slate-900/50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className={styleConfig.mainText}>
                        Contrôle de la tension artérielle au repos (&lt;120/80 mmHg).
                      </span>
                    </div>
                    <div
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl ${
                        isLight ? 'bg-slate-50' : 'bg-slate-900/50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className={styleConfig.mainText}>
                        Pratique régulière d'exercice aérobie modéré (minimum 150 min/semaine).
                      </span>
                    </div>
                    {result.prediction === 1 && (
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <span>
                          Action recommandée : Consultation cardiologique rapide et échocardiographie transthoracique.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Contributing Factors */}
                {contributionData.length > 0 && (
                  <div
                    className={`p-5 rounded-3xl border ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${styleConfig.subText}`}>
                      Facteurs Prédominants pour ce Patient
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={contributionData}
                        layout="vertical"
                        margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                      >
                        <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} />
                        <YAxis
                          dataKey="feature"
                          type="category"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={false}
                          width={140}
                        />
                        <Tooltip
                          contentStyle={{
                            background: isLight ? '#ffffff' : '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: isLight ? '#0f172a' : '#e2e8f0',
                          }}
                        />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                          {contributionData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                i === 0
                                  ? styleConfig.accentDanger
                                  : i < 3
                                  ? styleConfig.accentPrimary
                                  : '#64748b'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
