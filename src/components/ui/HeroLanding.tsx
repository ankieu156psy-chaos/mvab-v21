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

      {/* 2. LAYER 1: Top Minimalist Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 pt-8 text-xs font-mono tracking-wider">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-700 animate-pulse" />
          <span className="font-bold text-stone-900">MVAB v2.1</span>
          <span className="hidden sm:inline text-stone-500">· Hệ Thống Đánh Giá Tâm Trắc Học</span>
        </div>

        <button
          onClick={fillQuickDemo}
          className="px-4 py-2 rounded-full bg-stone-900/5 hover:bg-stone-900/10 border border-stone-300 text-stone-800 text-xs font-medium transition-all"
        >
          ⚡ Xem kết quả mẫu (Demo)
        </button>
      </header>

      {/* 3. LAYER 2: Central Editorial Block (MVAB is the largest headline) */}
      <main className="relative z-20 px-6 sm:px-12 py-12 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/5 border border-stone-300 text-xs font-semibold text-stone-700 mb-6">
          <span>Công cụ Định hướng Chuyên môn & Nghề nghiệp</span>
        </div>

        {/* Primary Largest Headline: MVAB */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-stone-900 tracking-tight leading-none mb-4 font-sans">
          MVAB
        </h1>

        {/* Clear Subtitle in Pure Vietnamese */}
        <h2 className="text-lg sm:text-2xl font-bold text-stone-800 max-w-2xl leading-snug mb-5 font-sans">
          Thang Đo Xu Hướng Nghề Nghiệp & Phong Cách Thực Hành Tâm Lý Học
        </h2>

        {/* Brief, Objective, Academic Purpose (Vắn tắt, không sến súa) */}
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 font-sans">
          Hệ thống gồm 84 câu hỏi chuẩn hóa nhằm nhận diện 8 chiều kích năng lực, phong cách can thiệp lâm sàng, mức độ dung nạp mơ hồ và ranh giới chuyên môn của người thực hành tâm lý tại Việt Nam.
        </p>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 px-6 rounded-2xl bg-white/60 backdrop-blur-md border border-stone-300/80 mb-8 max-w-md w-full text-center">
          <div>
            <div className="text-xl font-bold text-stone-900 font-mono">84</div>
            <div className="text-xs text-stone-500">Câu hỏi</div>
          </div>
          <div className="border-x border-stone-200">
            <div className="text-xl font-bold text-stone-900 font-mono">8</div>
            <div className="text-xs text-stone-500">Chiều kích</div>
          </div>
          <div>
            <div className="text-xl font-bold text-stone-900 font-mono">15'</div>
            <div className="text-xs text-stone-500">Thời gian làm</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setPhase('consent')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-50 font-semibold text-sm tracking-wide transition-all shadow-xl shadow-stone-900/15 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Bắt đầu bài đánh giá</span>
            <span className="font-bold">→</span>
          </button>
        </div>
      </main>

      {/* 4. LAYER 3: Bottom Clean Footer */}
      <footer className="relative z-30 flex items-center justify-between px-6 sm:px-12 pb-8 text-xs font-mono text-stone-500">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-stone-400">8 CHẶNG KHÁM PHÁ:</span>
          <div className="flex items-center gap-2 font-bold text-stone-600">
            <span className="text-rose-700">01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
            <span>06</span>
            <span>07</span>
            <span>08</span>
          </div>
        </div>

        <div className="text-right text-stone-500 text-[11px]">
          Bản quyền nghiên cứu © 2026 MVAB
        </div>
      </footer>
    </div>
  );
};

