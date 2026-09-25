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
    <div className="min-h-screen bg-[#f4efe6] text-stone-900 pb-24 selection:bg-rose-200" ref={containerRef}>
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
        <div className="mt-10 p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-stone-300/80 shadow-lg shadow-stone-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Tiến độ chặng hiện tại: {answeredInDim}/{items.length} câu
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-serif">
              {isComplete
                ? 'Đã hoàn thành toàn bộ câu hỏi của chặng này. Mời bạn dừng chân tại bến đỗ.'
                : 'Vui lòng hoàn thành các câu còn thiếu để mở khóa bến đỗ tiếp theo.'}
            </p>
          </div>

          <button
            type="button"
            disabled={!isComplete}
            onClick={handleFinishDimension}
            className={`w-full sm:w-auto py-3.5 px-7 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md ${
              isComplete
                ? 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-stone-900/20 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            Chốt chặng & Bước vào bến đỗ →
          </button>
        </div>
      </main>
    </div>
  );
};
