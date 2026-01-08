// src/components/JobsPerJobTypePie.tsx
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { fetchWithAuth } from "../utils/api";

type JobTypeData = { name: string; value: number };

type Props = {
  regionId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  height?: number;
  outerRadius?: number;
  innerRadius?: number;            // overrides thickness if provided
  ringStrokeColor?: string;
  centerImageSrc?: string;         // external URL supported
  ringThickness?: number;          // used when innerRadius is not set
};

const BRIGHT_COLORS = [
  "#FF3B3B", "#FF6B00", "#FFD400",
  "#28FFBF", "#00E5FF", "#4D7CFE",
  "#7A5CFF", "#FF2FB9", "#00FF85",
];

export default function JobsPerJobTypePie({
  regionId,
  customerId,
  startDate,
  endDate,
  height = 300,
  outerRadius = 110,
  innerRadius,
  ringStrokeColor = "white",
  // Public Santa (Twemoji) — replace with any image URL you like
  centerImageSrc = "https://t4.ftcdn.net/jpg/12/69/26/75/360_F_1269267524_qHMLFyFs06aQHLd2WKKqR01bakiCkpMk.jpg",
  ringThickness = 30,
}: Props) {
  const [data, setData] = useState<JobTypeData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [imgOk, setImgOk] = useState(true);

  const innerR = innerRadius ?? Math.max(outerRadius - ringThickness, 0);
  const santaSize = Math.round(outerRadius * 0.99); // auto scale to donut

  useEffect(() => {
    const run = async () => {
      const qs = new URLSearchParams();
      if (regionId) qs.append("region_id", regionId);
      if (customerId) qs.append("customer_id", customerId);
      if (startDate) qs.append("start_date", startDate);
      if (endDate) qs.append("end_date", endDate);
      try {
        const res = await fetchWithAuth(`/jobcards/stats/jobs-per-type/?${qs.toString()}`);
        const json = await res.json();
        setData(Array.isArray(json) ? (json as JobTypeData[]) : []);
      } catch (e) {
        console.error("JobsPerJobTypePie fetch error", e);
        setData([]);
      }
    };
    run();
  }, [regionId, customerId, startDate, endDate]);

  const total = useMemo(() => data.reduce((s,d)=>s+(Number(d.value)||0),0), [data]);
  const fmtInt = (n: number) => new Intl.NumberFormat().format(n);

  const shuffledColors = useMemo(() => {
    const key = data.map(d => d.name ?? "").join("|");
    const seed = hashString(key);
    return shuffleWithSeed(BRIGHT_COLORS, seed);
  }, [data]);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-100">
      <style>{`
        @keyframes intro { 0%{opacity:0; transform:scale(.96)} 100%{opacity:1; transform:scale(1)} }
        @keyframes sweep { 0%{ transform: rotate(0deg) } 100%{ transform: rotate(360deg) } }
        .intro { animation: intro .55s ease-out both; }
        .sweep {
          position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; z-index:0;
        }
        .sweep::after {
          content:"";
          width: ${(outerRadius + 24) * 2}px;
          height: ${(outerRadius + 24) * 2}px;
          border-radius:9999px;
          background: conic-gradient(
            from 0deg,
            rgba(255,255,255,0) 0deg,
            rgba(255,255,255,0) 308deg,
            rgba(255,255,255,.42) 322deg,
            rgba(255,255,255,0) 360deg
          );
          animation: sweep 3.6s linear infinite;
          mask: radial-gradient(circle at center,
            transparent ${(innerR - 4)}px,
            black ${(innerR - 2)}px,
            black ${(outerRadius + 2)}px,
            transparent ${(outerRadius + 6)}px
          );
        }
        .centerIcon { z-index: 10; }
      `}</style>

      <h2 className="text-xl font-semibold mb-3">Jobs by Type</h2>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        {/* Chart */}
        <div className="w-full md:w-1/2 relative">
          <div className="intro">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                {/* glossy gradients from shuffled neon colors */}
                <defs>
                  {data.map((_, i) => {
                    const base = shuffledColors[i % shuffledColors.length];
                    const light = lighten(base, 0.28);
                    const mid   = base;
                    const dark  = darken(base, 0.08);
                    return (
                      <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%"   stopColor={light} />
                        <stop offset="55%"  stopColor={mid} />
                        <stop offset="100%" stopColor={dark} />
                      </linearGradient>
                    );
                  })}
                </defs>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={innerR}
                  outerRadius={outerRadius}
                  paddingAngle={6}
                  label={false}
                  labelLine={false}
                  isAnimationActive
                  animationDuration={850}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`url(#grad-${i})`}
                      stroke={ringStrokeColor}
                      strokeWidth={2}
                      style={{
                        filter: `drop-shadow(0 0 10px ${hexToRgba(shuffledColors[i % shuffledColors.length], 0.5)})`,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any) => {
                    const val = Number(v) || 0;
                    const p = total ? `${((val/total)*100).toFixed(1)}%` : "0%";
                    return [`${fmtInt(val)} • ${p}`, name] as [string, string];
                  }}
                  cursor={{ fillOpacity: 0.08 }}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* rotating highlight sweep (behind icon) */}
          <div className="sweep" />

          {/* Center: external Santa (auto-sized), emoji fallback */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none centerIcon">
            {imgOk ? (
              <img
                src={centerImageSrc}
                alt="Santa with bag"
                width={santaSize}
                height={santaSize}
                style={{ width: santaSize, height: santaSize, objectFit: "contain" }}
                onError={() => setImgOk(false)}
                draggable={false}
              />
            ) : (
              <div aria-label="Santa" style={{ fontSize: santaSize * 0.6, lineHeight: 1 }} className="select-none">
                
              </div>
            )}
          </div>
        </div>

        {/* Legend inline & close */}
        <div className="w-full md:w-1/2 md:self-center md:-ml-3">
          <ul className="space-y-1.5">
            {data.map((entry, i) => {
              const v = Number(entry.value) || 0;
              const pVal = total ? Math.round((v / total) * 100) : 0;
              return (
                <li key={entry.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: shuffledColors[i % shuffledColors.length] }}
                    />
                    <span className="text-[11px] font-medium text-black truncate" title={entry.name}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-black tabular-nums shrink-0">
                    {fmtInt(v)} • {pVal}%
                  </span>
                </li>
              );
            })}
            {data.length === 0 && <li className="text-sm text-black/60">No data available</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---- Utils (shuffle, color) ---- */
function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rnd = mulberry32(seed || 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function hexToRgba(hex: string, a = 1) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c)=>c+c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function clamp(v: number, min=0, max=255) { return Math.max(min, Math.min(max, v)); }
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c=>c+c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}
function rgbToCss({r,g,b}:{r:number;g:number;b:number}) {
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}
function lighten(hex: string, factor = 0.28) {
  const {r,g,b} = hexToRgb(hex);
  return rgbToCss({
    r: r + (255 - r) * factor,
    g: g + (255 - g) * factor,
    b: b + (255 - b) * factor,
  } as any);
}
function darken(hex: string, factor = 0.08) {
  const {r,g,b} = hexToRgb(hex);
  return rgbToCss({
    r: r * (1 - factor),
    g: g * (1 - factor),
    b: b * (1 - factor),
  } as any);
}
