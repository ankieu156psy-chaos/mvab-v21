'use client';

import React from 'react';
import { TestItem } from '@/types';
import { LikertScale } from './LikertScale';

interface QuestionCardProps {
  item: TestItem;
  selectedValue?: number;
  onAnswer: (value: number) => void;
  isFocused?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  selectedValue,
  onAnswer,
  isFocused = false
}) => {
  const isAnswered = selectedValue !== undefined;

  return (
    <div
      id={`q-card-${item.id}`}
      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
        isFocused
          ? 'bg-white border-slate-300 shadow-md ring-1 ring-slate-200'
          : isAnswered
          ? 'bg-white/90 border-slate-200 shadow-sm opacity-90'
          : 'bg-white/60 border-slate-200/70 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Item Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          #{item.stt.toString().padStart(2, '0')}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {item.subscale}
        </span>
      </div>

      {/* Item Prompt Text */}
      <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
        {item.text}
      </p>

      {/* Likert Scale */}
      <LikertScale
        itemId={item.id}
        selectedValue={selectedValue}
        onSelect={onAnswer}
      />
    </div>
  );
};
