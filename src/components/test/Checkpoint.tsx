'use client';

import React, { useState, useEffect } from 'react';
import { useTestStore } from '@/stores/test-store';
import { PREBUILT_INSIGHTS } from '@/lib/insights-prebuilt';
import { ZenBreathingCanvas } from '@/components/three/ZenBreathingCanvas';
import { DimensionInsight } from '@/types';

export const Checkpoint: React.FC = () => {
  const currentDim = useTestStore((s) => s.getCurrentDimension());
  const currentDimIndex = useTestStore((s) => s.currentDimIndex);
  const recordCheckpointChoice = useTestStore((s) => s.recordCheckpointChoice);
  const proceedToNextDimension = useTestStore((s) => s.proceedToNextDimension);
  const responses = useTestStore((s) => s.responses);

  const [hasViewedDetail, setHasViewedDetail] = useState(false);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [insight, setInsight] = useState<DimensionInsight>(
    PREBUILT_INSIGHTS[currentDim] || PREBUILT_INSIGHTS.D1
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gọi Gemini API thời gian thực (fallback sẵn có nếu chưa có key hoặc mạng chậm)
  useEffect(() => {
    let isSubscribed = true;
    const fetchAI = async () => {
      setIsLoadingAI(true);
      try {
        const res = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dimension: currentDim,
            scores: responses
          })
        });
        const data = await res.json();
        if (isSubscribed && data.insight) {
          setInsight(data.insight);
        }
      } catch (err) {
        console.warn('Fallback prebuilt insight used');
      } finally {
        if (isSubscribed) setIsLoadingAI(false);
      }
    };

    fetchAI();
    return () => { isSubscribed = false; };
  }, [currentDim]);

  const handleReadDetail = () => {
    setHasViewedDetail(true);
    recordCheckpointChoice('read_detail');
  };

  const handleProceed = () => {
    if (!hasViewedDetail) {
      recordCheckpointChoice('skip_continue');
    }
    proceedToNextDimension();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Ambient Breathing Container */}
      <div className="relative max-w-xl w-full">
        {/* Soft Ambient Glow (Zen Breathing effect) */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-slate-400/20 to-indigo-500/20 blur-xl opacity-75 animate-pulse" />

        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-xs font-bold text-indigo-900 tracking-wider uppercase">
                Trạm nghỉ nhận thức · Chặng {currentDimIndex + 1}/8
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Nghỉ ngơi: {secondsSpent}s
            </span>
          </div>

          {/* 3D Ambient Breathing Orb */}
          <ZenBreathingCanvas />

          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight text-center">
            {insight.title}
          </h3>

          {/* Teaser Paragraph (Cliffhanger) */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {insight.teaser}
          </p>

          {/* Detail Reveal Card (if requested) */}
          {hasViewedDetail && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed animate-fade-in">
              <div className="font-semibold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                Phân tích sơ bộ:
              </div>
              {insight.detail}
            </div>
          )}

          {/* Two Action Buttons (Implicit behavioral measure) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!hasViewedDetail && (
              <button
                type="button"
                onClick={handleReadDetail}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition-all text-center"
              >
                Xem phân tích chi tiết (30s)
              </button>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all text-center shadow-sm ${
                hasViewedDetail
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              {hasViewedDetail
                ? 'Tiếp tục sang Chặng kế tiếp →'
                : 'Bỏ qua & Đi tiếp câu tiếp theo →'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            Bản phân tích đầy đủ và đề xuất lộ trình sẽ được tổng hợp ở Báo cáo cuối cùng.
          </p>
        </div>
      </div>
    </div>
  );
};
