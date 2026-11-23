import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, Award, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
  LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { getModelComparison, getConfusionMatrices, getRocCurves, getFeatureImportances } from '../lib/api';
import { SectionTitle, LoadingSpinner, ErrorMessage } from '../components/ui';
import { UI_STYLES } from '../types/themeStyles';

const MODEL_COLORS = {
  'Logistic Regression': '#06b6d4',
  'Decision Tree': '#f97316',
  'Random Forest': '#10b981',
  'Support Vector Machine': '#a855f7',
};

function WinnerBanner({ bestModel, metrics, styleConfig }) {
  const isLight = styleConfig.themeMode === 'light';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl transition-all duration-300 ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
    >
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${styleConfig.accentPrimary}15` }}
      />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              borderColor: 'rgba(234, 179, 8, 0.3)',
              color: '#eab308',
            }}
          >
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Modèle Vainqueur
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                Exporté en .pkl
              </span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-black mt-0.5 ${styleConfig.mainText}`}>
              {bestModel}
            </h3>
            <p className={`text-xs mt-1 ${styleConfig.subText}`}>
              Sélectionné automatiquement sur le jeu de test (20% stratifié) et validé par 5-Fold Cross Validation.
            </p>
          </div>
        </div>

        <div className={`flex gap-4 sm:gap-6 self-stretch md:self-auto justify-around border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
          <div className="text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-sky-400" />
            <p className={`text-xl font-black ${styleConfig.mainText}`}>
              {(metrics.accuracy * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] uppercase font-mono text-slate-400">Accuracy</p>
          </div>
          <div className="text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className={`text-xl font-black ${styleConfig.mainText}`}>
              {(metrics.f1_score * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] uppercase font-mono text-slate-400">F1-Score</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className={`text-xl font-black text-emerald-400`}>
              {(metrics.roc_auc * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] uppercase font-mono text-slate-400">ROC-AUC</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ModelArena({ currentStyle = 'CARDIOCARE_OCEAN' }) {
  const { data: comparison, loading: l1, error: e1 } = useApi(getModelComparison);
  const { data: confusionMatrices, loading: l2 } = useApi(getConfusionMatrices);
  const { data: rocCurves, loading: l3 } = useApi(getRocCurves);
  const { data: featureImportances, loading: l4 } = useApi(getFeatureImportances);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  if (l1 || l2 || l3 || l4) return <LoadingSpinner />;
  if (e1) return <ErrorMessage message={e1.message} />;

  const metrics = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc'];
  const metricLabels = {
    accuracy: 'Accuracy',
    precision: 'Précision',
    recall: 'Rappel',
    f1_score: 'F1-Score',
    roc_auc: 'ROC-AUC',
  };

  const chartData = metrics.map((m) => {
    const row = { metric: metricLabels[m] };
    Object.entries(comparison.models).forEach(([name, val]) => {
      row[name] = +(val[m] * 100).toFixed(1);
    });
    return row;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Winner Banner */}
      <WinnerBanner
        bestModel={comparison.best_model}
        metrics={comparison.best_metrics}
        styleConfig={styleConfig}
      />

      {/* Benchmark Multi-bar & Radar */}
      <div>
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${styleConfig.mainText}`}>
            Comparatif des Performances (4 Modèles)
          </h3>
          <p className={`text-xs ${styleConfig.subText}`}>
            Évaluation sur le jeu de test indépendant (20% stratifié)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div
            className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
              Histogramme Comparatif (%)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isLight ? '#ffffff' : '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: isLight ? '#0f172a' : '#e2e8f0',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                {Object.keys(comparison.models).map((name) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    fill={MODEL_COLORS[name] || '#3b82f6'}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Spider Chart */}
          <div
            className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
              Diagramme Radar 5 Axes
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData}>
                <PolarGrid stroke={isLight ? '#cbd5e1' : '#334155'} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis domain={[50, 100]} tick={{ fontSize: 8, fill: '#64748b' }} />
                {Object.keys(comparison.models).map((name) => (
                  <Radar
                    key={name}
                    name={name}
                    dataKey={name}
                    stroke={MODEL_COLORS[name] || '#3b82f6'}
                    fill={MODEL_COLORS[name] || '#3b82f6'}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div
        className={`p-6 rounded-3xl border overflow-hidden transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
      >
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
          Tableau Synthétique des Métriques
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/60 text-slate-400">
                <th className="text-left py-3 px-4 font-bold uppercase">Métrique</th>
                {Object.keys(comparison.models).map((name) => (
                  <th key={name} className="text-center py-3 px-4 font-bold uppercase">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: MODEL_COLORS[name] }}
                      />
                      <span>{name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {metrics.map((m) => {
                const values = Object.values(comparison.models).map((mod) => mod[m]);
                const best = Math.max(...values);
                return (
                  <tr key={m} className="hover:bg-slate-500/5 transition-colors">
                    <td className={`py-3 px-4 font-bold ${styleConfig.mainText}`}>{metricLabels[m]}</td>
                    {Object.entries(comparison.models).map(([name, mod]) => {
                      const isBest = mod[m] === best;
                      return (
                        <td key={name} className="text-center py-3 px-4 font-mono font-medium">
                          <span
                            className={
                              isBest
                                ? 'px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400'
                                : styleConfig.subText
                            }
                          >
                            {(mod[m] * 100).toFixed(2)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROC Curves & Confusion Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curves */}
        <div
          className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
            Courbes ROC (Receiver Operating Characteristic)
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
              />
              <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: isLight ? '#ffffff' : '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Line
                dataKey="fpr"
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Hasard (0.50)"
              />
              {Object.entries(rocCurves || {}).map(([name, curve]) => {
                const curvePoints = curve.fpr.map((fpr, i) => ({ fpr, tpr: curve.tpr[i] }));
                return (
                  <Line
                    key={name}
                    data={curvePoints}
                    dataKey="tpr"
                    stroke={MODEL_COLORS[name]}
                    strokeWidth={2}
                    dot={false}
                    name={`${name} (AUC: ${curve.auc})`}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance of Best Model */}
        <div
          className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
            Importance des Variables (Modèle Random Forest)
          </h4>
          {featureImportances?.['Random Forest'] && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={featureImportances['Random Forest'].features
                  .map((f, i) => ({
                    feature: f,
                    importance: featureImportances['Random Forest'].importance[i],
                  }))
                  .sort((a, b) => b.importance - a.importance)
                  .slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
              >
                <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: isLight ? '#ffffff' : '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportances['Random Forest'].features.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        idx === 0
                          ? styleConfig.accentDanger
                          : idx < 3
                          ? styleConfig.accentPrimary
                          : '#475569'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
