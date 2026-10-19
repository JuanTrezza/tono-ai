import React from 'react';
import { ToneId } from '../types';
import { TONES } from '../constants';

interface ToneSelectorProps {
  selectedTone: ToneId;
  onSelectTone: (tone: ToneId) => void;
  disabled?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onSelectTone,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
          <span>Tono de voz</span>
        </label>
        <span className="text-xs text-on-surface-variant font-medium">Persuasión adaptativa</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label="Tono de voz">
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectTone(tone.id)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all focus-ring ${
                isSelected
                  ? 'bg-primary-fixed text-on-primary-fixed-variant ring-1 ring-primary-container/30 shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {tone.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
