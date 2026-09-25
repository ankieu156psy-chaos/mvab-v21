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

  // Sequential journey from FOREGROUND to DEEP BACKGROUND across 8 dimensions
  const DIMENSION_VIGNETTES: { 
    roman: string; 
    name: string; 
    depth: string; 
    spot: string; 
    transform: string;
    asset?: string;
  }[] = [
    { 
      roman: 'I', 
      name: 'Bến Sen & Đàn Cá Koi', 
      depth: 'Tiền cảnh sát mặt nước', 
      spot: 'Góc bờ sen nở rộ, nơi khởi sinh những tương tác vi mô trực tiếp', 
      transform: 'scale(2.2) translate(14%, -24%)',
      asset: '/assets/lotus-bloom-user.png'
    },
    { 
      roman: 'II', 
      name: 'Mặt Nước Xuôi Dòng', 
      depth: 'Làn sóng lăn tăn', 
      spot: 'Không gian mặt nước phẳng lặng, đối diện sự vô định và mơ hồ', 
      transform: 'scale(1.9) translate(6%, -15%)'
    },
    { 
      roman: 'III', 
      name: 'Thủy Đình Bến Đỗ', 
      depth: 'Trạm dừng chân giữa hồ', 
      spot: 'Mái đình cổ kính nổi giữa hồ sen, định hình phương pháp thực hành', 
      transform: 'scale(1.7) translate(-8%, -4%)',
      asset: '/assets/thuy-dinh-pavilion.png'
    },
    { 
      roman: 'IV', 
      name: 'Thuyền Nan Giữa Dòng', 
      depth: 'Trung cảnh lòng hồ', 
      spot: 'Con thuyền độc mộc lướt sóng, cân nhắc hướng đi giữa con người và dữ liệu', 
      transform: 'scale(1.6) translate(-2%, 4%)'
    },
    { 
      roman: 'V', 
      name: 'Cầu Đá Nhịp Cong', 
      depth: 'Bờ nối tương giao', 
      spot: 'Nhịp cầu đá bắc sang bờ bên kia, bắc nhịp thấu cảm và giữ vững ranh giới tự ngã', 
      transform: 'scale(1.5) translate(-20%, 6%)'
    },
    { 
      roman: 'VI', 
      name: 'Thôn Xóm Bình Yên', 
      depth: 'Mái ngói rêu phong ven hồ', 
      spot: 'Xóm làng dưới bóng cây đại thụ, quan sát thế giới nội tâm trong đời sống thực tế', 
      transform: 'scale(1.4) translate(-28%, -6%)'
    },
    { 
      roman: 'VII', 
      name: 'Dãy Sơn Khê Bảng Lảng', 
      depth: 'Hậu cảnh rặng núi xa', 
      spot: 'Chân núi mây mù bao phủ, nuôi dưỡng động cơ vị tha vì cộng đồng bền vững', 
      transform: 'scale(1.3) translate(12%, 18%)'
    },
    { 
      roman: 'VIII', 
      name: 'Đỉnh Cao Bát Trục Toàn Cảnh', 
      depth: 'Điểm nhìn bao quát giang sơn', 
      spot: 'Đứng từ đỉnh núi cao nhìn xuống toàn bộ non nước, hoàn tất bức tranh năng lực', 
      transform: 'scale(1.05) translate(0%, 0%)'
    },
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
          transform: `${currentVignette.transform} translate3d(${-mouse.x * 16}px, ${-mouse.y * 12}px, 0)`,
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/assets/ink-landscape-wide.png"
            alt={currentVignette.name}
            fill
            priority
            className="object-cover opacity-65 mix-blend-multiply"
          />
        </div>
      </div>

      {/* Subtle Mist Overlay */}
      <div className="absolute inset-0 bg-[#f4efe6]/50 backdrop-blur-[1.5px] pointer-events-none" />

      {/* 2. Checkpoint Card with Antique Dó Parchment Harmony */}
      <div 
        className="relative max-w-xl w-full z-10 transition-transform duration-300 pt-14 sm:pt-16"
        style={{
          transform: `translate3d(${mouse.x * 10}px, ${mouse.y * 8}px, 0)`,
        }}
      >
        {/* Stage-Specific Decorative Graphic (e.g. Thủy Đình on Stage 3, Lotus on Stage 1) */}
        {currentVignette.asset && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-32 sm:h-40 pointer-events-none z-10 opacity-90 transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(calc(-50% + ${-mouse.x * 12}px), ${-mouse.y * 8}px, 0)`,
            }}
          >
            <Image
              src={currentVignette.asset}
              alt={currentVignette.name}
              fill
              priority
              className="object-contain object-bottom drop-shadow-md"
            />
          </div>
        )}

        <div className="relative bg-[#faf6ee]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-stone-300/90 shadow-2xl shadow-stone-900/15">
          
          {/* Header with Vermilion Seal Stamp Motif */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/90 mb-5">
            <div className="flex items-center gap-3">
              {/* Vermilion Stamp */}
              <div className="w-7 h-7 rounded bg-[#8b2626] text-amber-50 flex items-center justify-center font-serif text-xs font-bold shadow-sm tracking-tighter">
                {currentVignette.roman}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-stone-900 tracking-wider uppercase block">
                  BẾN ĐỖ {currentDimIndex + 1}/8 · {currentVignette.name}
                </span>
                <span className="text-[11px] text-stone-500 font-sans">
                  {currentVignette.depth}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-500 font-mono px-3 py-1 rounded-full bg-stone-200/60 border border-stone-300">
                Tĩnh tâm: {secondsSpent}s
              </span>
            </div>
          </div>

          {/* 3D Jade & Amber Breathing Orb */}
          <div className="my-1">
            <ZenBreathingCanvas />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2 tracking-tight text-center font-sans">
            {insight.title}
          </h3>

          <p className="text-xs text-rose-800/90 font-medium text-center mb-4 font-sans">
            {currentVignette.spot}
          </p>

          {/* Teaser Paragraph (Cliffhanger) */}
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-6 text-center font-sans max-w-lg mx-auto">
            {insight.teaser}
          </p>

          {/* Detail Reveal Card (Styled like an ancient parchment record) */}
          {hasViewedDetail && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#f4ece1]/90 border border-stone-300 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans shadow-inner animate-fade-in">
              <div className="flex items-center gap-2 font-semibold text-[#8b2626] mb-1.5 text-xs uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b2626]" />
                Nhận định sơ bộ từ hệ thống:
              </div>
              <p className="text-stone-700">
                {insight.detail}
              </p>
            </div>
          )}

          {/* Two Action Buttons (Implicit behavioral measure) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!hasViewedDetail && (
              <button
                type="button"
                onClick={handleReadDetail}
                className="flex-1 py-3.5 px-4 rounded-full text-xs font-semibold border border-stone-400/80 text-stone-800 bg-[#f7f2e7] hover:bg-[#ede5d6] active:scale-95 transition-all text-center font-mono uppercase tracking-wider shadow-sm"
              >
                Xem phân tích chi tiết (30s)
              </button>
            )}

            <button
              type="button"
              onClick={handleProceed}
              className={`flex-1 py-3.5 px-5 rounded-full text-xs font-semibold transition-all text-center shadow-md font-mono uppercase tracking-wider ${
                hasViewedDetail
                  ? 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-stone-900/20 active:scale-95'
                  : 'bg-[#8b2626] hover:bg-[#731f1f] text-amber-50 shadow-rose-950/20 active:scale-95'
              }`}
            >
              {hasViewedDetail
                ? 'Tiếp tục sang Chặng kế tiếp →'
                : 'Bỏ qua & Đi tiếp chặng sau →'}
            </button>
          </div>

          <p className="text-[11px] text-stone-500 text-center mt-5 font-sans">
            Bản đồ định vị 9 cụm nghề nghiệp và phân tích cấu hình sẽ được tổng hợp ở Báo cáo chung cuộc.
          </p>
        </div>
      </div>
    </div>
  );
};
