'use client';

import React from 'react';
import { TestItem } from '@/types';
import { LikertScale } from './LikertScale';

interface QuestionCardProps {
  item: TestItem;
  selectedValue?: number;
  onAnswer: (value: number) => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  selectedValue,
  onAnswer,
  isFocused = true,
  onFocus
}) => {
  return (
    <div
      id={`q-card-${item.id}`}
      onClick={onFocus}
      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ease-out ${
        isFocused
          ? 'bg-white border-indigo-300 shadow-xl ring-2 ring-indigo-500/20 scale-[1.01] opacity-100 relative z-10'
          : 'bg-slate-100/60 border-slate-200/60 shadow-none opacity-30 hover:opacity-75 blur-[0.3px] hover:blur-none scale-[0.98] cursor-pointer'
      }`}
    >
      {/* Item Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span
          className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
            isFocused
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-500'
          }`}
        >
          Câu {item.stt.toString().padStart(2, '0')}
        </span>
        {!isFocused && (
          <span className="text-[11px] text-slate-400 font-medium">
            (Bấm để kích hoạt)
          </span>
        )}
      </div>

      {/* Item Prompt Text */}
      <p
        className={`text-base sm:text-lg leading-relaxed transition-colors ${
          isFocused
            ? 'font-semibold text-slate-900'
            : 'font-normal text-slate-500'
        }`}
      >
        {item.text}
      </p>

      {/* Likert Scale */}
      <div className={isFocused ? 'pointer-events-auto' : 'pointer-events-none'}>
        <LikertScale
          itemId={item.id}
          selectedValue={selectedValue}
          onSelect={onAnswer}
        />
      </div>
    </div>
  );
};
