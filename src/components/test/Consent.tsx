'use client';

import React, { useState, useEffect } from 'react';
import { useTestStore, generateParticipantCode } from '@/stores/test-store';

export const Consent: React.FC = () => {
  const participantCode = useTestStore((s) => s.participantCode);
  const setParticipantCode = useTestStore((s) => s.setParticipantCode);
  const hasConsentedToStudy = useTestStore((s) => s.hasConsentedToStudy);
  const setHasConsentedToStudy = useTestStore((s) => s.setHasConsentedToStudy);
  const startAssessment = useTestStore((s) => s.startAssessment);
  const setPhase = useTestStore((s) => s.setPhase);

  const [readyToStart, setReadyToStart] = useState(true);
  const [copied, setCopied] = useState(false);

  // Khởi tạo mã định danh nếu chưa có
  useEffect(() => {
    if (!participantCode) {
      const code = generateParticipantCode();
      setParticipantCode(code);
    }
  }, [participantCode, setParticipantCode]);

  const handleCopyCode = async () => {
    if (!participantCode) return;
    try {
      await navigator.clipboard.writeText(participantCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleStart = () => {
    if (readyToStart) {
      startAssessment();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f4efe6] text-stone-900 selection:bg-rose-200">
      <div className="max-w-2xl w-full bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-stone-300 shadow-xl shadow-stone-900/5">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/90 mb-6">
          <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b2626]" />
            Dự án Nghiên cứu Độc lập
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-stone-200/70 text-stone-700 font-mono font-semibold border border-stone-300">
            MVAB v2.1 (Thử nghiệm)
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3 tracking-tight font-sans">
          Đôi Lời Tâm Sự Trước Khi Bắt Đầu
        </h2>

        {/* Friendly Honest Academic Note */}
        <div className="text-sm text-stone-700 space-y-3.5 leading-relaxed mb-6 font-sans">
          <p className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 font-medium">
            Thang đo này nhóm mình làm ra vui vẻ và học thuật là chính, hiện tại{' '}
            <strong>chưa được chuẩn hóa trên diện rộng</strong> đâu nha! Nếu các bạn có lòng hảo tâm thì tích vào ô đóng góp dữ liệu bên dưới để tụi mình có data phục vụ cho đề tài chuẩn hóa nhé.
          </p>

          <p className="text-xs sm:text-sm text-stone-600">
            Mục tiêu chính của bài test là tạo một không gian tĩnh lặng (như một chuyến tản bộ bên hồ sen cổ) để bạn tự soi chiếu xem mình có thiên hướng phù hợp với ngách thực hành tâm lý học nào: từ can thiệp lâm sàng, tham vấn tâm lý, tư vấn học đường, đến tâm lý nhân sự (I/O) hay công thái học nhận thức (UX/AI).
          </p>

          <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
            <li><strong>Tính bảo mật:</strong> Dữ liệu hoàn toàn ẩn danh, không thu thập bất kỳ thông tin định danh cá nhân (PII) nào.</li>
            <li><strong>Thời gian:</strong> Khoảng 10–12 phút cho 84 câu hỏi nhẹ nhàng chia làm 8 chặng ngắn.</li>
            <li><strong>Tính chất:</strong> Bản phân tích khuynh hướng cá nhân, không mang tính chẩn đoán bệnh lý y khoa hay tâm thần.</li>
          </ul>
        </div>

        {/* Unique Participant Tracking Code Card */}
        <div className="p-5 rounded-2xl bg-[#f4ece1] border border-stone-300/90 mb-6 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-[#8b2626] tracking-wider block">
                Mã Định Danh Đối Chiếu Ẩn Danh Của Bạn
              </span>
              <span className="text-xs text-stone-600">
                Hãy lưu lại mã này để tra cứu kết quả sau khi chuẩn hóa
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 font-mono font-extrabold text-base text-stone-900 tracking-wider shadow-sm select-all">
                {participantCode || 'MVAB-XXXX-YYYY'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-50 text-xs font-mono transition active:scale-95 shadow-sm"
              >
                {copied ? '✓ Đã chép!' : 'Sao chép'}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-stone-600 bg-white/60 p-2.5 rounded-xl border border-stone-200/80 leading-normal">
            💡 <strong>Tính năng đối chiếu Trước - Sau:</strong> Khi nhóm thu thập đủ cỡ mẫu (dự kiến N=500) và hoàn tất phân tích nhân tố EFA/CFA, bạn chỉ cần nhập lại mã này để xem <em>Báo cáo sau chuẩn hóa</em> và đối chiếu xem điểm số của mình dịch chuyển ra sao so với chuẩn chung của cộng đồng tâm lý Việt Nam.
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-stone-200 cursor-pointer hover:bg-white transition">
            <input
              type="checkbox"
              checked={hasConsentedToStudy}
              onChange={(e) => setHasConsentedToStudy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-stone-500 border-stone-300"
            />
            <span className="text-xs sm:text-sm text-stone-800 font-medium">
              Tôi có lòng hảo tâm đóng góp câu trả lời ẩn danh để nhóm có dữ liệu chuẩn hóa thang đo.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 border border-stone-200 cursor-pointer hover:bg-white transition">
            <input
              type="checkbox"
              checked={readyToStart}
              onChange={(e) => setReadyToStart(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-stone-900 focus:ring-stone-500 border-stone-300"
            />
            <span className="text-xs sm:text-sm text-stone-800 font-medium">
              Tôi hiểu đây là bản khảo sát khám phá cá nhân và sẵn sàng dành 10–12 phút để bắt đầu.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setPhase('landing')}
            className="text-xs text-stone-500 hover:text-stone-800 transition font-mono"
          >
            ← Quay lại trang chủ
          </button>

          <button
            type="button"
            disabled={!readyToStart}
            onClick={handleStart}
            className={`py-3.5 px-8 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md font-mono ${
              readyToStart
                ? 'bg-[#8b2626] hover:bg-[#731f1f] text-amber-50 shadow-rose-950/20 active:scale-95'
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
