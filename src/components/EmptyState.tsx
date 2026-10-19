import React from 'react';
import { QUICK_TEMPLATES } from '../constants';
import { TemplateItem } from '../types';
import { Sparkles, ArrowUpRight, Rocket, Brain, Layers } from 'lucide-react';

interface EmptyStateProps {
  onSelectTemplate: (template: TemplateItem) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectTemplate }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'tpl-lanzamiento':
        return <Rocket className="w-5 h-5 text-primary" aria-hidden="true" />;
      case 'tpl-leccion':
        return <Brain className="w-5 h-5 text-primary" aria-hidden="true" />;
      default:
        return <Layers className="w-5 h-5 text-primary" aria-hidden="true" />;
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-10 border border-surface-variant shadow-sm relative overflow-hidden flex flex-col justify-between gap-8">
      {/* Background ambient shapes */}
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-primary-fixed/25 via-secondary-fixed/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-60 h-60 rounded-full bg-gradient-to-tr from-tertiary-fixed/15 to-transparent blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
          <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-1 max-w-xl">
          <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            Lienzo limpio
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Tu próximo contenido viral empieza acá
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Configurá tu plataforma y tono a la izquierda, o probá directamente con una de nuestras plantillas rápidas:
          </p>
        </div>
      </div>

      {/* 3 Quick Templates Cards */}
      <div className="relative z-10 grid grid-cols-1 gap-3">
        {QUICK_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            onClick={() => onSelectTemplate(tpl)}
            className="group p-4 sm:p-5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/80 hover:border-primary-container/40 transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-ring"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTemplate(tpl);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-on-surface flex items-center justify-center shrink-0 border border-surface-variant/50 shadow-2xs group-hover:bg-primary-fixed transition-colors">
                {getIcon(tpl.id)}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-sm sm:text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    {tpl.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-semibold">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mt-0.5">
                  "{tpl.topic}"
                </p>
              </div>
            </div>

            <div className="flex items-center self-end sm:self-center shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors">
                <span>Cargar en el editor</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
