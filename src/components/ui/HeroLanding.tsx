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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#060913] via-[#091122] to-[#040711] text-white overflow-hidden select-none">
      {/* 3D Ancient Lotus Pond Canvas with Water Ripples */}
      <FluidInkCanvas />

      {/* Subtle Moon & Night Atmosphere Glow */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-100/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Center Frosted Dó Card */}
      <div className="relative max-w-xl w-full p-8 sm:p-11 rounded-3xl bg-slate-950/50 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center">
        {/* Poetic Chapter Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-amber-500/20 text-xs font-mono tracking-widest text-amber-200/90 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          CHƯƠNG 00 · CỔNG VÀO HỒ NGUYỆT
        </div>

        {/* Poetic Kage-style Headline */}
        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold mb-2">
          Nơi tĩnh lặng soi tỏ điều chưa thấy
        </h2>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          MVAB <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-300 bg-clip-text text-transparent">v2.1</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-8 max-w-md mx-auto font-light">
          Tám không gian tâm trí. Tám chiều kích nội tại. Hãy bước vào một hành trình phản chiếu định hướng nghề nghiệp và phong cách thực hành tâm lý của chính bạn.
        </p>

        {/* 3 Metric Pills with Ancient Minimalist Border */}
        <div className="grid grid-cols-3 gap-2 py-4 px-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-8 text-center">
          <div>
            <div className="text-lg font-bold text-amber-100 font-mono">84</div>
            <div className="text-[10px] text-slate-400">Câu hỏi định chuẩn</div>
          </div>
          <div className="border-x border-white/10">
            <div className="text-lg font-bold text-emerald-200 font-mono">8</div>
            <div className="text-[10px] text-slate-400">Chặng khám phá</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-200 font-mono">15'</div>
            <div className="text-[10px] text-slate-400">Tĩnh tâm đồng hành</div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPhase('consent')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-slate-800 hover:from-indigo-600 hover:to-slate-700 text-white font-semibold text-sm tracking-wider shadow-lg shadow-indigo-950/60 active:scale-95 transition-all border border-indigo-400/30"
          >
            Bắt đầu hành trình →
          </button>

          <button
            type="button"
            onClick={fillQuickDemo}
            className="text-xs text-slate-400/80 hover:text-amber-200 transition py-1 block w-full text-center"
          >
            ⚡ Trải nghiệm nhanh kết quả mẫu (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
