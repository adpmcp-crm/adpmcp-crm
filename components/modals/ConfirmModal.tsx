'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                {title}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-sm leading-relaxed">
                {message}
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 text-sm"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition-all active:scale-95 text-sm shadow-lg ${
                    variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 
                    variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' :
                    'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
