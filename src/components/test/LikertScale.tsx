'use client';

import React from 'react';

interface LikertScaleProps {
  itemId: string;
  selectedValue?: number;
  onSelect: (value: number) => void;
}

export const LikertScale: React.FC<LikertScaleProps> = ({
  selectedValue,
  onSelect
}) => {
  const points = [1, 2, 3, 4, 5];

  return (
    <div className="w-full mt-3">
      {/* 5 Equal Buttons */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full">
        {points.map((pt) => {
          const isSelected = selectedValue === pt;
          return (
            <button
              key={pt}
              type="button"
              onClick={() => onSelect(pt)}
              className={`h-11 sm:h-12 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90 active:scale-95'
              }`}
            >
              {pt}
            </button>
          );
        })}
      </div>

      {/* Neutral Anchor Labels */}
      <div className="flex justify-between px-1 mt-2 text-[11px] text-slate-400 font-medium tracking-wide">
        <span>1 — Rất không đồng ý</span>
        <span>3 — Phân vân</span>
        <span>5 — Rất đồng ý</span>
      </div>
    </div>
  );
};
