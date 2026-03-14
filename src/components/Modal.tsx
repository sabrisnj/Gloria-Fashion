import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info';
}

export function Modal({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Confirmar', 
  cancelLabel = 'Cancelar', 
  onConfirm, 
  onCancel,
  type = 'info'
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle size={20} />
              </div>
              <button onClick={onCancel} className="text-gray-400 hover:text-ink transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-ink">{title}</h3>
              <p className="text-sm text-gray-custom leading-relaxed">{message}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={onCancel}
                className="flex-grow py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-custom hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-grow py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 ${type === 'danger' ? 'bg-red-600 shadow-red-200' : 'bg-primary shadow-primary/20'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
