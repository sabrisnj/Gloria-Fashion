import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const colors = {
    success: 'border-green-100 bg-green-50',
    error: 'border-red-100 bg-red-50',
    info: 'border-blue-100 bg-blue-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-[100] p-4 rounded-2xl border shadow-xl flex items-center gap-3 ${colors[type]}`}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium text-ink flex-grow">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-ink transition-colors">
        <X size={18} />
      </button>
    </motion.div>
  );
}
