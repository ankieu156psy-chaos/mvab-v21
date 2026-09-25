'use client';

import React, { useState } from 'react';
import { DimensionScores } from '@/types';

interface DongSonRadarChartProps {
  scores: DimensionScores;
}

interface AxisPoint {
  id: string;
  name: string;
  shortName: string;
  score: number; // T-Score (20 to 80)
  angle: number; // radians
  x: number;
  y: number;
}

export const DongSonRadarChart: React.FC<DongSonRadarChartProps> = ({ scores }) => {
  const [activePoint, setActivePoint] = useState<AxisPoint | null>(null);

  const size = 420;
  const center = size / 2;
  const radius = 145; // max radius for T=80
  const minT = 20;
  const maxT = 80;

  const axes = [
    { id: 'D1', name: 'Không Gian Can Thiệp', shortName: 'D1 Hệ Thống', score: scores.d1_micro_t },
    { id: 'D2', name: 'Dung Nạp Mơ Hồ', shortName: 'D2 Mơ Hồ', score: scores.d2_amb_t },
    { id: 'D3', name: 'Phong Cách Thực Hành', shortName: 'D3 Thực Hành', score: Math.round((scores.d3_emp_t + scores.d3_rel_t) / 2) },
    { id: 'D4', name: 'Định Hướng Đối Tượng', shortName: 'D4 Đối Tượng', score: Math.max(scores.d4_people_t, scores.d4_data_t) },
    { id: 'D5', name: 'Cân Bằng Thấu Cảm', shortName: 'D5 Thấu Cảm', score: scores.d5_pt_t },
    { id: 'D6', name: 'Năng Lực Tâm Thần Hóa', shortName: 'D6 Tâm Trí', score: scores.d6_rfq_t },
    { id: 'D7', name: 'Động Cơ Vị Tha', shortName: 'D7 Vị Tha', score: scores.d7_hea_t },
    { id: 'D8', name: 'Dự Phóng Nghề Nghiệp', shortName: 'D8 Tương Lai', score: scores.d8_fut_t },
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
  const circles = [0.2, 0.4, 0.6, 0.8, 1.0]; // Represents T=32, 44, 56, 68, 80

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-indigo-900/50 shadow-xl overflow-hidden">
      <div className="absolute top-3 left-4 text-xs font-mono font-bold text-indigo-300 tracking-wider uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        Biểu Đồ Radar Mạng Nhện Đông Sơn (8 Trục T-Score)
      </div>

      <svg width={size} height={size} className="overflow-visible mt-4">
        <defs>
          <radialGradient id="dongson-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#dongson-glow)" />

        {/* Concentric Geometric Rings (Dong Son Drum Motif) */}
        {circles.map((factor, idx) => {
          const r = radius * factor;
          const isOuter = idx === circles.length - 1;
          const tValue = Math.round(minT + factor * (maxT - minT));
          return (
            <g key={factor}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={isOuter ? '#6366f1' : '#334155'}
                strokeWidth={isOuter ? 1.5 : 0.8}
                strokeDasharray={isOuter ? '4 2' : '2 2'}
                opacity={isOuter ? 0.8 : 0.4}
              />
              {/* T-score benchmark label */}
              <text
                x={center + 4}
                y={center - r + 11}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
              >
                T={tValue}
              </text>
            </g>
          );
        })}

        {/* 8 Radial Spokes */}
        {points.map((p, i) => {
          const outerX = center + radius * Math.cos(p.angle);
          const outerY = center + radius * Math.sin(p.angle);
          const labelDist = radius + 24;
          const labelX = center + labelDist * Math.cos(p.angle);
          const labelY = center + labelDist * Math.sin(p.angle);

          return (
            <g key={p.id}>
              {/* Spoke line */}
              <line
                x1={center}
                y1={center}
                x2={outerX}
                y2={outerY}
                stroke="#334155"
                strokeWidth="1"
                opacity="0.6"
              />

              {/* Axis Label */}
              <text
                x={labelX}
                y={labelY + 3}
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
                className="select-none"
              >
                {p.shortName}
              </text>
            </g>
          );
        })}

        {/* Filled User Polygon */}
        <polygon
          points={polygonPath}
          fill="url(#polygon-grad)"
          stroke="#818cf8"
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Data Points (Clickable / Hoverable) */}
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={activePoint?.id === p.id ? 6 : 4}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="cursor-pointer transition-all hover:scale-125"
            onMouseEnter={() => setActivePoint(p)}
            onMouseLeave={() => setActivePoint(null)}
          />
        ))}
      </svg>

      {/* Hover Info Tooltip */}
      <div className="h-6 mt-2 text-center text-xs font-mono text-indigo-300">
        {activePoint ? (
          <span>
            {activePoint.name}: <strong className="text-white">T-Score {activePoint.score}</strong>
          </span>
        ) : (
          <span className="text-slate-400">Rê chuột vào các điểm để xem chi tiết T-score</span>
        )}
      </div>
    </div>
  );
};
