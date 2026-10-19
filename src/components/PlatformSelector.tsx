import React from 'react';
import { PlatformId } from '../types';
import { PLATFORMS } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatform: PlatformId;
  onSelectPlatform: (platform: PlatformId) => void;
  disabled?: boolean;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelectPlatform,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
          <span>Plataforma destino</span>
        </label>
        <span className="font-mono text-xs text-on-surface-variant">4 disponibles</span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1" role="radiogroup" aria-label="Plataforma de destino">
        {PLATFORMS.map((p) => {
          const isSelected = selectedPlatform === p.id;

          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectPlatform(p.id)}
              className={`text-left p-3 rounded-xl transition-all flex flex-col gap-1 border focus-ring ${
                isSelected
                  ? 'bg-surface-container-low border-primary-container ring-1 ring-primary-container shadow-sm'
                  : 'bg-surface-container-lowest border-surface-variant hover:bg-surface-container-low'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full">
                {/* Platform Icon */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                  {p.id === 'linkedin' && (
                    <div className="w-7 h-7 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.67 1.67 0 1 0 0-3.34 1.67 1.67 0 0 0 0 3.34m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                    </div>
                  )}

                  {p.id === 'instagram' && (
                    <div className="w-7 h-7 rounded-md bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                  )}

                  {p.id === 'x' && (
                    <div className="w-7 h-7 rounded-md bg-stone-900/10 text-stone-900 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                  )}

                  {p.id === 'tiktok' && (
                    <div className="w-7 h-7 rounded-md bg-stone-800/10 text-stone-900 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.43-.05 2.68-1.03 2.97-2.43.13-.53.15-1.08.15-1.62V.02z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Selection state */}
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-container" aria-hidden="true" />
                ) : (
                  <Circle className="w-4 h-4 text-surface-variant" aria-hidden="true" />
                )}
              </div>

              <div className="mt-1">
                <span className="text-sm font-semibold text-on-surface block leading-tight">
                  {p.name}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  Máx. {p.maxChars.toLocaleString('es-ES')} car.
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
