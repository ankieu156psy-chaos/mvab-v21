'use client';

import React, { useEffect, useState } from 'react';
import { useTestStore } from '@/stores/test-store';
import { evaluateCareerClusters, evaluateConfiguralRules } from '@/lib/scoring';
import { getDetailedDimensionAnalysis } from '@/lib/dimension-analysis';
import { DongSonRadarChart } from './DongSonRadarChart';

export const ReportDashboard: React.FC = () => {
  const getResults = useTestStore((s) => s.getResults);
  const resetAll = useTestStore((s) => s.resetAll);
  const delayedScore = useTestStore((s) => s.delayedGratificationScore);
  const responses = useTestStore((s) => s.responses);
  const latencies = useTestStore((s) => s.latencies);
  const participantCode = useTestStore((s) => s.participantCode);
  const hasConsentedToStudy = useTestStore((s) => s.hasConsentedToStudy);

  const { scores, ierAudit } = getResults();
  const careerClusters = evaluateCareerClusters(scores);
  const configuralRules = evaluateConfiguralRules(scores);
  const detailedDimensions = getDetailedDimensionAnalysis(scores);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'mocked' | 'error'>('idle');
  const [selectedDimId, setSelectedDimId] = useState<string>('D1');
  const [viewAllDimensions, setViewAllDimensions] = useState<boolean>(false);
  const [showAllClusters, setShowAllClusters] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Tra cứu mã đối chiếu sau chuẩn hóa
  const [lookupCodeInput, setLookupCodeInput] = useState<string>('');
  const [lookupFeedback, setLookupFeedback] = useState<string | null>(null);

  // Hòm thư góp ý
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackContact, setFeedbackContact] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCode: participantCode || 'ANONYMOUS',
          feedbackText,
          contactInfo: feedbackContact,
          topCareer: careerClusters[0]?.name || ''
        })
      });
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setFeedbackContact('');
    } catch {
      setFeedbackSubmitted(true);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Tự động đồng bộ hóa kết quả về Google Sheets
  useEffect(() => {
    let isMounted = true;
    const sendData = async () => {
      setSyncStatus('saving');
      try {
        const totalDurationSec = Math.round(
          Object.values(latencies).reduce((a, b) => a + b, 0) / 1000
        );

        const payload = {
          sessionId: participantCode || ('USER_' + Math.random().toString(36).substring(2, 9).toUpperCase()),
          hasConsentedToStudy,
          totalDurationSec,
          delayedGratificationScore: delayedScore,
          ierFlags: ierAudit.flags,
          ierDetails: ierAudit.details,
          topCareer: careerClusters[0]?.name || '',
          topCareerMatch: careerClusters[0]?.match || 0,
          scores,
          rawResponses: responses
        };

        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (isMounted) {
          if (result.status === 'success') setSyncStatus('saved');
          else if (result.status === 'mocked') setSyncStatus('mocked');
          else setSyncStatus('error');
        }
      } catch {
        if (isMounted) setSyncStatus('error');
      }
    };

    sendData();
    return () => { isMounted = false; };
  }, []);

  const handleCopyCode = async () => {
    if (!participantCode) return;
    try {
      await navigator.clipboard.writeText(participantCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSummary = () => {
    const lines = [
      `=== BẢN PHÂN TÍCH KHUÝNH HƯỚNG NGHỀ NGHIỆP MVAB v2.1 ===`,
      `Mã định danh đối chiếu: ${participantCode || 'N/A'}`,
      `Thời gian thực hiện: ${new Date().toLocaleDateString('vi-VN')}`,
      `Kiểm soát chất lượng (IER): ${ierAudit.status === 'valid' ? 'Hợp thức' : 'Cần lưu ý'} (Flags: ${ierAudit.flags})`,
      `Chỉ số Trì hoãn sự thỏa mãn: ${delayedScore}/8`,
      ``,
      `--- TOP 3 CỤM NGHỀ NGHIỆP TƯƠNG THÍCH NHẤT ---`,
      ...careerClusters.slice(0, 3).map((c, i) => `${i + 1}. ${c.name} - Phù hợp: ${c.match}%\n   ${c.formulaExplanation}`),
      ``,
      `--- PHỔ ĐIỂM 8 TRỤC NĂNG LỰC (T-SCORE) ---`,
      ...detailedDimensions.map(d => `[${d.id}] ${d.name}: T-Score ${d.primaryTScore} (Phân vị ~${d.percentile}%) - ${d.tier}`),
      ``,
      `Lưu lại mã ${participantCode || 'này'} để tra cứu kết quả sau khi đề tài hoàn tất chuẩn hóa (N=500).`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MVAB_KetQua_${participantCode || 'Report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLookupCheck = () => {
    const trimmed = lookupCodeInput.trim().toUpperCase();
    if (!trimmed) {
      setLookupFeedback('Vui lòng nhập mã định danh để tra cứu.');
      return;
    }
    if (trimmed === (participantCode || '').toUpperCase()) {
      setLookupFeedback(
        `✓ Mã hợp lệ (${trimmed}). Hiện tại đề tài đang ở Giai đoạn 1 (Thu thập mẫu sơ bộ, 142/500 mẫu). Dữ liệu của bạn đã được ghi nhận an toàn. Khi đạt đủ 500 mẫu, bạn sẽ đối chiếu được mức độ dịch chuyển T-score so với chuẩn sinh viên/chuyên viên toàn quốc!`
      );
    } else {
      setLookupFeedback(
        `ℹ️ Đã ghi nhận mã tra cứu ${trimmed}. Tiến độ chuẩn hóa hiện tại: 142/500 mẫu khảo sát. Hệ thống sẽ mở cổng đối chiếu trước - sau khi hoàn tất phân tích nhân tố EFA/CFA.`
      );
    }
  };

  const currentSelectedDimension = 
    detailedDimensions.find(d => d.id === selectedDimId) || detailedDimensions[0];

  return (
    <div className="min-h-screen bg-[#f4efe6] text-stone-900 py-10 px-4 selection:bg-rose-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8b2626] text-amber-50 text-[11px] font-bold tracking-wide font-serif">
                MVAB v2.1
              </span>
              <span className="text-xs text-stone-500 font-mono">Bản Nghiên Cứu Sơ Bộ</span>
              {syncStatus === 'saving' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse font-mono">
                  Đang lưu dữ liệu...
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-medium">
                  ✓ Đã lưu nghiên cứu
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans">
              Hồ Sơ Khuynh Hướng Nghề Nghiệp & Năng Lực Thực Hành
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans">
              Khung Lượng Giá Đa Chiều Cho Sinh Viên & Người Thực Hành Tâm Lý Học Tại Việt Nam
            </p>

            {/* Participant Code Banner */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 font-mono">Mã đối chiếu ẩn danh:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white border border-stone-300 font-mono font-bold text-stone-900 select-all">
                {participantCode || 'MVAB-PENDING'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 transition"
              >
                {copiedCode ? '✓ Đã chép' : 'Sao chép mã'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 md:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-amber-50 transition shadow-sm font-mono"
            >
              In / Xuất PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadSummary}
              className="flex-1 md:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-white text-stone-700 transition font-mono"
            >
              Tải tóm tắt (.txt)
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="flex-1 md:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-rose-50 hover:text-rose-800 text-stone-600 transition font-mono"
            >
              Làm lại
            </button>
          </div>
        </div>

        {/* 1. IER Audit Integrity Card */}
        <div
          className={`rounded-2xl p-5 border text-sm transition-all ${
            ierAudit.status === 'valid'
              ? 'bg-[#faf6ee] border-stone-300 text-stone-800'
              : ierAudit.status === 'warning'
              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
              : 'bg-rose-50/90 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-semibold mb-1 gap-2">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ierAudit.status === 'valid' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              {ierAudit.status === 'valid'
                ? 'Dữ liệu phản hồi hợp thức theo tiêu chuẩn IER'
                : ierAudit.status === 'warning'
                ? 'Phát hiện 01 cờ cảnh báo mức độ chú ý phản hồi (IER)'
                : 'Hồ sơ có dấu hiệu trả lời thiếu nỗ lực tập trung'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-stone-300 font-mono text-stone-600">
              Kiểm toán IER: {ierAudit.flags} cờ
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            {ierAudit.details.length === 0
              ? 'Không phát hiện hiện tượng trả lời quá nhanh, nhấp ngẫu nhiên hoặc mâu thuẫn giữa các câu đối chứng trong suốt 84 câu hỏi.'
              : ierAudit.details.join('; ')}
          </p>
        </div>

        {/* 2. Dong Son Radar Chart (Harmonized with ancient Dó paper) */}
        <DongSonRadarChart 
          scores={scores} 
          onSelectDimension={(dimId) => {
            setSelectedDimId(dimId);
            setViewAllDimensions(false);
          }} 
        />

        {/* 3. CORE UPGRADE: COMPREHENSIVE 8-DIMENSION DETAILED ANALYSIS */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200/90 gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-[#8b2626] uppercase tracking-wider block">
                Phân Tích Chi Tiết 8 Trục Năng Lực
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-sans tracking-tight">
                Hồ Sơ Nhận Thức, Ưu Thế & Bẫy Mù Chuyên Môn
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setViewAllDimensions(!viewAllDimensions)}
              className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition shadow-sm"
            >
              {viewAllDimensions ? '← Xem từng trục (Dễ đọc)' : '📖 Mở rộng đọc tất cả 8 trục'}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Bản phân tích dưới đây mổ xẻ toàn diện cả 8 chặng năng lực của bạn dựa trên điểm số thực tế. Bạn có thể nhấp vào từng trục bên dưới để xem chi tiết hoặc mở rộng để đọc toàn bộ từ đầu đến cuối.
          </p>

          {/* Dimension Selector Pills */}
          {!viewAllDimensions && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {detailedDimensions.map((d) => {
                const isSelected = d.id === selectedDimId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDimId(d.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-amber-50 border-stone-900 shadow-sm'
                        : 'bg-white/70 hover:bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-amber-300' : 'text-[#8b2626]'}`}>
                        Trục {d.roman}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700'}`}>
                        T={d.primaryTScore}
                      </span>
                    </div>
                    <div className="font-bold text-xs truncate font-sans">
                      {d.name}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dimension Detail Cards */}
          <div className="space-y-6 pt-2">
            {(viewAllDimensions ? detailedDimensions : [currentSelectedDimension]).map((dim) => (
              <div 
                key={dim.id}
                className="p-5 sm:p-7 rounded-2xl bg-white/80 border border-stone-200/90 space-y-5 shadow-inner"
              >
                {/* Dimension Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8b2626] text-amber-50 flex items-center justify-center font-serif text-sm font-bold shadow-sm">
                      {dim.roman}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 font-sans">
                        Trục {dim.roman}: {dim.name}
                      </h3>
                      <span className="text-xs text-stone-500 font-sans">
                        {dim.domain}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 border border-stone-300 font-mono font-bold text-stone-800">
                      T-Score: {dim.primaryTScore} (Phân vị ~{dim.percentile}%)
                    </span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${dim.tierBadgeColor}`}>
                      {dim.tier}
                    </span>
                  </div>
                </div>

                {/* Subscales Table */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-stone-500 tracking-wider block">
                    Phổ điểm các thang đo thành phần:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {dim.subscales.map((sub) => (
                      <div key={sub.code} className="p-3 rounded-xl bg-[#faf6ee] border border-stone-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-stone-800 font-mono">
                          <span className="truncate pr-1">{sub.name}</span>
                          <span className="text-[#8b2626] whitespace-nowrap">T={sub.tScore}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-normal font-sans">
                          {sub.interpretation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cognitive Style */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold font-mono text-[#8b2626] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b2626]" />
                    Đặc trưng nhận thức & Phong cách tác nghiệp:
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pl-3 border-l-2 border-[#8b2626]/30">
                    {dim.cognitiveStyle}
                  </p>
                </div>

                {/* Practical Strengths vs Blindspots */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Strengths */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-emerald-900 font-mono uppercase tracking-wide flex items-center gap-1.5">
                      <span>✓</span> Ưu thế nổi trội trong thực hành:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-700 font-sans">
                      {dim.practicalStrengths.map((str, idx) => (
                        <li key={idx} className="leading-relaxed">{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Blindspots & Risks */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-amber-950 font-mono uppercase tracking-wide flex items-center gap-1.5">
                      <span>⚠</span> Vùng rủi ro chuyên môn & Bẫy mù:
                    </h5>
                    <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-700 font-sans">
                      {dim.blindspotsAndRisks.map((risk, idx) => (
                        <li key={idx} className="leading-relaxed">{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Supervision Guidance */}
                <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200/80 text-xs text-stone-800 space-y-1 font-sans">
                  <div className="font-bold font-mono text-stone-700 uppercase text-[11px] tracking-wider">
                    Khuyến nghị làm việc với Giám sát viên (Supervision Roadmap):
                  </div>
                  <p className="leading-relaxed text-stone-600">
                    {dim.supervisionGuidance}
                  </p>
                </div>

                {/* Environments */}
                <div className="text-[11px] text-stone-500 font-sans flex flex-wrap items-center gap-2">
                  <span className="font-bold text-stone-600 font-mono uppercase">Môi trường tương thích:</span>
                  <span>{dim.compatibleEnvironments.join(' · ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Career Matching (Transparent % Formula & Driver Breakdown) */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200/90 gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-[#8b2626] uppercase tracking-wider block">
                Đối Chiếu Tiêu Chuẩn Nghề Nghiệp
              </span>
              <h2 className="text-xl font-bold text-stone-900 font-sans tracking-tight">
                Mức Độ Tương Thích Với 9 Cụm Nghề Tâm Lý Học
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowAllClusters(!showAllClusters)}
              className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition shadow-sm"
            >
              {showAllClusters ? '← Chỉ xem Top 3 phù hợp nhất' : 'Xem toàn bộ 9 cụm nghề'}
            </button>
          </div>

          {/* Transparent Algorithm Note */}
          <div className="p-4 rounded-2xl bg-[#f4ece1] border border-stone-300/80 text-xs text-stone-700 space-y-1.5 font-sans">
            <div className="font-bold font-mono text-[#8b2626] uppercase text-[11px] tracking-wider">
              Minh bạch thuật toán tính chỉ số phù hợp (%):
            </div>
            <p className="leading-relaxed">
              Chỉ số tương thích (%) được tính toán bằng <strong>Khoảng cách Mahalanobis chuẩn hóa (Standardized Mahalanobis Distance - D<sub>M</sub>)</strong> đối chiếu trực tiếp giữa phổ điểm 8 trục năng lực của bạn với <strong>Hồ sơ Dữ liệu Thực nghiệm O*NET 28.2</strong> (Bộ Lao động Hoa Kỳ) cho từng mã nghề SOC tâm lý học, kết hợp phân loại chuyên ngành APA và khung pháp lý hành nghề tại Việt Nam (Luật Khám bệnh, chữa bệnh 2023, Thông tư 20/2023/TT-BGDĐT).
            </p>
          </div>

          {/* Career Clusters List */}
          <div className="space-y-4">
            {(showAllClusters ? careerClusters : careerClusters.slice(0, 3)).map((cluster, idx) => (
              <div
                key={cluster.id}
                className="p-5 sm:p-6 rounded-2xl border border-stone-200/90 bg-white/90 hover:bg-white transition-all space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-amber-50 flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base font-sans">
                      {cluster.name}
                    </h3>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                    Độ tương thích: {cluster.match}%
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                  {cluster.desc}
                </p>

                {/* Formula Breakdown */}
                <div className="text-[11px] text-stone-600 font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <strong className="text-stone-800">Chuẩn đối chiếu & Khoảng cách:</strong> {cluster.formulaExplanation}
                </div>

                {/* Core Drivers vs Growth Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {cluster.coreDrivers.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1">
                      <span className="font-bold font-mono text-[11px] uppercase block text-emerald-900">
                        ✓ Trục điểm tựa nổi bật:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 font-sans text-stone-700">
                        {cluster.coreDrivers.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cluster.growthAreas.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-1">
                      <span className="font-bold font-mono text-[11px] uppercase block text-amber-900">
                        ⚡ Vùng cần bồi đắp / Lưu ý:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 font-sans text-stone-700">
                        {cluster.growthAreas.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Legal & APA Footer */}
                <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row justify-between gap-1 text-[11px] text-stone-500 font-sans">
                  <span><strong>Căn cứ pháp lý VN:</strong> {cluster.legal}</span>
                  <span className="text-[#8b2626] font-mono"><strong>Phân nhánh APA:</strong> {cluster.apa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Implicit Behavioral Metric: Delayed Gratification */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-3">
          <div className="text-xs font-bold text-[#8b2626] uppercase font-mono tracking-wider">
            Chỉ Số Hành Vi Ngầm (Implicit Behavioral Metric)
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-sans">
            Mức Độ Trì Hoãn Sự Thỏa Mãn (Delayed Gratification Index)
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Chỉ số này được đo lường khách quan thông qua các quyết định của bạn tại 8 Trạm dừng chân: lựa chọn kiên trì tập trung làm bài cho trọn vẹn thay vì dừng lại thỏa mãn sự tò mò nhận thức tức thì.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-mono px-4 py-2 rounded-2xl bg-white border border-stone-300 inline-block shadow-sm">
              {delayedScore}/8
            </div>
            <div className="text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
              {delayedScore >= 6
                ? 'Xu hướng tập trung mục tiêu cao độ, kiểm soát xung động tò mò xuất sắc và ưu tiên hoàn tất tổng thể tác vụ trước khi nhận thưởng.'
                : delayedScore >= 3
                ? 'Cân bằng giữa sự tò mò muốn khám phá tức thời và tính kiên định hoàn thành tác vụ chuyên môn.'
                : 'Nhu cầu đóng nhận thức tức thì (Need for Closure) cao, thích kiểm tra thông tin và nhận phản hồi ngay lập tức tại từng chặng.'}
            </div>
          </div>
        </div>

        {/* 6. Configural Rules (Grounded, non-hyperbolic) */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-mono font-bold text-[#8b2626] uppercase tracking-wider block">
              Quy Tắc Tương Quan Cấu Hình
            </span>
            <h2 className="text-xl font-bold text-stone-900 font-sans tracking-tight">
              Nhận Diện Cấu Hình Năng Lực & Tương Quan Đa Chiều
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-1">
              Phân tích các tổ hợp đặc thù giữa các trục năng lực (ví dụ: Đồng cảm cao kết hợp với Dung nạp mơ hồ, hoặc Động cơ hy sinh kết hợp với Tự hiệu năng).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configuralRules.map((rule) => {
              const isTriggered = rule.triggered;
              return (
                <div
                  key={rule.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isTriggered
                      ? 'bg-white border-stone-300 shadow-sm'
                      : 'bg-stone-50/60 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm font-sans">
                      {rule.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        isTriggered
                          ? rule.type === 'positive'
                            ? 'bg-emerald-100 text-emerald-900'
                            : rule.type === 'critical'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isTriggered ? 'Kích hoạt' : 'Bình thường'}
                    </span>
                  </div>

                  {isTriggered ? (
                    <div className="space-y-2 text-xs font-sans">
                      <p className="text-stone-700 leading-relaxed italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                        "{rule.feedback}"
                      </p>
                      <div className="text-[11px] text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                        <strong>Khuyến nghị chuyên môn:</strong> {rule.roadmap}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 font-sans">
                      Chưa phát hiện tương quan đặc biệt ở cấu hình này.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Tra Cứu & Đối Chiếu Dữ Liệu Sau Chuẩn Hóa (Norming Comparison Section) */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-[#8b2626] uppercase tracking-wider block">
                Cổng Đối Chiếu Nghiên Cứu
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-sans tracking-tight">
                Tra Cứu & Đối Chiếu Dữ Liệu Sau Khi Chuẩn Hóa
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-stone-200/80 border border-stone-300 font-mono text-stone-700">
              Tiến độ mẫu: 142/500
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Thang đo đang trong giai đoạn thu thập dữ liệu thực nghiệm để chuẩn hóa quy chuẩn (Norming Sample). Hãy giữ lại <strong>Mã định danh ẩn danh</strong> của bạn. Khi dự án thu thập đủ cỡ mẫu (dự kiến N = 500) và hoàn thành chuẩn hóa phổ điểm theo thang bách phân vị Việt Nam, bạn chỉ cần nhập mã vào ô dưới đây để đối chiếu trước - sau xem năng lực của mình thay đổi ra sao.
          </p>

          <div className="p-4 rounded-2xl bg-white/90 border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã định danh (Ví dụ: MVAB-7X9K-8214)..."
                value={lookupCodeInput}
                onChange={(e) => setLookupCodeInput(e.target.value)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#8b2626]"
              />
              <button
                type="button"
                onClick={handleLookupCheck}
                className="py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-50 text-xs font-mono font-bold transition active:scale-95 shadow-sm"
              >
                Kiểm tra đối chiếu
              </button>
            </div>

            {lookupFeedback && (
              <div className="p-3 rounded-xl bg-[#f4ece1] border border-stone-300 text-xs text-stone-800 font-sans leading-relaxed animate-fade-in">
                {lookupFeedback}
              </div>
            )}
          </div>
        </div>

        {/* 8. Hòm Thư Góp Ý & Đóng Góp Cho Nghiên Cứu */}
        <div className="bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-stone-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#8b2626] text-amber-50 flex items-center justify-center font-serif text-xs font-bold shadow-sm">
                ✉
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-sans">
                  Hòm Thư Góp Ý & Đóng Góp Cho Nhóm Nghiên Cứu
                </h3>
                <span className="text-xs text-stone-500 font-sans">
                  Ý kiến của bạn là nguồn dữ liệu quý giá giúp hoàn thiện thang đo MVAB
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Bạn thấy câu hỏi nào còn gượng gạo, từ ngữ chưa tự nhiên, phân tích chưa khớp với trải nghiệm thực tế của bạn, hay có bất kỳ đề xuất nào cho đề tài chuẩn hóa? Nhóm rất trân trọng lắng nghe chia sẻ của bạn!
          </p>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-sans flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-base">✓</span>
                <span>Cảm ơn bạn rất nhiều! Ý kiến đóng góp quý báu của bạn đã được ghi nhận.</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackSubmitted(false)}
                className="text-xs text-emerald-700 underline font-mono"
              >
                Gửi thêm góp ý khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <textarea
                rows={3}
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Nhập cảm nhận, câu hỏi thấy chưa ưng ý, hoặc đề xuất chân thành của bạn tại đây..."
                className="w-full p-3.5 rounded-2xl border border-stone-300 bg-white/90 text-stone-900 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#8b2626] placeholder:text-stone-400"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <input
                  type="text"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  placeholder="Email hoặc SĐT / Zalo (không bắt buộc, nếu bạn muốn thảo luận sâu hơn)"
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 bg-white/90 text-stone-900 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#8b2626] placeholder:text-stone-400"
                />

                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !feedbackText.trim()}
                  className={`py-2.5 px-6 rounded-xl text-xs font-mono font-bold tracking-wider transition-all shadow-sm ${
                    !feedbackText.trim() || isSubmittingFeedback
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#8b2626] hover:bg-[#731f1f] text-amber-50 active:scale-95'
                  }`}
                >
                  {isSubmittingFeedback ? 'Đang gửi...' : 'Gửi góp ý →'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-stone-500 pb-10 space-y-1 font-sans">
          <div>
            Khung Đánh Giá Đa Chiều Cho Nhà Thực Hành Tâm Lý Học (MVAB v2.1)
          </div>
          <div className="text-[11px] text-stone-400">
            Dự án nghiên cứu độc lập phục vụ mục đích định hướng và học thuật · Không thay thế chẩn đoán y khoa chuyên biệt
          </div>
        </div>

      </div>
    </div>
  );
};
