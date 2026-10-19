import React from 'react';
import { Sparkles, History } from 'lucide-react';
import { isDemoMode } from '../services/generate';

interface HeaderProps {
  activeTab: 'creador' | 'plantillas';
  onSelectTab: (tab: 'creador' | 'plantillas') => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenHistory,
  historyCount,
}) => {
  // Determine key label based on platform
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const historyKeyLabel = isMac ? '⌘H' : 'Ctrl+H';

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-variant">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* TONO Stylized Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <span className="font-headline font-bold text-base tracking-tighter">T</span>
            </div>
            <span className="font-headline text-xl font-bold tracking-tight text-on-surface">
              TONO
            </span>
          </div>

          {/* Model tag - Strictly "Hecho con Gemini" without version/model names */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Hecho con Gemini</span>
          </div>

          {/* Demo Mode Badge if no VITE_API_URL */}
          {isDemoMode && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-mono font-medium">
              Modo demo
            </span>
          )}
        </div>

        {/* Navigation Zone - ONLY "Creador" and "Plantillas" */}
        <nav
          className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl"
          aria-label="Navegación principal"
        >
          <button
            type="button"
            onClick={() => onSelectTab('creador')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'creador'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            aria-current={activeTab === 'creador' ? 'page' : undefined}
          >
            Creador
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('plantillas')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'plantillas'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            aria-current={activeTab === 'plantillas' ? 'page' : undefined}
          >
            Plantillas
          </button>
        </nav>

        {/* Right Action Zone: History button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-sm font-medium focus-ring"
            title={`Abrir historial (${historyKeyLabel})`}
          >
            <History className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-mono font-semibold">
                {historyCount}
              </span>
            )}
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
              {historyKeyLabel}
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
