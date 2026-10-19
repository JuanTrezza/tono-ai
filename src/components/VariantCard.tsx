import React, { useState } from 'react';
import { VariantNumber, PlatformConfig } from '../types';
import { calculateReadingTime, copyToClipboard } from '../utils/text';
import { Copy, Check, RefreshCw, Eye, StopCircle, Clock, AlertCircle } from 'lucide-react';

interface VariantCardProps {
  variantNumber: VariantNumber;
  focusTitle: string;
  content: string;
  isStreaming: boolean;
  error: string | null;
  platform: PlatformConfig;
  onRegenerate: (variantNumber: VariantNumber) => void;
  onStop: (variantNumber: VariantNumber) => void;
  onPreview: (variantNumber: VariantNumber, content: string) => void;
  onShowToast: (message: string) => void;
}

export const VariantCard: React.FC<VariantCardProps> = ({
  variantNumber,
  focusTitle,
  content,
  isStreaming,
  error,
  platform,
  onRegenerate,
  onStop,
  onPreview,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  const charCount = content.length;
  const maxChars = platform.maxChars;
  const isOverLimit = charCount > maxChars;
  const percentUsed = Math.min(100, Math.round((charCount / maxChars) * 100));
  const readingTime = calculateReadingTime(content);

  const handleCopy = async () => {
    if (!content.trim()) return;
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      onShowToast('Copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      className={`bg-surface-container-lowest rounded-xl p-5 sm:p-6 shadow-sm border transition-shadow flex flex-col gap-4 relative overflow-hidden ${
        isStreaming
          ? 'border-primary-container ring-1 ring-primary-container/20 shadow-md'
          : 'border-surface-variant hover:shadow-md'
      }`}
      aria-live="polite"
    >
      {/* Subtle shimmer during streaming */}
      {isStreaming && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-fixed/15 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-surface-container pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-mono text-xs font-semibold">
            #{variantNumber}
          </span>
          <span className="text-sm font-semibold text-on-surface">
            Enfoque: {focusTitle}
          </span>
        </div>

        {/* Status / Reading time */}
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-primary-container animate-spin" aria-hidden="true" />
              <span>Generando con Gemini...</span>
            </div>
          ) : content.trim() ? (
            <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-tertiary" aria-hidden="true" />
              <span>Lectura: {readingTime}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content or Error */}
      <div className="flex flex-col gap-3 relative z-10 min-h-[90px]">
        {error ? (
          <div className="p-4 rounded-xl bg-error-container/40 border border-error/20 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => onRegenerate(variantNumber)}
              className="self-start mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-error/30 text-error hover:bg-error-container/20 text-xs font-medium transition-colors focus-ring"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap font-sans selection:bg-primary-fixed">
            {content}
            {isStreaming && (
              <span
                className="inline-block w-2 h-4 bg-primary-container ml-0.5 align-middle animate-cursor"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar & Character Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 bg-surface-container-low/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:px-6 rounded-b-xl border-t border-surface-variant/40 relative z-10">
        {/* Character meter */}
        <div className="flex items-center gap-2.5">
          <span
            className={`font-mono text-xs font-medium ${
              isOverLimit ? 'text-error font-semibold' : 'text-on-surface-variant'
            }`}
          >
            {charCount.toLocaleString('es-ES')} / {maxChars.toLocaleString('es-ES')} car.
          </span>
          <div className="w-16 h-1.5 rounded-full bg-surface-variant overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isOverLimit ? 'bg-error' : isStreaming ? 'bg-primary-container animate-pulse' : 'bg-primary-container'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <button
              type="button"
              onClick={() => onStop(variantNumber)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-error text-xs font-medium transition-colors focus-ring"
            >
              <StopCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Detener</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={!content.trim()}
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border focus-ring ${
                  copied
                    ? 'bg-surface-container-lowest text-primary border-primary/30'
                    : 'bg-surface-container-lowest text-on-surface border-surface-variant hover:bg-surface-container'
                } ${!content.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Copiar texto al portapapeles"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    <span className="text-primary font-semibold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden="true" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onRegenerate(variantNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface border border-surface-variant hover:bg-surface-container text-xs font-medium transition-colors focus-ring"
                title="Regenerar solo esta variante"
              >
                <RefreshCw className="w-3.5 h-3.5 text-on-surface-variant" aria-hidden="true" />
                <span>Regenerar</span>
              </button>

              <button
                type="button"
                disabled={!content.trim()}
                onClick={() => onPreview(variantNumber, content)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-white hover:bg-primary text-xs font-medium transition-colors shadow-sm focus-ring ${
                  !content.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title="Ver vista previa en formato de red social"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Vista previa</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
