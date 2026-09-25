'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTestStore, DIMENSIONS_ORDER } from '@/stores/test-store';
import { ITEMS_DATA } from '@/lib/items';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';

export const AssessmentStage: React.FC = () => {
  const currentDimIndex = useTestStore((s) => s.currentDimIndex);
  const responses = useTestStore((s) => s.responses);
  const answerQuestion = useTestStore((s) => s.answerQuestion);
  const setPhase = useTestStore((s) => s.setPhase);

  const currentDim = DIMENSIONS_ORDER[currentDimIndex] || 'D1';

  const items = useMemo(() => {
    if (currentDim === 'D8') {
      return ITEMS_DATA.filter((item) => item.dim === 'D8' || item.dim === 'IER');
    }
    return ITEMS_DATA.filter((item) => item.dim === currentDim);
  }, [currentDim]);

  const isComplete = useMemo(
    () => items.every((item) => responses[item.id] !== undefined),
    [items, responses]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Focus on the first unanswered item whenever the dimension changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const firstUnanswered = items.find((item) => responses[item.id] === undefined);
    setActiveId(firstUnanswered?.id || items[0]?.id || null);
  }, [currentDim]);

  const handleAnswer = (itemId: string, value: number, index: number) => {
    answerQuestion(itemId, value);

    // Auto-advance to next question smoothly after 280ms
    setTimeout(() => {
      if (index < items.length - 1) {
        const nextItem = items[index + 1];
        setActiveId(nextItem.id);
        const nextEl = document.getElementById(`q-card-${nextItem.id}`);
        if (nextEl) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = nextEl.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 280);
  };

  const handleFinishDimension = () => {
    if (isComplete) {
      setPhase('checkpoint');
    }
  };

  const answeredInDim = items.filter((i) => responses[i.id] !== undefined).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24" ref={containerRef}>
      <ProgressBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isFocused = activeId ? item.id === activeId : idx === 0;
            return (
              <QuestionCard
                key={item.id}
                item={item}
                selectedValue={responses[item.id]}
                onAnswer={(val) => handleAnswer(item.id, val, idx)}
                isFocused={isFocused}
                onFocus={() => setActiveId(item.id)}
              />
            );
          })}
        </div>

        {/* Bottom Finish Action */}
        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-800">
              Tiến độ chặng hiện tại: {answeredInDim}/{items.length} câu
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isComplete
                ? 'Đã hoàn thành toàn bộ câu hỏi của chặng này.'
                : 'Vui lòng hoàn thành các câu còn thiếu để mở khóa trạm nghỉ.'}
            </p>
          </div>

          <button
            type="button"
            disabled={!isComplete}
            onClick={handleFinishDimension}
            className={`w-full sm:w-auto py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
              isComplete
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            Chốt chặng & Nhận diện sơ bộ →
          </button>
        </div>
      </main>
    </div>
  );
};
