import React, { useEffect, useRef, useState, useMemo } from 'react';
import { HistoryItem, PlatformId } from '../types';
import { formatTimeAgo, copyToClipboard } from '../utils/text';
import {
  X,
  Search,
  Trash2,
  Copy,
  Check,
  ArrowUpRight,
  Database,
  Layers,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onShowToast: (message: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformId | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc key and focus trap
  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filter items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesPlatform;

      const matchesTopic = item.topic.toLowerCase().includes(q);
      const matchesAudience = item.audience.toLowerCase().includes(q);
      const matchesVariant = item.variants.some((v) => v.content.toLowerCase().includes(q));

      return matchesPlatform && (matchesTopic || matchesAudience || matchesVariant);
    });
  }, [history, platformFilter, searchQuery]);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      onShowToast('Copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/30 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-surface-container-lowest z-50 shadow-2xl flex flex-col border-l border-surface-variant transition-transform duration-300 ease-out"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-container-lowest flex flex-col gap-4 border-b border-surface-variant shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="history-drawer-title" className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                  Historial de publicaciones
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-xs font-semibold">
                  {history.length}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Generaciones guardadas en tu navegador
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus-ring"
              title="Cerrar (Esc)"
              aria-label="Cerrar historial"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar publicaciones, temas..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/70 border border-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Network Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Filtrar por plataforma">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'linkedin', label: 'LinkedIn' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'x', label: 'X / Twitter' },
                { id: 'tiktok', label: 'TikTok' },
              ] as const
            ).map((filter) => {
              const isActive = platformFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPlatformFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-ring ${
                    isActive
                      ? 'bg-on-surface text-surface-container-lowest font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Items */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
              <Database className="w-8 h-8 text-surface-variant mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-on-surface">No hay publicaciones en el historial</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                {searchQuery || platformFilter !== 'all'
                  ? 'No se encontraron resultados con los filtros actuales.'
                  : 'Las publicaciones que generes se guardarán automáticamente acá.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const primaryVariant = item.variants[0];
              const totalChars = primaryVariant ? primaryVariant.content.length : 0;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="group p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/50 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-medium capitalize">
                        {item.platform === 'x' ? 'X / Twitter' : item.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium capitalize">
                        {item.tone}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-on-surface font-medium line-clamp-2 leading-snug">
                    {item.topic}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-surface-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-on-surface-variant">
                        {totalChars.toLocaleString('es-ES')} car.
                      </span>
                      <span className="text-surface-variant">·</span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Layers className="w-3 h-3 text-primary" aria-hidden="true" />
                        <span>{item.variants.length} variantes</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadItem(item);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary text-xs font-medium transition-colors shadow-xs border border-surface-variant/60 flex items-center gap-1 focus-ring"
                        title="Cargar en el editor"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Cargar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, primaryVariant?.content || item.topic)}
                        className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-xs transition-colors shadow-xs border border-surface-variant/60 focus-ring"
                        title="Copiar texto principal"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-error text-xs transition-colors shadow-xs border border-surface-variant/60 focus-ring"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-surface-container-low border-t border-surface-variant flex items-center justify-between shrink-0">
          <span className="text-xs text-on-surface-variant font-medium">
            Guardado en este navegador
          </span>

          {history.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-error text-white text-xs font-semibold hover:bg-error/90 transition-colors focus-ring"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container transition-colors focus-ring"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 focus-ring"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Borrar historial</span>
              </button>
            )
          )}
        </div>
      </aside>
    </div>
  );
};
