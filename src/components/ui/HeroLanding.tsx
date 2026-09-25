'use client';

import React, { useState, useEffect } from 'react';
import { useTestStore } from '@/stores/test-store';
import { ITEMS_DATA } from '@/lib/items';
import Image from 'next/image';

export const HeroLanding: React.FC = () => {
  const setPhase = useTestStore((s) => s.setPhase);
  const answerQuestion = useTestStore((s) => s.answerQuestion);

  // Mouse Parallax coordinates (-1 to 1) with smooth dampening
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

  const fillQuickDemo = () => {
    ITEMS_DATA.forEach((item) => {
      let score = 3;
      if (item.subscale.includes('Vi mô')) score = 5;
      else if (item.subscale.includes('Trung mô')) score = 4;
      else if (item.subscale.includes('Dung nạp')) score = 4;
      else if (item.id === 'IER_DIR_01') score = 1;
      else if (item.id === 'IER_DIR_02') score = 4;
      else if (item.id === 'IER_INC_01a') score = 5;
      else if (item.id === 'IER_INC_01b') score = 1;
      else score = Math.floor(Math.random() * 3) + 3;
      answerQuestion(item.id, score);
    });
    setPhase('report');
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#f4efe6] text-stone-900 select-none flex flex-col justify-between">
      
      {/* 1. LAYER 0: Background Antique Landscape Painting (Tranh Thủy Mặc Nền Giấy Dó) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out scale-105"
        style={{
          transform: `translate3d(${-mouse.x * 12}px, ${-mouse.y * 10}px, 0)`,
        }}
      >
        <Image
          src="/assets/ink-landscape-wide.png"
          alt="Tranh Thủy Mặc Hồ Sen"
          fill
          priority
          className="object-cover object-center opacity-85 mix-blend-multiply"
        />
        {/* Soft vignette and mist gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f4efe6] via-transparent to-[#f4efe6]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f4efe6]/80 via-transparent to-[#f4efe6]/50 pointer-events-none" />
      </div>

      {/* 2. LAYER 1: Top Navigation (Kage-style minimalist header) */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 pt-8 text-xs font-mono tracking-widest uppercase">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          <span className="font-bold text-stone-800">MVAB v2.1</span>
          <span className="hidden sm:inline text-stone-400 font-light">· BÁT TRỤC TÂM TRẮC</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[11px] text-stone-500">
          <span className="text-stone-800 font-semibold border-b border-rose-600 pb-0.5">00 KHỞI ĐẦU</span>
          <span>01 KHÔNG GIAN</span>
          <span>02 MƠ HỒ</span>
          <span>03 THỰC HÀNH</span>
          <span>04 ĐỐI TƯỢNG</span>
          <span>... BÁT CHẶNG</span>
        </nav>

        <button
          onClick={fillQuickDemo}
          className="px-3 py-1.5 rounded-full bg-stone-900/5 hover:bg-stone-900/10 border border-stone-300 text-stone-700 text-[11px] transition-all"
        >
          ⚡ Kết quả mẫu (Demo)
        </button>
      </header>

      {/* 3. LAYER 2: Editorial Text Content (Top Left / Center) */}
      <main className="relative z-20 px-6 sm:px-14 pt-12 sm:pt-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-rose-700 text-xs font-mono font-semibold tracking-widest uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          CHƯƠNG 00 — CỔNG VÀO HỒ SEN
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08] mb-6">
          NƠI TĨNH LẶNG<br />
          SOI TỎ<br />
          ĐIỀU CHƯA THẤY.
        </h1>

        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed max-w-lg mb-8 font-serif">
          Bước vào hành trình 8 không gian phản chiếu tâm trí. Khám phá định hướng nghề nghiệp, phong cách thực hành lâm sàng và ranh giới giám sát của riêng bạn.
        </p>

        {/* CTA Button styled like Kage "CROSS THE THRESHOLD ↗" */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setPhase('consent')}
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-50 font-medium text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-stone-900/20 active:scale-95"
          >
            <span>BẮT ĐẦU HÀNH TRÌNH</span>
            <span className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform font-bold">↗</span>
          </button>

          <div className="text-[11px] font-mono text-stone-500">
            84 CÂU HỎI · 8 TRỤC NĂNG LỰC · ~15 PHÚT
          </div>
        </div>
      </main>

      {/* 4. LAYER 3: GIANT TYPOGRAPHY "M V A B" (Sandwiched in 3D midground) */}
      <div 
        className="absolute inset-x-0 bottom-6 sm:bottom-12 flex justify-center items-end pointer-events-none z-10 overflow-hidden"
        style={{
          transform: `translate3d(${mouse.x * 16}px, ${mouse.y * 12}px, 0)`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <span className="text-[26vw] sm:text-[23vw] font-black tracking-[-0.04em] text-stone-900/[0.14] leading-none select-none font-sans scale-y-110">
          MVAB
        </span>
      </div>

      {/* 5. LAYER 4: FOREGROUND LOTUS & KOI (Layered IN FRONT of the giant letters!) */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none z-20 flex justify-center items-end"
        style={{
          transform: `translate3d(${mouse.x * 32}px, ${mouse.y * 18}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div className="relative w-full max-w-5xl h-72 sm:h-96 md:h-[480px]">
          <Image
            src="/assets/lotus-foreground.png"
            alt="Đài Sen & Cá Koi Tiền Cảnh"
            fill
            priority
            className="object-contain object-bottom drop-shadow-2xl"
          />
        </div>
      </div>

      {/* 6. LAYER 5: Bottom Chapter Timeline & Subtle Footer (Kage Style) */}
      <footer className="relative z-30 flex items-end justify-between px-6 sm:px-12 pb-6 text-xs font-mono">
        <div className="flex items-center gap-6">
          <span className="text-stone-400 text-[10px] uppercase tracking-widest hidden sm:inline">CUỘN ĐỂ BƯỚC VÀO ────</span>
          <div className="flex items-center gap-3 text-stone-600 font-bold">
            <span className="text-rose-700 border-b border-rose-600 pb-0.5">01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
            <span>06</span>
            <span>07</span>
            <span>08</span>
          </div>
        </div>

        {/* Vertical Han-Viet / Nom calligraphic sidebar hint */}
        <div className="text-right text-stone-500/80 text-[11px] font-serif tracking-widest hidden sm:block">
          <div> tĩnh mặc tự tri </div>
          <div className="text-[9px] font-mono text-stone-400 mt-0.5">HÀNH TRÌNH TỰ Ý THỨC</div>
        </div>
      </footer>

    </div>
  );
};

