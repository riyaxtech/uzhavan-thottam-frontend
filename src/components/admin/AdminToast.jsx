import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const typeStyles = {
    success: {
      bg: 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/95 border-rose-500/40 text-rose-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/95 border-amber-500/40 text-amber-100',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/95 border-slate-700 text-slate-100',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    },
  };

  const style = typeStyles[toast.type || 'info'] || typeStyles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-md w-full sm:w-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={toast.id || toast.message}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${style.bg}`}
        >
          {style.icon}
          <div className="flex-1 pr-2">
            {toast.title && (
              <h4 className="text-sm font-semibold tracking-wide mb-0.5">{toast.title}</h4>
            )}
            <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminToast;
