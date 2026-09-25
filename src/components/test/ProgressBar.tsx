'use client';

import React from 'react';
import { useTestStore } from '@/stores/test-store';
import { ITEMS_DATA } from '@/lib/items';

const DIMENSION_NAMES: Record<string, string> = {
  D1: 'Trục 1: Không Gian Can Thiệp',
  D2: 'Trục 2: Dung Nạp Tính Mơ Hồ',
  D3: 'Trục 3: Phong Cách Thực Hành',
  D4: 'Trục 4: Định Hướng Đối Tượng',
  D5: 'Trục 5: Cân Bằng Thấu Cảm',
  D6: 'Trục 6: Năng Lực Tâm Thần Hóa',
  D7: 'Trục 7: Động Cơ Vị Tha',
  D8: 'Trục 8: Dự Phóng Nghề Nghiệp'
};

export const ProgressBar: React.FC = () => {
  const responses = useTestStore((s) => s.responses);
  const currentDim = useTestStore((s) => s.getCurrentDimension());
  const currentDimIndex = useTestStore((s) => s.currentDimIndex);
  const progressPercent = useTestStore((s) => s.getProgressPercent());

  const answeredCount = Object.keys(responses).length;
  const totalCount = ITEMS_DATA.length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px]">
              Chặng {currentDimIndex + 1}/8
            </span>
            <span className="font-medium text-slate-500 text-xs">
              (Phần {currentDimIndex + 1})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-700 font-semibold">{answeredCount}</span>
            <span className="text-slate-400">/</span>
            <span>{totalCount} câu</span>
            <span className="ml-1 text-slate-400">({progressPercent}%)</span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-800 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
