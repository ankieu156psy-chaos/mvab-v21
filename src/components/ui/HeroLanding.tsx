'use client';

import React from 'react';
import { useTestStore } from '@/stores/test-store';
import { ITEMS_DATA } from '@/lib/items';
import { FluidInkCanvas } from '@/components/three/FluidInkCanvas';

export const HeroLanding: React.FC = () => {
  const setPhase = useTestStore((s) => s.setPhase);
  const answerQuestion = useTestStore((s) => s.answerQuestion);

  const fillQuickDemo = () => {
    // Fill demo profile for quick testing
    ITEMS_DATA.forEach((item) => {
      let score = 3;
      if (item.subscale.includes('Vi mô')) score = 5;
      else if (item.subscale.includes('Trung mô')) score = 4;
      else if (item.subscale.includes('Dung nạp')) score = 4;
      else if (item.id === 'IER_DIR_01') score = 1;
      else if (item.id === 'IER_DIR_02') score = 4;
      else if (item.id === 'IER_INC_01a') score = 5;
      else if (item.id === 'IER_INC_01b') score = 1;
      else score = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
      answerQuestion(item.id, score);
    });
    setPhase('report');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      {/* 3D Fluid Ink Particle Simulation */}
      <FluidInkCanvas />

      {/* Subtle Background Glow Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Glass Card */}
      <div className="relative max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Hệ Thống Đánh Giá Tâm Trắc Chuẩn Hóa
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          MVAB <span className="text-indigo-400">v2.1</span> Engine
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 max-w-md mx-auto">
          Khung định hướng nghề nghiệp, phong cách can thiệp lâm sàng và ranh giới giám sát dành cho nhà thực hành tâm lý học.
        </p>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 py-4 px-2 rounded-2xl bg-white/5 border border-white/5 mb-8 text-center">
          <div>
            <div className="text-lg font-bold text-white font-mono">84</div>
            <div className="text-[10px] text-slate-400">Câu hỏi chuẩn hóa</div>
          </div>
          <div className="border-x border-white/10">
            <div className="text-lg font-bold text-white font-mono">8</div>
            <div className="text-[10px] text-slate-400">Trục năng lực</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">15'</div>
            <div className="text-[10px] text-slate-400">Thời gian làm</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPhase('consent')}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Bắt đầu bài đánh giá →
          </button>

          <button
            type="button"
            onClick={fillQuickDemo}
            className="text-xs text-slate-400 hover:text-white transition py-1"
          >
            ⚡ Trải nghiệm nhanh kết quả mẫu (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
