import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />,
  error: <XCircle className="w-5 h-5 text-[#16A34A]" />,
  info: <Info className="w-5 h-5 text-[#15803D]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#15803D]" />,
};

const BORDER: Record<ToastType, string> = {
  success: 'border-[#DCFCE7]',
  error: 'border-[#DCFCE7]',
  info: 'border-[#DCFCE7]',
  warning: 'border-[#DCFCE7]',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId++;
      setToasts(prev => [...prev, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[120] flex flex-col items-end gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex items-center gap-3 pl-4 pr-2.5 py-3 rounded-xl bg-white border ${BORDER[t.type]} shadow-[0_10px_30px_-12px_rgba(22,163,74,0.35)] min-w-[280px] max-w-sm`}
              role="status"
            >
              {ICONS[t.type]}
              <span className="flex-1 text-sm text-[#111827] font-medium">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#16A34A] hover:bg-[#F0FDF4] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};