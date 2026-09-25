'use client';

import React, { useState, useEffect } from 'react';
import { useTestStore } from '@/stores/test-store';
import { PREBUILT_INSIGHTS } from '@/lib/insights-prebuilt';
import { ZenBreathingCanvas } from '@/components/three/ZenBreathingCanvas';
import { DimensionInsight } from '@/types';
import Image from 'next/image';

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

  // Viewport camera focus coordinates for the 8 dimensions
  const DIMENSION_VIGNETTES: { name: string; spot: string; transform: string }[] = [
    { name: 'Thủy Đình Bến Đỗ', spot: 'Góc hồ tĩnh lặng', transform: 'scale(1.5) translate(18%, -8%)' },
    { name: 'Đỉnh Núi Mây Mờ', spot: 'Dãy sơn khê xa xăm', transform: 'scale(1.7) translate(-12%, 18%)' },
    { name: 'Cầu Đá & Thôn Xóm', spot: 'Nơi kết nối tương giao', transform: 'scale(1.6) translate(-24%, -10%)' },
    { name: 'Thuyền Nan Giữa Dòng', spot: 'Dòng nước phẳng lặng', transform: 'scale(1.8) translate(8%, -4%)' },
    { name: 'Đàn Cá Vờn Sen', spot: 'Đáy nước trong ngần', transform: 'scale(1.9) translate(26%, -18%)' },
    { name: 'Cánh Chim Trời Xanh', spot: 'Không gian khoáng đạt', transform: 'scale(1.6) translate(10%, 20%)' },
    { name: 'Đài Sen Nở Rộ', spot: 'Tâm điểm thuần khiết', transform: 'scale(2.0) translate(-15%, -22%)' },
    { name: 'Toàn Cảnh Bát Trục', spot: 'Bức tranh trọn vẹn', transform: 'scale(1.1) translate(0%, 0%)' },
  ];

  const currentVignette = DIMENSION_VIGNETTES[currentDimIndex] || DIMENSION_VIGNETTES[0];

  // Mouse Parallax coordinates
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#f4efe6] text-stone-900 overflow-hidden select-none">
      
      {/* 1. Zoomed Landscape Vignette for this specific Dimension */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          transform: `${currentVignette.transform} translate3d(${-mouse.x * 15}px, ${-mouse.y * 12}px, 0)`,
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/assets/ink-landscape-wide.png"
            alt={currentVignette.name}
            fill
            className="object-cover opacity-60 mix-blend-multiply"
          />
        </div>
      </div>

      {/* Subtle Mist Overlay */}
      <div className="absolute inset-0 bg-[#f4efe6]/50 backdrop-blur-[2px] pointer-events-none" />

      {/* 2. Checkpoint Card with Ambient Zen Breathing */}
      <div 
        className="relative max-w-xl w-full z-10 transition-transform duration-300"
        style={{
          transform: `translate3d(${mouse.x * 10}px, ${mouse.y * 8}px, 0)`,
        }}
      >
        <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-stone-300/80 shadow-2xl shadow-stone-900/10">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <div>
                <span className="text-xs font-mono font-bold text-stone-800 tracking-wider uppercase block">
                  BẾN ĐỖ {currentDimIndex + 1}/8 · {currentVignette.name}
                </span>
                <span className="text-[10px] text-stone-400 font-serif">
                  {currentVignette.spot}
                </span>
              </div>
            </div>
            <span className="text-xs text-stone-500 font-mono px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200">
              Nghỉ thở: {secondsSpent}s
            </span>
          </div>

          {/* 3D Ambient Breathing Orb */}
          <ZenBreathingCanvas />

          <h3 className="text-xl font-bold text-stone-900 mb-3 tracking-tight text-center">
            {insight.title}
          </h3>

          {/* Teaser Paragraph */}
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-serif">
            {insight.teaser}
          </p>

          {/* Detail Reveal Card (if requested) */}
          {hasViewedDetail && (
            <div className="mb-6 p-4 rounded-2xl bg-stone-100/80 border border-stone-300/80 text-sm text-stone-800 leading-relaxed font-serif animate-fade-in">
              <div className="font-semibold text-rose-800 mb-1 text-xs uppercase tracking-wider font-mono">
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
                className="flex-1 py-3.5 px-4 rounded-full text-xs sm:text-sm font-semibold border border-stone-300 text-stone-800 bg-white/90 hover:bg-stone-50 active:scale-95 transition-all text-center font-mono uppercase tracking-wider"
              >
                Xem phân tích chi tiết (30s)
              </button>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className={`flex-1 py-3.5 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all text-center shadow-md font-mono uppercase tracking-wider ${
                hasViewedDetail
                  ? 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-stone-900/20 active:scale-95'
                  : 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-900/20 active:scale-95'
              }`}
            >
              {hasViewedDetail
                ? 'Tiếp tục sang Chặng kế tiếp →'
                : 'Bỏ qua & Đi tiếp chặng sau →'}
            </button>
          </div>

          <p className="text-[11px] text-stone-400 text-center mt-5 font-serif">
            Bản phân tích đầy đủ và đề xuất lộ trình sẽ được tổng hợp ở Báo cáo cuối cùng.
          </p>
        </div>
      </div>
    </div>
  );
};
