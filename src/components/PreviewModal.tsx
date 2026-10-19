import React, { useEffect, useRef, useState } from 'react';
import { PlatformId } from '../types';
import { PLATFORMS } from '../constants';
import { calculateReadingTime, copyToClipboard } from '../utils/text';
import {
  X,
  Copy,
  Check,
  Clock,
  BarChart3,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  Globe,
  Music,
} from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  initialPlatform: PlatformId;
  variantFocus: string;
  onShowToast: (msg: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  content,
  initialPlatform,
  variantFocus,
  onShowToast,
}) => {
  const [activePlatform, setActivePlatform] = useState<PlatformId>(initialPlatform);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Sync initial platform when opened
  useEffect(() => {
    if (isOpen) {
      setActivePlatform(initialPlatform);
    }
  }, [isOpen, initialPlatform]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlatformConfig =
    PLATFORMS.find((p) => p.id === activePlatform) || PLATFORMS[0];
  const charCount = content.length;
  const maxChars = currentPlatformConfig.maxChars;
  const isOverLimit = charCount > maxChars;
  const percentUsed = Math.min(100, Math.round((charCount / maxChars) * 100));
  const readingTime = calculateReadingTime(content);

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopied(true);
      onShowToast('Copiado desde la vista previa');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="bg-surface-container-lowest px-5 py-3.5 border-b border-surface-variant flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h2 id="preview-modal-title" className="font-headline text-base sm:text-lg font-semibold text-on-surface">
              Vista previa de publicación
            </h2>

            {/* Platform Selector Tabs */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl gap-1" role="tablist">
              {PLATFORMS.map((p) => {
                const isActive = p.id === activePlatform;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePlatform(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors focus-ring ${
                      isActive
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
              Esc
            </kbd>
            <button
              ref={firstFocusableRef}
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus-ring"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Body: Mockup + Lateral Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Feed Mockup Slate (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-8 bg-surface-container-low/60 flex flex-col justify-center items-center overflow-y-auto min-h-[400px]">
            {/* LINKEDIN MOCKUP */}
            {activePlatform === 'linkedin' && (
              <article className="w-full max-w-[560px] bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/80 p-5 flex flex-col gap-3.5 animate-in fade-in duration-150">
                {/* Author Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-headline font-semibold text-sm border border-surface-variant">
                      TN
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-on-surface">Tu nombre</span>
                        <span className="text-xs text-on-surface-variant">· 1er</span>
                      </div>
                      <span className="text-xs text-on-surface-variant leading-tight">
                        Estratega de Contenido & Marca Personal
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
                        <span>Ahora</span>
                        <span>·</span>
                        <span>Editado</span>
                        <span>·</span>
                        <Globe className="w-3 h-3 text-on-surface-variant" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <button type="button" className="text-on-surface-variant p-1 rounded-full hover:bg-surface-container">
                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap font-sans selection:bg-primary-fixed">
                  {content}
                </div>

                {/* LinkedIn Action Ribbon - Clean, without fake reactions or fake comment numbers */}
                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-surface-container text-on-surface-variant">
                  <button type="button" className="py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors text-xs font-medium">
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Reaccionar</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors text-xs font-medium">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Comentar</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors text-xs font-medium">
                    <Repeat className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Compartir</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-surface-container hover:text-on-surface transition-colors text-xs font-medium">
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </div>
              </article>
            )}

            {/* X / TWITTER MOCKUP */}
            {activePlatform === 'x' && (
              <article className="w-full max-w-[560px] bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/80 p-5 flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-headline font-semibold text-sm shrink-0">
                    TN
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-bold text-on-surface">Tu nombre</span>
                        <span className="text-on-surface-variant">@tunombre · Ahora</span>
                      </div>
                      <button type="button" className="text-on-surface-variant p-1 rounded-full hover:bg-surface-container">
                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="pt-2 text-sm leading-relaxed text-on-surface whitespace-pre-wrap font-sans selection:bg-primary-fixed">
                      {content}
                    </div>

                    {/* Actions Ribbon - NO fake numbers */}
                    <div className="flex items-center justify-between pt-4 text-on-surface-variant max-w-md">
                      <button type="button" className="p-1.5 rounded-full hover:bg-surface-container hover:text-primary transition-colors" title="Responder">
                        <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" className="p-1.5 rounded-full hover:bg-surface-container hover:text-emerald-600 transition-colors" title="Repostear">
                        <Repeat className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" className="p-1.5 rounded-full hover:bg-surface-container hover:text-rose-600 transition-colors" title="Me gusta">
                        <Heart className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" className="p-1.5 rounded-full hover:bg-surface-container hover:text-primary transition-colors" title="Guardar">
                        <Bookmark className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button type="button" className="p-1.5 rounded-full hover:bg-surface-container hover:text-on-surface transition-colors" title="Compartir">
                        <Share2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* INSTAGRAM MOCKUP */}
            {activePlatform === 'instagram' && (
              <article className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/80 overflow-hidden flex flex-col animate-in fade-in duration-150">
                {/* Profile Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
                      <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center font-headline text-xs font-bold text-on-surface">
                        TN
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-on-surface">tunombre</span>
                  </div>
                  <button type="button" className="text-on-surface-variant p-1">
                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Minimalist Graphic Card Simulation */}
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high flex flex-col justify-center items-center p-6 text-center border-b border-surface-container">
                  <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-mono text-xs font-semibold shadow-sm mb-3">
                    TONO AI
                  </span>
                  <p className="font-headline text-base sm:text-lg font-bold text-on-surface line-clamp-4 leading-snug">
                    {content.slice(0, 140)}...
                  </p>
                </div>

                {/* Action Icons */}
                <div className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-on-surface">
                    <div className="flex items-center gap-3">
                      <button type="button" className="hover:text-error transition-colors">
                        <Heart className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button type="button" className="hover:text-primary transition-colors">
                        <MessageSquare className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button type="button" className="hover:text-primary transition-colors">
                        <Send className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                    <button type="button" className="hover:text-on-surface transition-colors">
                      <Bookmark className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Caption */}
                  <div className="text-xs sm:text-sm text-on-surface whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    <strong className="font-semibold mr-1.5">tunombre</strong>
                    {content}
                  </div>
                </div>
              </article>
            )}

            {/* TIKTOK MOCKUP */}
            {activePlatform === 'tiktok' && (
              <article className="w-full max-w-[400px] bg-stone-950 text-white rounded-2xl shadow-xl overflow-hidden flex flex-col p-5 relative border border-stone-800 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-headline font-bold text-xs">
                      TN
                    </div>
                    <span className="font-semibold text-sm">@tunombre</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">Guión / Caption</span>
                </div>

                <div className="py-4 flex-1 text-sm leading-relaxed text-stone-100 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                  {content}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-stone-300 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Music className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate max-w-[180px]">Sonido original - Tu nombre</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-stone-300" aria-hidden="true" />
                    <MessageSquare className="w-4 h-4 text-stone-300" aria-hidden="true" />
                    <Bookmark className="w-4 h-4 text-stone-300" aria-hidden="true" />
                    <Share2 className="w-4 h-4 text-stone-300" aria-hidden="true" />
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Right Lateral Panel: ONLY Calculated Data (4 cols) */}
          <aside className="lg:col-span-4 bg-surface-container-lowest p-5 sm:p-6 border-t lg:border-t-0 lg:border-l border-surface-variant flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                  Métricas calculadas
                </span>
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  Detalles de publicación
                </h3>
              </div>

              {/* Character Count Ratio Card */}
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2.5 border border-surface-variant/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    <span>Conteo de caracteres</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isOverLimit ? 'text-error' : 'text-on-surface'
                    }`}
                  >
                    {charCount.toLocaleString('es-ES')} / {maxChars.toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      isOverLimit ? 'bg-error' : 'bg-primary-container'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>{isOverLimit ? 'Límite excedido' : 'Uso del límite'}</span>
                  <span className={isOverLimit ? 'text-error font-semibold' : 'text-primary font-semibold'}>
                    {percentUsed}%
                  </span>
                </div>
              </div>

              {/* Reading Time Card */}
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-variant/40">
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant">Tiempo estimado de lectura</span>
                  <span className="text-sm font-semibold text-on-surface mt-0.5">
                    {readingTime}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">
                    Calculado a ≈200 palabras/min
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface shadow-sm border border-surface-variant/50">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
              </div>

              {/* Enfoque info */}
              <div className="px-3.5 py-2.5 rounded-lg bg-secondary-fixed/40 text-xs text-on-secondary-fixed flex items-center justify-between border border-secondary-fixed/50">
                <span className="text-on-secondary-fixed-variant">Enfoque:</span>
                <span className="font-semibold text-on-secondary-fixed">{variantFocus}</span>
              </div>
            </div>

            {/* Modal Action Buttons: ONLY Copiar and Cerrar */}
            <div className="flex flex-col gap-2 pt-4 border-t border-surface-variant/60">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-container text-white hover:bg-primary text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 focus-ring"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-medium transition-colors focus-ring"
              >
                Cerrar
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
