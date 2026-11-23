import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, subtitle, color = 'teal', delay = 0 }) {
  const colorMap = {
    teal: 'from-cardio-teal/20 to-cardio-teal/5 text-cardio-teal border-cardio-teal/20',
    red: 'from-cardio-red/20 to-cardio-red/5 text-cardio-red border-cardio-red/20',
    green: 'from-cardio-green/20 to-cardio-green/5 text-cardio-green border-cardio-green/20',
    blue: 'from-cardio-blue/20 to-cardio-blue/5 text-cardio-blue border-cardio-blue/20',
    purple: 'from-cardio-purple/20 to-cardio-purple/5 text-cardio-purple border-cardio-purple/20',
    orange: 'from-cardio-orange/20 to-cardio-orange/5 text-cardio-orange border-cardio-orange/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-cardio-muted uppercase tracking-wider font-medium">{label}</p>
          <p className="text-3xl font-bold text-cardio-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-cardio-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-cardio-white">{children}</h2>
      {subtitle && <p className="text-sm text-cardio-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cardio-border border-t-cardio-teal animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-cardio-teal/10 blur-xl" />
      </div>
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div className="glass-card p-6 border-cardio-red/30">
      <p className="text-cardio-red text-sm flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Error: {message}</span>
      </p>
      <p className="text-cardio-muted text-xs mt-2">Make sure the backend is running on port 8000</p>
    </div>
  );
}
