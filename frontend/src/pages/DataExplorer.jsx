import React from 'react';
import { motion } from 'framer-motion';
import { Users, HeartPulse, Calendar, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { getDatasetStats, getDatasetSample, getDistributions, getCorrelation } from '../lib/api';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { UI_STYLES } from '../types/themeStyles';

const CHART_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#22c55e', '#eab308'];

function CorrelationHeatmap({ data, isLight }) {
  if (!data) return null;
  const { features, values } = data;
  const size = features.length;
  const cellSize = Math.min(42, 500 / size);

  const getColor = (val) => {
    if (val >= 0.5) return '#10b981';
    if (val >= 0.25) return '#059669';
    if (val >= 0.05) return isLight ? '#cbd5e1' : '#1e3a4a';
    if (val > -0.05) return isLight ? '#f1f5f9' : '#1e293b';
    if (val > -0.25) return '#f43f5e';
    return '#e11d48';
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block py-2">
        <div className="flex" style={{ marginLeft: cellSize * 2.8 }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="text-[9px] text-slate-400 font-mono truncate"
              style={{
                width: cellSize,
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                transformOrigin: 'bottom left',
                height: cellSize * 1.5,
              }}
            >
              {f}
            </div>
          ))}
        </div>
        {values.map((row, i) => (
          <div key={i} className="flex items-center">
            <div
              className="text-[10px] text-slate-400 font-mono truncate pr-2 text-right"
              style={{ width: cellSize * 2.8 }}
            >
              {features[i]}
            </div>
            {row.map((val, j) => (
              <div
                key={j}
                className="flex items-center justify-center border border-black/20 transition-all hover:scale-125 hover:z-20 cursor-default"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(val),
                  fontSize: cellSize > 30 ? '8px' : '0',
                }}
                title={`${features[i]} × ${features[j]}: ${val}`}
              >
                {cellSize > 30 && (
                  <span className="text-white font-mono font-bold drop-shadow-xs">
                    {val.toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-4 mt-4 ml-24 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#e11d48' }} />
            <span>-1.0 (Corrélation Négative)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }} />
            <span>0 (Nulle)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#10b981' }} />
            <span>+1.0 (Corrélation Positive)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DataExplorer({ currentStyle = 'CARDIOCARE_OCEAN' }) {
  const { data: stats, loading: l1, error: e1 } = useApi(getDatasetStats);
  const { data: sample, loading: l2 } = useApi(getDatasetSample);
  const { data: distributions, loading: l3 } = useApi(getDistributions);
  const { data: correlation, loading: l4 } = useApi(getCorrelation);

  const styleConfig = UI_STYLES[currentStyle] || UI_STYLES.CARDIOCARE_OCEAN;
  const isLight = styleConfig.themeMode === 'light';

  if (l1 || l2 || l3 || l4) return <LoadingSpinner />;
  if (e1) return <ErrorMessage message={e1.message} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Total Patients</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <p className={`text-3xl font-black mt-2 ${styleConfig.mainText}`}>{stats.total_patients}</p>
          <p className={`text-xs mt-1 ${styleConfig.subText}`}>Base de données Cleveland UCI</p>
        </div>

        <div
          className={`p-5 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Taux de Cardiopathie</span>
            <HeartPulse className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black mt-2 text-rose-500">{stats.disease_rate}%</p>
          <p className={`text-xs mt-1 ${styleConfig.subText}`}>{stats.disease_count} cas diagnostiqués</p>
        </div>

        <div
          className={`p-5 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Âge Moyen</span>
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <p className={`text-3xl font-black mt-2 ${styleConfig.mainText}`}>{stats.avg_age} ans</p>
          <p className={`text-xs mt-1 ${styleConfig.subText}`}>Étendue : {stats.age_range[0]} – {stats.age_range[1]} ans</p>
        </div>

        <div
          className={`p-5 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Attributs</span>
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <p className={`text-3xl font-black mt-2 ${styleConfig.mainText}`}>{stats.features_count}</p>
          <p className={`text-xs mt-1 ${styleConfig.subText}`}>13 variables explicatives</p>
        </div>
      </div>

      {/* Distributions Charts Grid */}
      <div>
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${styleConfig.mainText}`}>
            Distributions des Variables Cliniques
          </h3>
          <p className={`text-xs ${styleConfig.subText}`}>
            Histogrammes de fréquence des paramètres dans la cohorte
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {distributions &&
            Object.entries(distributions)
              .slice(0, 9)
              .map(([feat, d], idx) => {
                const chartData = d.labels.map((lab, i) => ({
                  label: lab,
                  val: d.values[i],
                }));
                return (
                  <div
                    key={feat}
                    className={`p-4 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
                  >
                    <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 ${styleConfig.subText}`}>
                      {feat}
                    </h5>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 8, fill: '#94a3b8' }}
                          axisLine={false}
                          interval={d.type === 'histogram' ? 3 : 0}
                        />
                        <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: isLight ? '#ffffff' : '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="val" radius={[3, 3, 0, 0]}>
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              fillOpacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Correlation Matrix */}
      <div
        className={`p-6 rounded-3xl border transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
      >
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
          Matrice de Corrélation de Pearson
        </h4>
        <CorrelationHeatmap data={correlation} isLight={isLight} />
      </div>

      {/* Raw Data Table */}
      <div
        className={`p-6 rounded-3xl border overflow-hidden transition-all ${styleConfig.cardBg} ${styleConfig.cardBorder} ${styleConfig.cardShadow}`}
      >
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${styleConfig.subText}`}>
          Extrait du Jeu de Données (50 premières lignes)
        </h4>
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-700/60 text-slate-400">
                <th className="py-2 px-3 text-left">#</th>
                {sample &&
                  Object.keys(sample[0] || {}).map((col) => (
                    <th key={col} className="py-2 px-3 text-left uppercase">
                      {col}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {sample &&
                sample.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                    {Object.keys(row).map((col) => (
                      <td
                        key={col}
                        className={`py-2 px-3 ${
                          col === 'target'
                            ? row[col] === 1
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400 font-bold'
                            : styleConfig.mainText
                        }`}
                      >
                        {typeof row[col] === 'number'
                          ? Number.isInteger(row[col])
                            ? row[col]
                            : row[col].toFixed(2)
                          : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
