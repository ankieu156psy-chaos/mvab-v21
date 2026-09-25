'use client';

import React, { useState } from 'react';
import { DimensionScores } from '@/types';
import { toPercentile } from '@/lib/scoring';

interface DongSonRadarChartProps {
  scores: DimensionScores;
  onSelectDimension?: (dimId: string) => void;
}

interface AxisPoint {
  id: string;
  name: string;
  shortName: string;
  score: number; // T-Score (20 to 80)
  angle: number; // radians
  x: number;
  y: number;
  desc: string;
}

export const DongSonRadarChart: React.FC<DongSonRadarChartProps> = ({ scores, onSelectDimension }) => {
  const [activePoint, setActivePoint] = useState<AxisPoint | null>(null);

  const size = 440;
  const center = size / 2;
  const radius = 145; // max radius for T=80
  const minT = 20;
  const maxT = 80;

  const axes = [
    { 
      id: 'D1', 
      name: 'Không Gian Can Thiệp', 
      shortName: 'D1 Hệ Thống', 
      score: Math.max(scores.d1_micro_t, scores.d1_meso_t, scores.d1_macro_t),
      desc: 'Quy mô can thiệp từ vi mô 1-1 đến trung mô tổ chức và vĩ mô chính sách'
    },
    { 
      id: 'D2', 
      name: 'Dung Nạp Tính Mơ Hồ', 
      shortName: 'D2 Mơ Hồ', 
      score: scores.d2_amb_t,
      desc: 'Khả năng chịu đựng sự bất định và phức tạp của các ca đa chẩn đoán'
    },
    { 
      id: 'D3', 
      name: 'Phong Cách Thực Hành', 
      shortName: 'D3 Phương Pháp', 
      score: Math.round((scores.d3_emp_t + scores.d3_rel_t) / 2),
      desc: 'Sự kết hợp giữa căn cứ thực nghiệm khoa học và liên minh trị liệu nhân văn'
    },
    { 
      id: 'D4', 
      name: 'Định Hướng Đối Tượng', 
      shortName: 'D4 Tác Nghiệp', 
      score: Math.max(scores.d4_people_t, scores.d4_data_t),
      desc: 'Thiên hướng làm việc với Con người, Dữ liệu hay Công cụ kỹ thuật'
    },
    { 
      id: 'D5', 
      name: 'Cân Bằng Thấu Cảm', 
      shortName: 'D5 Thấu Cảm', 
      score: scores.d5_pt_t,
      desc: 'Khả năng đồng cảm nhận thức mà vẫn giữ vững ranh giới tự ngã'
    },
    { 
      id: 'D6', 
      name: 'Năng Lực Tâm Thần Hóa', 
      shortName: 'D6 Tâm Trí', 
      score: scores.d6_rfq_t,
      desc: 'Nhận thức sâu sắc rằng tâm trí luôn biến động và mờ đục'
    },
    { 
      id: 'D7', 
      name: 'Động Cơ Vị Tha', 
      shortName: 'D7 Vị Tha', 
      score: scores.d7_hea_t,
      desc: 'Động lực cống hiến vì cộng đồng đi kèm bảo vệ nội lực bền vững'
    },
    { 
      id: 'D8', 
      name: 'Dự Phóng Nghề Nghiệp', 
      shortName: 'D8 Tương Lai', 
      score: scores.d8_fut_t,
      desc: 'Tầm nhìn dài hạn và niềm tin tự hiệu năng trước lộ trình đào tạo'
    },
  ];

  const totalAxes = axes.length;

  // Calculate points
  const points: AxisPoint[] = axes.map((axis, i) => {
    const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
    // Map T-Score [20..80] to [0.1..1.0] of radius
    const normalized = Math.max(0.1, Math.min(1.0, (axis.score - minT) / (maxT - minT)));
    const r = normalized * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { ...axis, angle, x, y };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Concentric Dong Son circles
  const circles = [0.2, 0.4, 0.5, 0.6, 0.8, 1.0]; // Represents T=32, 44, 50 (mean), 56, 68, 80

  const handlePointClick = (p: AxisPoint) => {
    setActivePoint(activePoint?.id === p.id ? null : p);
    if (onSelectDimension) {
      onSelectDimension(p.id);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-[#faf6ee]/95 backdrop-blur-md rounded-3xl border border-stone-300/90 shadow-sm overflow-hidden text-stone-800">
      
      {/* Header bar matching Dó paper aesthetics */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200/80 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#8b2626] text-amber-50 flex items-center justify-center font-serif text-xs font-bold shadow-sm">
            ĐS
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-sans text-stone-900 uppercase tracking-wider">
              Biểu Đồ Bát Trục Đông Sơn (Phổ Điểm Chuẩn T-Score)
            </h3>
            <span className="text-[11px] text-stone-500 font-sans block">
              M=50, SD=10 · Nhấp vào từng điểm để xem phân tích chi tiết
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-200/70 border border-stone-300 text-stone-700">
          8 Trục Năng Lực
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible my-2">
        <defs>
          <radialGradient id="parchment-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdfbf7" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#f4ece1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#faf6ee" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="ink-polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b2626" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#parchment-glow)" />

        {/* Traditional Dong Son Central 8-Point Star Motif */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (Math.PI * 2 / 8) * i;
          const starLen = 22;
          const starX = center + starLen * Math.cos(angle);
          const starY = center + starLen * Math.sin(angle);
          return (
            <line
              key={`star-${i}`}
              x1={center}
              y1={center}
              x2={starX}
              y2={starY}
              stroke="#b45309"
              strokeWidth="1.2"
              opacity="0.4"
            />
          );
        })}
        <circle cx={center} cy={center} r={7} fill="#b45309" opacity="0.15" />
        <circle cx={center} cy={center} r={3} fill="#8b2626" opacity="0.6" />

        {/* Concentric Geometric Rings (Dong Son Drum Motif) */}
        {circles.map((factor, idx) => {
          const r = radius * factor;
          const isOuter = idx === circles.length - 1;
          const isMean = Math.abs(factor - 0.5) < 0.01;
          const tValue = Math.round(minT + factor * (maxT - minT));
          return (
            <g key={factor}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={isOuter ? '#78716c' : isMean ? '#8b2626' : '#a8a29e'}
                strokeWidth={isOuter ? 1.5 : isMean ? 1.2 : 0.7}
                strokeDasharray={isOuter ? '5 3' : isMean ? '4 2' : '2 2'}
                opacity={isOuter ? 0.7 : isMean ? 0.6 : 0.35}
              />
              {/* T-score benchmark label */}
              <text
                x={center + 4}
                y={center - r + 10}
                fill={isMean ? '#8b2626' : '#78716c'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight={isMean ? 'bold' : 'normal'}
              >
                {isMean ? 'T=50 (Chuẩn)' : `T=${tValue}`}
              </text>
            </g>
          );
        })}

        {/* 8 Radial Spokes */}
        {points.map((p) => {
          const outerX = center + radius * Math.cos(p.angle);
          const outerY = center + radius * Math.sin(p.angle);
          const labelDist = radius + 26;
          const labelX = center + labelDist * Math.cos(p.angle);
          const labelY = center + labelDist * Math.sin(p.angle);
          const isSelected = activePoint?.id === p.id;

          return (
            <g key={p.id}>
              {/* Spoke line */}
              <line
                x1={center}
                y1={center}
                x2={outerX}
                y2={outerY}
                stroke="#a8a29e"
                strokeWidth="1"
                opacity="0.45"
              />

              {/* Axis Label */}
              <text
                x={labelX}
                y={labelY + 4}
                fill={isSelected ? '#8b2626' : '#292524'}
                fontSize="11"
                fontWeight={isSelected ? 'bold' : '600'}
                textAnchor="middle"
                className="select-none transition-colors duration-200"
              >
                {p.shortName}
              </text>
            </g>
          );
        })}

        {/* Filled User Polygon in Vermilion Wash */}
        <polygon
          points={polygonPath}
          fill="url(#ink-polygon-grad)"
          stroke="#8b2626"
          strokeWidth="2.2"
          className="transition-all duration-500 ease-out"
        />

        {/* Data Points (Clickable / Hoverable with larger invisible hit area) */}
        {points.map((p) => {
          const isSelected = activePoint?.id === p.id;
          return (
            <g key={p.id} className="cursor-pointer">
              {/* Invisible Hit Area (Radius 18px) to prevent flicker */}
              <circle
                cx={p.x}
                cy={p.y}
                r={18}
                fill="transparent"
                onClick={() => handlePointClick(p)}
                onMouseEnter={() => setActivePoint(p)}
              />

              {/* Pulsing ring when active */}
              {isSelected && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={10}
                  fill="none"
                  stroke="#8b2626"
                  strokeWidth="1.5"
                  opacity={0.8}
                  className="animate-ping"
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                />
              )}

              {/* Visible Data Point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4.5}
                fill={isSelected ? '#8b2626' : '#b45309'}
                stroke="#faf6ee"
                strokeWidth={isSelected ? 2 : 1.5}
                className="pointer-events-none transition-all duration-200"
              />
            </g>
          );
        })}
      </svg>

      {/* Info Tooltip / Selected Point Info Bar */}
      <div className="w-full mt-2 p-3 rounded-2xl bg-[#f4ece1] border border-stone-300 text-xs text-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
        {activePoint ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-stone-900 font-sans">
              [{activePoint.id}] {activePoint.name}:
            </span>
            <span className="font-mono px-2 py-0.5 rounded bg-white font-bold text-[#8b2626] border border-stone-200">
              T-Score: {activePoint.score} (Phân vị ~{toPercentile(activePoint.score)}%)
            </span>
            <span className="text-[11px] text-stone-600 font-sans hidden md:inline">
              — {activePoint.desc}
            </span>
          </div>
        ) : (
          <div className="text-center w-full text-stone-500 font-sans text-xs flex items-center justify-center gap-2">
            <span>👆 Rê chuột hoặc chạm vào các điểm mút trên biểu đồ để xem chi tiết từng trục năng lực</span>
          </div>
        )}
      </div>
    </div>
  );
};
