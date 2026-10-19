import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl border border-inverse-surface/40 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 text-error shrink-0" aria-hidden="true" />
      )}
      <span className="font-sans text-sm font-medium">{message}</span>
    </div>
  );
};
