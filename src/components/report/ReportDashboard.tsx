'use client';

import React, { useEffect, useState } from 'react';
import { useTestStore } from '@/stores/test-store';
import { evaluateCareerClusters, evaluateConfiguralRules } from '@/lib/scoring';
import { DongSonRadarChart } from './DongSonRadarChart';

export const ReportDashboard: React.FC = () => {
  const getResults = useTestStore((s) => s.getResults);
  const resetAll = useTestStore((s) => s.resetAll);
  const delayedScore = useTestStore((s) => s.delayedGratificationScore);
  const responses = useTestStore((s) => s.responses);
  const latencies = useTestStore((s) => s.latencies);

  const { scores, ierAudit } = getResults();
  const careerClusters = evaluateCareerClusters(scores);
  const configuralRules = evaluateConfiguralRules(scores);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'mocked' | 'error'>('idle');

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
          sessionId: 'USER_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide">
                HỒ SƠ ĐỊNH HƯỚNG
              </span>
              <span className="text-xs text-slate-400 font-mono">Bản chuẩn hóa v2.1</span>
              {syncStatus === 'saving' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 animate-pulse">
                  Đang lưu Google Sheets...
                </span>
              )}
              {syncStatus === 'saved' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  ✓ Đã đồng bộ Google Sheets
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Báo Cáo Năng Lực & Trục Nghề Nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khung Đánh Giá Đa Chiều Cho Nhà Thực Hành Tâm Lý Học (MVAB v2.1)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              In / Xuất PDF
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              Làm lại
            </button>
          </div>
        </div>

        {/* 1. IER Integrity Card */}
        <div
          className={`rounded-2xl p-5 border text-sm ${
            ierAudit.status === 'valid'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : ierAudit.status === 'warning'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between font-semibold mb-1">
            <span>
              {ierAudit.status === 'valid'
                ? '✓ Dữ liệu hợp thức & Độ tin cậy trắc lượng tuyệt đối'
                : ierAudit.status === 'warning'
                ? '⚠ Phát hiện 01 cờ cảnh báo chú ý phản hồi (IER)'
                : '✕ Hồ sơ có nhiều dấu hiệu trả lời thiếu nỗ lực'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/70 font-mono">
              IER Flags: {ierAudit.flags}
            </span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            {ierAudit.details.length === 0
              ? 'Không có biểu hiện click ngẫu nhiên hoặc mệt mỏi nhận thức trong 84 câu hỏi.'
              : ierAudit.details.join('; ')}
          </p>
        </div>

        {/* 2. Dong Son Radar Chart (8 Axes Visual) */}
        <DongSonRadarChart scores={scores} />

        {/* 2. Implicit Behavioral Metric (Delayed Gratification) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Chỉ số Hành vi Ngầm (Implicit Behavioral Metric)
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Mức Độ Trì Hoãn Sự Thỏa Mãn (Delayed Gratification)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
            Đo lường trực tiếp qua các quyết định tại 8 Trạm nghỉ giữa các chặng: lựa chọn kiên trì tập trung làm cho xong bài test thay vì bị cuốn vào sự tò mò tức thì.
          </p>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {delayedScore}/8
            </div>
            <div className="text-xs text-slate-500">
              {delayedScore >= 6
                ? 'Xu hướng tập trung mục tiêu cao độ, kiểm soát xung động tò mò xuất sắc.'
                : delayedScore >= 3
                ? 'Cân bằng giữa sự tò mò muốn khám phá và tính kiên định hoàn thành tác vụ.'
                : 'Nhu cầu đóng nhận thức tức thì (Need for Closure) cao, thích kiểm tra thông tin ngay lập tức.'}
            </div>
          </div>
        </div>

        {/* 3. Top Career Matches */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Khớp Nối Chuyên Môn
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
            Top 3 Cụm Nghề Nghiệp Phù Hợp Nhất
          </h3>

          <div className="space-y-4">
            {careerClusters.slice(0, 3).map((cluster, idx) => (
              <div
                key={cluster.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">
                      {cluster.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Độ tương thích: {Math.min(99, Math.max(40, cluster.match))}%
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cluster.desc}
                </p>

                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row gap-2 text-xs text-slate-500">
                  <span><strong>Pháp lý VN:</strong> {cluster.legal}</span>
                </div>
                <div className="text-[11px] text-indigo-700 font-medium">
                  <strong>Thẻ APA:</strong> {cluster.apa}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Configural Rules Evaluation */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Quy Tắc Cấu Hình Lâm Sàng
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
            Nhận Diện Lực Đẩy & Rủi Ro Nghề Nghiệp
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configuralRules.map((rule) => {
              const isTriggered = rule.triggered;
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTriggered
                      ? 'bg-white border-slate-300 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-slate-800 text-sm">{rule.name}</h5>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isTriggered
                          ? rule.type === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rule.type === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isTriggered ? 'Kích hoạt' : 'Bình thường'}
                    </span>
                  </div>

                  {isTriggered ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-600 leading-relaxed italic">
                        "{rule.feedback}"
                      </p>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                        <strong>Khuyến nghị:</strong> {rule.roadmap}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Không có dấu hiệu xung đột nhận thức ở quy tắc này.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-slate-400 pb-10">
          MVAB v2.1 Engine · Bản quyền nghiên cứu thuộc nhóm tác giả · Không thay thế chẩn đoán y khoa tâm thần
        </div>
      </div>
    </div>
  );
};
