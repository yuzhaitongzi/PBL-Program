"use client";

import { WING_INFO } from "@/lib/project";

export type RadarSeries = {
  name: string;
  color: string;
  /** 顺序与 WING_INFO 一致：设计、工程、管理，取值 0~100 */
  values: [number, number, number];
};

const AXIS_LABEL_POS = [
  { dx: 0, dy: -1 },
  { dx: 0.9, dy: 0.55 },
  { dx: -0.9, dy: 0.55 },
];

/** 三翼能力雷达图（三条轴） */
export function WingRadar({
  series,
  size = 260,
}: {
  series: RadarSeries[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const radius = size / 2 - 52;
  const angles = [-90, 30, 150].map((d) => (d * Math.PI) / 180);

  const pointAt = (axis: number, value: number): [number, number] => {
    const d = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [cx + Math.cos(angles[axis]) * d, cy + Math.sin(angles[axis]) * d];
  };

  const ring = (value: number) =>
    angles
      .map((_, i) => pointAt(i, value).join(","))
      .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25, 50, 75, 100].map((v) => (
          <polygon
            key={v}
            points={ring(v)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}
        {angles.map((_, i) => {
          const [x, y] = pointAt(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          );
        })}

        {series.map((s) => {
          const pts = s.values
            .map((v, i) => pointAt(i, v).join(","))
            .join(" ");
          return (
            <g key={s.name}>
              <polygon
                points={pts}
                fill={s.color}
                fillOpacity={0.16}
                stroke={s.color}
                strokeWidth={2}
              />
              {s.values.map((v, i) => {
                const [x, y] = pointAt(i, v);
                return (
                  <circle key={i} cx={x} cy={y} r={3} fill={s.color} />
                );
              })}
            </g>
          );
        })}

        {WING_INFO.map((w, i) => {
          const [x, y] = pointAt(i, 118);
          const pos = AXIS_LABEL_POS[i];
          return (
            <text
              key={w.key}
              x={x + pos.dx * 16}
              y={y + pos.dy * 14}
              textAnchor={i === 0 ? "middle" : i === 1 ? "start" : "end"}
              dominantBaseline="middle"
              className="fill-slate-600"
              fontSize={12}
            >
              {w.name}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
