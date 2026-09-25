'use client';

import React, { useState } from 'react';
import { useTestStore } from '@/stores/test-store';

export const Consent: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const startAssessment = useTestStore((s) => s.startAssessment);
  const setPhase = useTestStore((s) => s.setPhase);

  const handleStart = () => {
    if (agreed) {
      startAssessment();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4efe6] text-stone-900 selection:bg-rose-200">
      <div className="max-w-2xl w-full bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-stone-300/80 shadow-xl shadow-stone-900/5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
          <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Nghiên cứu Đánh giá Tâm trắc học
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-semibold border border-stone-200">
            MVAB v2.1
          </span>
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-4 tracking-tight">
          Phiếu Đồng Thuận Tham Gia Đánh Giá
        </h2>

        <div className="prose prose-stone text-sm text-stone-600 space-y-3 leading-relaxed mb-6 font-serif">
          <p>
            Chào bạn, bảng khảo sát này là công cụ nghiên cứu độc lập nhằm chuẩn hóa khung năng lực và định hướng chuyên môn cho sinh viên và người thực hành tâm lý học tại Việt Nam.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
            <li><strong>Tính bảo mật:</strong> Dữ liệu thu thập hoàn toàn ẩn danh. Không có thông tin định danh cá nhân (PII) nào được lưu trữ.</li>
            <li><strong>Thời gian hoàn thành:</strong> Dự kiến khoảng 12–15 phút cho 84 câu hỏi được phân bổ theo 8 chặng ngắn.</li>
            <li><strong>Quyền tự nguyện:</strong> Bạn có quyền tạm dừng hoặc rút khỏi quá trình làm bài bất kỳ lúc nào.</li>
            <li><strong>Mục đích:</strong> Kết quả trả về là bản phân tích xu hướng chuyên môn cá nhân hóa hỗ trợ định vị nghề nghiệp, không mang tính chẩn đoán bệnh lý y khoa.</li>
          </ul>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50/80 border border-stone-200 cursor-pointer mb-6 hover:bg-stone-100/60 transition">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-stone-500 border-stone-300"
          />
          <span className="text-xs sm:text-sm text-stone-800 font-medium">
            Tôi đã đọc, hiểu rõ mục đích nghiên cứu và tự nguyện đồng ý tham gia bài đánh giá này.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPhase('landing')}
            className="text-xs text-stone-400 hover:text-stone-700 transition font-mono"
          >
            ← Quay lại trang chủ
          </button>

          <button
            type="button"
            disabled={!agreed}
            onClick={handleStart}
            className={`py-3.5 px-7 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md ${
              agreed
                ? 'bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-stone-900/20 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            Bắt đầu làm bài đánh giá →
          </button>
        </div>
      </div>
    </div>
  );
};
