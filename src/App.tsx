import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlatformId,
  ToneId,
  VariantNumber,
  VariantState,
  HistoryItem,
  TemplateItem,
} from './types';
import {
  PLATFORMS,
  MAX_TOPIC_LENGTH,
  STORAGE_HISTORY_KEY,
  MAX_HISTORY_ITEMS,
  VARIANT_FOCUSES,
} from './constants';
import { streamPostGeneration } from './services/generate';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { ToneSelector } from './components/ToneSelector';
import { VariantCard } from './components/VariantCard';
import { EmptyState } from './components/EmptyState';
import { PreviewModal } from './components/PreviewModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { TemplatesView } from './components/TemplatesView';
import { Toast } from './components/Toast';
import {
  Sparkles,
  ChevronDown,
  X,
  Smile,
  Hash,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'creador' | 'plantillas'>('creador');

  // Form State
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [tone, setTone] = useState<ToneId>('profesional');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [cta, setCta] = useState('');
  const [emojis, setEmojis] = useState(true);
  const [hashtags, setHashtags] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Focus ref for prompt textarea
  const topicTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Variant Results State
  const [hasGenerated, setHasGenerated] = useState(false);
  const [variants, setVariants] = useState<VariantState[]>([
    {
      variant: 1,
      focus: VARIANT_FOCUSES[1],
      content: '',
      isStreaming: false,
      error: null,
    },
    {
      variant: 2,
      focus: VARIANT_FOCUSES[2],
      content: '',
      isStreaming: false,
      error: null,
    },
    {
      variant: 3,
      focus: VARIANT_FOCUSES[3],
      content: '',
      isStreaming: false,
      error: null,
    },
  ]);

  // Keep controllers in ref to avoid re-renders
  const controllersRef = useRef<Record<VariantNumber, AbortController | null>>({
    1: null,
    2: null,
    3: null,
  });

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    content: string;
    variantFocus: string;
    platform: PlatformId;
  }>({
    isOpen: false,
    content: '',
    variantFocus: '',
    platform: 'linkedin',
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Is any variant streaming?
  const isGeneratingAny = variants.some((v) => v.isStreaming);

  // Generate a single variant
  const generateSingleVariant = useCallback(
    async (variantNum: VariantNumber, overrideTopic?: string) => {
      const targetTopic = (overrideTopic !== undefined ? overrideTopic : topic).trim();
      if (!targetTopic) {
        setValidationError('Por favor ingresá un tema para generar el contenido.');
        topicTextareaRef.current?.focus();
        return;
      }

      // Abort prior request for this variant if active
      if (controllersRef.current[variantNum]) {
        controllersRef.current[variantNum]?.abort();
      }

      const controller = new AbortController();
      controllersRef.current[variantNum] = controller;

      setVariants((prev) =>
        prev.map((v) =>
          v.variant === variantNum
            ? { ...v, isStreaming: true, error: null, content: '' }
            : v
        )
      );

      try {
        const finalContent = await streamPostGeneration({
          params: {
            platform,
            tone,
            topic: targetTopic,
            audience,
            cta,
            emojis,
            hashtags,
            variant: variantNum,
          },
          signal: controller.signal,
          onChunk: (chunkText) => {
            setVariants((prev) =>
              prev.map((v) =>
                v.variant === variantNum ? { ...v, content: chunkText } : v
              )
            );
          },
        });

        setVariants((prev) =>
          prev.map((v) =>
            v.variant === variantNum
              ? { ...v, isStreaming: false, content: finalContent, error: null }
              : v
          )
        );
        return finalContent;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setVariants((prev) =>
            prev.map((v) =>
              v.variant === variantNum
                ? { ...v, isStreaming: false, error: 'Generación detenida' }
                : v
            )
          );
          return null;
        }

        const msg =
          err instanceof Error
            ? err.message
            : 'Error desconocido al generar la variante.';
        setVariants((prev) =>
          prev.map((v) =>
            v.variant === variantNum
              ? { ...v, isStreaming: false, error: msg }
              : v
          )
        );
        return null;
      } finally {
        controllersRef.current[variantNum] = null;
      }
    },
    [platform, tone, topic, audience, cta, emojis, hashtags]
  );

  // Generate All 3 Variants in parallel
  const handleGenerateAll = useCallback(
    async (topicOverride?: string) => {
      const targetTopic = (topicOverride !== undefined ? topicOverride : topic).trim();

      if (!targetTopic) {
        setValidationError('El tema es obligatorio.');
        topicTextareaRef.current?.focus();
        return;
      }

      if (targetTopic.length > MAX_TOPIC_LENGTH) {
        setValidationError(`El tema supera el máximo de ${MAX_TOPIC_LENGTH} caracteres.`);
        return;
      }

      setValidationError(null);
      setHasGenerated(true);

      const promises = [
        generateSingleVariant(1, targetTopic),
        generateSingleVariant(2, targetTopic),
        generateSingleVariant(3, targetTopic),
      ];

      const results = await Promise.allSettled(promises);

      // Record to history once at least one completed successfully
      const successfulContents = results
        .map((r, idx) => ({
          variant: (idx + 1) as VariantNumber,
          focus: VARIANT_FOCUSES[(idx + 1) as VariantNumber],
          content: r.status === 'fulfilled' && typeof r.value === 'string' ? r.value : '',
        }))
        .filter((item) => item.content.trim().length > 0);

      if (successfulContents.length > 0) {
        const newHistoryItem: HistoryItem = {
          id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          platform,
          tone,
          topic: targetTopic,
          audience,
          cta,
          emojis,
          hashtags,
          variants: successfulContents,
        };

        setHistory((prev) => [newHistoryItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      }
    },
    [topic, generateSingleVariant, platform, tone, audience, cta, emojis, hashtags]
  );

  // Stop a single variant
  const handleStopVariant = useCallback((variantNum: VariantNumber) => {
    if (controllersRef.current[variantNum]) {
      controllersRef.current[variantNum]?.abort();
    }
  }, []);

  // Open Preview Modal
  const handleOpenPreview = useCallback(
    (variantNum: VariantNumber, content: string) => {
      setPreviewModal({
        isOpen: true,
        content,
        variantFocus: VARIANT_FOCUSES[variantNum],
        platform,
      });
    },
    [platform]
  );

  // Load a template into the editor
  const handleLoadTemplate = useCallback(
    (tpl: TemplateItem) => {
      setTopic(tpl.topic);
      setPlatform(tpl.platform);
      setTone(tpl.tone);
      if (tpl.audience) setAudience(tpl.audience);
      if (tpl.cta) setCta(tpl.cta);
      setValidationError(null);
      setActiveTab('creador');
      showToast(`Plantilla "${tpl.title}" cargada`);

      // Scroll to editor
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        topicTextareaRef.current?.focus();
      }, 150);
    },
    [showToast]
  );

  // Load an item from history
  const handleLoadHistoryItem = useCallback(
    (item: HistoryItem) => {
      setTopic(item.topic);
      setPlatform(item.platform);
      setTone(item.tone);
      setAudience(item.audience || '');
      setCta(item.cta || '');
      setEmojis(item.emojis);
      setHashtags(item.hashtags);
      setValidationError(null);

      // Load variants content
      setHasGenerated(true);
      setVariants([
        {
          variant: 1,
          focus: VARIANT_FOCUSES[1],
          content: item.variants.find((v) => v.variant === 1)?.content || '',
          isStreaming: false,
          error: null,
        },
        {
          variant: 2,
          focus: VARIANT_FOCUSES[2],
          content: item.variants.find((v) => v.variant === 2)?.content || '',
          isStreaming: false,
          error: null,
        },
        {
          variant: 3,
          focus: VARIANT_FOCUSES[3],
          content: item.variants.find((v) => v.variant === 3)?.content || '',
          isStreaming: false,
          error: null,
        },
      ]);

      showToast('Publicación cargada del historial');
      setActiveTab('creador');
    },
    [showToast]
  );

  // Delete an item from history
  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all history
  const handleClearAllHistory = useCallback(() => {
    setHistory([]);
    showToast('Historial borrado');
  }, [showToast]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + Enter for generate, Ctrl/Cmd + H for history)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if modal or drawer is open
      if (previewModal.isOpen) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Enter
      if (cmdKey && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateAll();
        return;
      }

      // Cmd/Ctrl + H
      if (cmdKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGenerateAll, previewModal.isOpen]);

  const currentPlatformConfig =
    PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Toast Notification Container */}
      <Toast message={toastMessage} />

      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main View Area */}
      {activeTab === 'plantillas' ? (
        <main className="flex-1">
          <TemplatesView onLoadTemplate={handleLoadTemplate} />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT PANEL: Controls & Configuration (5 cols desktop) */}
            <aside className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-primary-fixed to-surface-variant" />

                {/* 1. Platform Selector (4 cards) */}
                <PlatformSelector
                  selectedPlatform={platform}
                  onSelectPlatform={setPlatform}
                  disabled={isGeneratingAny}
                />

                {/* 2. Tone of Voice Chips */}
                <ToneSelector
                  selectedTone={tone}
                  onSelectTone={setTone}
                  disabled={isGeneratingAny}
                />

                {/* 3. Topic Prompt Textarea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="topic-input"
                      className="text-sm font-semibold text-on-surface flex items-center gap-1.5"
                    >
                      <span>¿Sobre qué querés publicar?</span>
                      <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <span
                      className={`font-mono text-xs ${
                        topic.length > MAX_TOPIC_LENGTH
                          ? 'text-error font-semibold'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {topic.length} / {MAX_TOPIC_LENGTH}
                    </span>
                  </div>

                  <div
                    className={`relative rounded-xl bg-surface-container-low transition-all border ${
                      validationError
                        ? 'border-error ring-1 ring-error/40'
                        : 'border-surface-variant focus-within:ring-2 focus-within:ring-primary-container/20 focus-within:border-primary-container focus-within:bg-surface-container-lowest'
                    }`}
                  >
                    <textarea
                      ref={topicTextareaRef}
                      id="topic-input"
                      rows={4}
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Ej: Acabamos de lanzar la versión 2.0 con automatización que reduce un 80% los tiempos de redacción..."
                      className="w-full bg-transparent px-3.5 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between px-3.5 py-2 bg-surface-container/50 border-t border-surface-variant/40 rounded-b-xl">
                      <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        <span>Generación asistida</span>
                      </span>

                      {topic.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setTopic('');
                            setValidationError(null);
                            topicTextareaRef.current?.focus();
                          }}
                          className="text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 focus-ring"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                          <span>Limpiar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {validationError && (
                    <div className="flex items-center gap-1 text-xs text-error font-medium pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>

                {/* 4. Optional Context Accordion */}
                <div className="rounded-xl bg-surface-container-low border border-surface-variant/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-container/40 transition-colors focus-ring"
                    aria-expanded={isAdvancedOpen}
                  >
                    <span className="text-xs font-semibold text-on-surface">
                      Parámetros de contexto adicional (opcional)
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${
                        isAdvancedOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isAdvancedOpen && (
                    <div className="p-4 pt-1 flex flex-col gap-3.5 border-t border-surface-variant/40 bg-surface-container-lowest">
                      {/* Audiencia */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="audience-input" className="text-xs font-medium text-on-surface-variant">
                          Público objetivo / Audiencia
                        </label>
                        <input
                          id="audience-input"
                          type="text"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value)}
                          placeholder="Ej: Fundadores B2B, creadores de contenido, agencias"
                          className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-xs text-on-surface placeholder:text-outline border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container"
                        />
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col gap-1">
                        <label htmlFor="cta-input" className="text-xs font-medium text-on-surface-variant">
                          Llamado a la acción (CTA deseado)
                        </label>
                        <input
                          id="cta-input"
                          type="text"
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="Ej: Probá 14 días gratis o dejá tu comentario abajo"
                          className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-xs text-on-surface placeholder:text-outline border border-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Toggles (Emojis & Hashtags) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Emojis Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/60 cursor-pointer hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                      <span className="text-xs sm:text-sm font-medium text-on-surface">
                        Incluir emojis
                      </span>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={emojis}
                        onChange={(e) => setEmojis(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
                    </div>
                  </label>

                  {/* Hashtags Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-variant/60 cursor-pointer hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                      <span className="text-xs sm:text-sm font-medium text-on-surface">
                        Hashtags óptimos
                      </span>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={hashtags}
                        onChange={(e) => setHashtags(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
                    </div>
                  </label>
                </div>

                {/* 6. Primary Action Button */}
                <button
                  type="button"
                  disabled={isGeneratingAny}
                  onClick={() => handleGenerateAll()}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] focus-ring ${
                    isGeneratingAny
                      ? 'bg-surface-container-high text-on-surface-variant cursor-wait shadow-none'
                      : 'bg-primary-container hover:bg-primary text-white hover:shadow-lg'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                  <span className="text-sm">
                    {isGeneratingAny ? 'Generando variantes...' : 'Generar posts'}
                  </span>
                  <kbd className="ml-1.5 px-1.5 py-0.5 rounded bg-black/20 text-white font-mono text-[10px]">
                    ⌘↵
                  </kbd>
                </button>

                {/* Prompt inspiration starters */}
                <div className="flex flex-col gap-2 pt-1 border-t border-surface-variant/40">
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    <span>O probá estas ideas rápidas:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Anuncio de lanzamiento con beneficios claros',
                      'Una lección aprendida de un error reciente',
                      '3 aprendizajes clave sobre productividad',
                    ].map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTopic(idea);
                          setValidationError(null);
                          topicTextareaRef.current?.focus();
                        }}
                        className="text-left font-mono text-xs px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors truncate max-w-full focus-ring"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT PANEL: Generated Variants or Empty State (7 cols desktop) */}
            <section className="lg:col-span-7 flex flex-col gap-4">
              {hasGenerated ? (
                <>
                  {/* Results Header Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                        3 variantes generadas
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold capitalize">
                        {currentPlatformConfig.name} · Tono {tone}
                      </span>
                    </div>

                    <span className="text-xs text-on-surface-variant font-mono">
                      {isGeneratingAny ? 'Generando en tiempo real...' : 'Listas para publicar'}
                    </span>
                  </div>

                  {/* 3 Fixed Variants */}
                  <div className="flex flex-col gap-4">
                    {variants.map((v) => (
                      <VariantCard
                        key={v.variant}
                        variantNumber={v.variant}
                        focusTitle={v.focus}
                        content={v.content}
                        isStreaming={v.isStreaming}
                        error={v.error}
                        platform={currentPlatformConfig}
                        onRegenerate={(vNum) => generateSingleVariant(vNum)}
                        onStop={(vNum) => handleStopVariant(vNum)}
                        onPreview={(vNum, content) => handleOpenPreview(vNum, content)}
                        onShowToast={showToast}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Empty state with the 3 quick templates */
                <EmptyState onSelectTemplate={handleLoadTemplate} />
              )}
            </section>
          </div>
        </main>
      )}

      {/* Social Media Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        content={previewModal.content}
        initialPlatform={previewModal.platform}
        variantFocus={previewModal.variantFocus}
        onShowToast={showToast}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
        onShowToast={showToast}
      />

      {/* Quiet Footer */}
      <footer className="w-full border-t border-surface-variant bg-surface-container-lowest py-4 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant font-sans">
          <span>© 2025 TONO AI • Productividad asistida para redes</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">Atajos: ⌘↵ Generar · ⌘H Historial</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
