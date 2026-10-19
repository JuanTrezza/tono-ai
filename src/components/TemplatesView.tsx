import React, { useState } from 'react';
import { TemplateItem } from '../types';
import { ALL_TEMPLATES } from '../constants';
import { ArrowUpRight, Search, BookOpen } from 'lucide-react';

interface TemplatesViewProps {
  onLoadTemplate: (template: TemplateItem) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onLoadTemplate }) => {
  const [search, setSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<string>('all');

  const badges = ['all', 'B2B', 'Storytelling', 'Educativo', 'Resultados', 'Opinión', 'Cultura', 'Video', 'Ventas'];

  const filtered = ALL_TEMPLATES.filter((tpl) => {
    const matchesBadge = selectedBadge === 'all' || tpl.badge.toLowerCase() === selectedBadge.toLowerCase();
    const q = search.toLowerCase().trim();
    if (!q) return matchesBadge;
    const matchesSearch =
      tpl.title.toLowerCase().includes(q) ||
      tpl.topic.toLowerCase().includes(q) ||
      (tpl.description && tpl.description.toLowerCase().includes(q));
    return matchesBadge && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-surface-variant">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Biblioteca de estructuras</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Plantillas editoriales probadas
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
            Elegí una estructura base optimizada para captar atención y adaptala en el creador con tu propia idea o proyecto.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar plantillas..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/70 border border-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 scrollbar-none">
        {badges.map((b) => {
          const isActive = selectedBadge === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBadge(b)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-ring ${
                isActive
                  ? 'bg-on-surface text-surface-container-lowest font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {b === 'all' ? 'Todas' : b}
            </button>
          );
        })}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/80 hover:border-primary-container/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-xs font-semibold">
                  {tpl.badge}
                </span>
                <span className="text-xs text-on-surface-variant capitalize">
                  {tpl.platform === 'x' ? 'X' : tpl.platform} · {tpl.tone}
                </span>
              </div>

              <h2 className="font-headline text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                {tpl.title}
              </h2>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                "{tpl.topic}"
              </p>
            </div>

            <div className="pt-2 border-t border-surface-variant/40 flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant">
                Optimizado para redes
              </span>

              <button
                type="button"
                onClick={() => onLoadTemplate(tpl)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-white text-on-surface text-xs font-semibold transition-all shadow-2xs focus-ring"
              >
                <span>Cargar en el editor</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
