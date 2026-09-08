import { useId, useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';

// ─── Measure hook ────────────────────────────────────────────
function useMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

export interface Series { data: number[]; color: string; dashed?: boolean; label: string }

export function LineChart({
  series, labels, height = 180, formatY = (v) => String(Math.round(v)), area,
  highlight, events, legend,
}: {
  series: Series[]; labels: string[]; height?: number; formatY?: (v: number) => string;
  area?: boolean; highlight?: number; events?: { i: number; label: string }[]; legend?: boolean;
}) {
  const { ref, w } = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();

  const n = labels.length;
  const all = series.flatMap(s => s.data);
  const lo = Math.min(...all); const hi = Math.max(...all);
  const y0 = lo - (hi - lo) * 0.18; const y1 = hi + (hi - lo) * 0.15;

  const L = 40, R = 10, T = 12, B = 22;
  const iw = w - L - R, ih = height - T - B;
  const px = useCallback((i: number) => L + (i / (n - 1)) * iw, [iw, n]);
  const py = useCallback((v: number) => T + (1 - (v - y0) / (y1 - y0)) * ih, [y0, y1, ih]);

  const paths = useMemo(() => series.map(s => {
    const pts = s.data.map((v, i) => [px(i), py(v)] as const);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const a = `${line} L${px(n - 1).toFixed(1)},${T + ih} L${L},${T + ih} Z`;
    return { line, a };
  }), [series, px, py, n, T, ih]);

  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - r.left - L;
    const i = Math.round((x / iw) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const ticks = 4;

  return (
    <div className="relative" ref={ref}>
      {legend && (
        <div className="flex items-center gap-4 mb-1">
          {series.map(s => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <span className="w-4 h-0.5 rounded" style={{ background: s.color, ...(s.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${s.color} 0 4px, transparent 4px 7px)` } : {}) }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg width={w} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={series[0].color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={series[0].color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = y0 + ((y1 - y0) / ticks) * i;
          const y = py(v);
          return (
            <g key={i}>
              <line x1={L} x2={w - R} y1={y} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <text x={L - 6} y={y + 3} textAnchor="end" fontSize={9.5} fill="#64748B" className="tnum">{formatY(v)}</text>
            </g>
          );
        })}
        {labels.map((l, i) => (n <= 8 || i % 2 === 0) && (
          <text key={i} x={px(i)} y={height - 6} textAnchor="middle" fontSize={9.5} fill={i === highlight ? '#0F172A' : '#64748B'} fontWeight={i === highlight ? 700 : 400}>{l}</text>
        ))}
        {area && <path d={paths[0].a} fill={`url(#${gid})`} />}
        {series.map((s, si) => (
          <path key={si} d={paths[si].line} fill="none" stroke={s.color} strokeWidth={2}
            strokeDasharray={s.dashed ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {highlight != null && (
          <line x1={px(highlight)} x2={px(highlight)} y1={T} y2={T + ih} stroke="#0EA5E9" strokeWidth={1} strokeDasharray="3 4" opacity={0.65} />
        )}
        {events?.map((ev, i) => (
          <g key={i}>
            <circle cx={px(ev.i)} cy={T + 2} r={3} fill="#F59E0B" />
            <title>{ev.label}</title>
          </g>
        ))}
        {(hover ?? null) !== null && (
          <line x1={px(hover!)} x2={px(hover!)} y1={T} y2={T + ih} stroke="#CBD5E1" strokeWidth={1} />
        )}
        {hover !== null && series.map((s, si) => (
          <circle key={si} cx={px(hover)} cy={py(s.data[hover])} r={3.5} fill={s.color} stroke="#ffffff" strokeWidth={1.5} />
        ))}
      </svg>
      {hover !== null && (
        <div className="absolute pointer-events-none z-10 rounded-lg border border-slate-200 bg-white/95 backdrop-blur px-2.5 py-2 shadow-xl"
          style={{ left: Math.min(w - 130, Math.max(0, px(hover) - 55)), top: 0 }}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{labels[hover]}</p>
          {series.map((s, si) => (
            <p key={si} className="text-[11px] font-semibold tnum" style={{ color: s.color }}>
              {series.length > 1 && <span className="text-slate-500 font-medium mr-1">{s.label}</span>}
              {formatY(s.data[hover])}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────
export function Spark({ data, color = '#10B981', w = 90, h = 26, className }: { data: number[]; color?: string; w?: number; h?: number; className?: string }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${(h - 3) - ((v - lo) / Math.max(1e-6, hi - lo)) * (h - 6)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn('block', className)}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={pts.split(' ').pop()!.split(',')[1]} r={2.2} fill={color} />
    </svg>
  );
}

// ─── Donut ───────────────────────────────────────────────────
export function Donut({ segments, size = 132, thickness = 14, centerLabel, centerValue }: {
  segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={thickness} />
          {segments.map((s, i) => {
            const frac = s.value / total;
            const off = acc; acc += frac;
            return (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
                strokeDasharray={`${frac * C - 2} ${C - frac * C + 2}`} strokeDashoffset={-off * C} strokeLinecap="butt"
                className="transition-all duration-700" />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tnum text-slate-900">{centerValue}</span>
          <span className="text-[9.5px] text-slate-500 font-semibold tracking-wider uppercase">{centerLabel}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="size-2 rounded-sm" style={{ background: s.color }} />
            <span className="text-slate-600 w-20">{s.label}</span>
            <span className="font-bold tnum text-slate-900">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Column bars (baseline vs sim) ───────────────────────────
export function CompareBars({ items, className }: {
  items: { label: string; base: number; sim: number; format: (v: number) => string; invert?: boolean }[]; className?: string;
}) {
  return (
    <div className={cn('space-y-3.5', className)}>
      {items.map((it, i) => {
        const max = Math.max(it.base, it.sim);
        const up = it.sim > it.base;
        const good = it.invert ? !up : up;
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-600 font-medium">{it.label}</span>
              <span className="tnum">
                <span className="text-slate-500">{it.format(it.base)}</span>
                <span className="text-slate-500 mx-1.5">→</span>
                <span className={cn('font-bold', good ? 'text-emerald-600' : 'text-rose-600')}>{it.format(it.sim)}</span>
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-[7px] rounded bg-slate-100 overflow-hidden">
                <div className="h-full rounded bg-slate-400 transition-all duration-700" style={{ width: `${(it.base / max) * 100}%` }} />
              </div>
              <div className="h-[7px] rounded bg-slate-100 overflow-hidden">
                <div className="h-full rounded transition-all duration-700" style={{ width: `${(it.sim / max) * 100}%`, background: good ? '#10B981' : '#F43F5E' }} />
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 pt-1 text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-slate-400" /> Baseline 70%</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 rounded bg-emerald-500" /> Simulation</span>
      </div>
    </div>
  );
}
